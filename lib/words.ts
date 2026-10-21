import { loadWordListFromIndexedDb, saveWordListToIndexedDb } from "./browser-wordlist-cache";
import type { WordListJson } from "./wordlist-json";
import type { SupportedWordLength } from "./wordLengths";
import { SUPPORTED_WORD_LENGTHS } from "./wordLengths";
import { getDaysSinceEpochInTimeZone } from "./timezone";

const LOCAL_WORDLISTS_ENABLED =
  typeof process !== "undefined" &&
  (process.env.SUTOM_USE_LOCAL_WORDLISTS === "true" ||
    process.env.NEXT_PUBLIC_USE_LOCAL_WORDLISTS === "true" ||
    process.env.NODE_ENV !== "production");

const COMBINING_MARKS_REGEX = /[\u0300-\u036f]/g;

export const MAX_GUESSES = 6;

export type WordListData = {
  length: SupportedWordLength;
  guesses: string[];
  answers: string[];
  guessSet: Set<string>;
  normalizedToCanonical: Map<string, string>;
};

const cache = new Map<SupportedWordLength, Promise<WordListData>>();

const hasDiacritics = (word: string): boolean =>
  stripDiacritics(word) !== word;

type FsPromisesModule = typeof import("node:fs/promises");
type PathModule = typeof import("node:path");

let fsModulePromise: Promise<FsPromisesModule> | null = null;
let pathModulePromise: Promise<PathModule> | null = null;
let localDirectoryPromise: Promise<string> | null = null;

const loadFsModule = (): Promise<FsPromisesModule> => {
  if (!fsModulePromise) {
    fsModulePromise = Function(
      "return import('node:fs/promises')"
    )() as Promise<FsPromisesModule>;
  }
  return fsModulePromise;
};

const loadPathModule = (): Promise<PathModule> => {
  if (!pathModulePromise) {
    pathModulePromise = Function(
      "return import('node:path')"
    )() as Promise<PathModule>;
  }
  return pathModulePromise;
};

const resolveLocalWordListDirectory = async (): Promise<string> => {
  if (!localDirectoryPromise) {
    localDirectoryPromise = (async () => {
      const pathModule = await loadPathModule();
      const configured = process.env.SUTOM_LOCAL_WORDLIST_DIR?.trim();
      if (configured) {
        return pathModule.isAbsolute(configured)
          ? configured
          : pathModule.join(process.cwd(), configured);
      }
      return pathModule.join(process.cwd(), "dictionary", "generated");
    })();
  }
  return localDirectoryPromise;
};

const wordListHasEntries = (source: WordListJson): boolean => {
  const guesses = source.guesses ?? source.allow ?? [];
  const answers = source.answers ?? source.answer ?? [];
  return guesses.length > 0 || answers.length > 0;
};

const normalizeLoaderData = (
  length: SupportedWordLength,
  source: WordListJson
): WordListData => {
  if (source.length !== length) {
    throw new Error(`Word list length mismatch: expected ${length}, received ${source.length}`);
  }

  const sourceGuesses = source.guesses ?? source.allow ?? [];
  const sourceAnswers = source.answers ?? source.answer ?? [];

  const guesses = sourceGuesses.map((word) => word.toUpperCase());
  const answers = sourceAnswers.map((word) => word.toUpperCase());
  const guessSet = new Set<string>();
  const normalizedToCanonical = new Map<string, string>();

  if (source.accentMap) {
    Object.entries(source.accentMap).forEach(([normalized, canonical]) => {
      if (typeof normalized === "string" && typeof canonical === "string") {
        normalizedToCanonical.set(normalized, canonical.toUpperCase());
      }
    });
  }

  const registerWord = (word: string) => {
    const canonical = word.toUpperCase();
    const normalized = normalizeWordInsensitive(canonical);
    const existing = normalizedToCanonical.get(normalized);

    if (!existing) {
      normalizedToCanonical.set(normalized, canonical);
    } else if (!hasDiacritics(existing) && hasDiacritics(canonical)) {
      normalizedToCanonical.set(normalized, canonical);
    }

    guessSet.add(canonical);
  };

  guesses.forEach(registerWord);
  answers.forEach(registerWord);

  return {
    length,
    guesses,
    answers,
    guessSet,
    normalizedToCanonical,
  };
};

export const stripDiacritics = (word: string): string =>
  word.normalize("NFD").replace(COMBINING_MARKS_REGEX, "");

export const normalizeWordInsensitive = (word: string): string =>
  stripDiacritics(word).toLowerCase();

export const ensureSupportedLength = (length: number): SupportedWordLength => {
  if (!SUPPORTED_WORD_LENGTHS.includes(length as SupportedWordLength)) {
    throw new Error(`Unsupported word length: ${length}`);
  }
  return length as SupportedWordLength;
};

const kvKeyForLength = (length: SupportedWordLength): string =>
  `wordlists/${length.toString().padStart(2, "0")}.json`;

type CloudflareKVNamespace = {
  get: (
    key: string,
    options?: { type: "text" | "json" | "arrayBuffer" }
  ) => Promise<unknown>;
};

let cachedKvNamespace: CloudflareKVNamespace | null | undefined;

const extractKvNamespace = (
  env: unknown,
  bindingName: string = "SUTOM"
): CloudflareKVNamespace | null => {
  if (!env || typeof env !== "object") {
    return null;
  }
  const record = env as Record<string, unknown>;
  const candidate = record[bindingName];
  if (
    candidate &&
    typeof candidate === "object" &&
    "get" in candidate &&
    typeof (candidate as { get?: unknown }).get === "function"
  ) {
    return candidate as CloudflareKVNamespace;
  }
  return null;
};

const WORDLIST_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_WORDLIST_ENDPOINT
    ? process.env.NEXT_PUBLIC_WORDLIST_ENDPOINT
    : "/api/wordlists";

const SERVER_WORDLIST_API_BASE =
  typeof process !== "undefined"
    ? process.env.SUTOM_WORDLIST_HTTP_ENDPOINT ?? process.env.NEXT_PUBLIC_WORDLIST_ENDPOINT
    : undefined;

const isBrowser = (): boolean =>
  typeof window !== "undefined" && typeof window.document !== "undefined";

const isWordListJson = (value: unknown): value is WordListJson => {
  if (!value || typeof value !== "object") {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  const isStringArray = (input: unknown): input is string[] =>
    Array.isArray(input) && input.every((item) => typeof item === "string");
  const hasGuesses = isStringArray(candidate.guesses) || isStringArray(candidate.allow);
  const hasAnswers = isStringArray(candidate.answers) || isStringArray(candidate.answer);
  return (
    typeof candidate.length === "number" &&
    hasGuesses &&
    hasAnswers
  );
};

const LOCAL_WORDLIST_API_BASE =
  typeof process !== "undefined" && process.env.NEXT_PUBLIC_LOCAL_WORDLIST_ENDPOINT
    ? process.env.NEXT_PUBLIC_LOCAL_WORDLIST_ENDPOINT
    : "/api/local-wordlists";

const loadWordListFromLocal = async (
  length: SupportedWordLength
): Promise<WordListJson> => {
  if (!LOCAL_WORDLISTS_ENABLED) {
    throw new Error("Local word lists are disabled");
  }

  if (isBrowser()) {
    const localJson = await fetchWordListViaHttp(
      length,
      LOCAL_WORDLIST_API_BASE
    );
    if (localJson) {
      return localJson;
    }
    throw new Error(`Failed to load local dictionary for length ${length}`);
  }

  const [fsModule, pathModule, directory] = await Promise.all([
    loadFsModule(),
    loadPathModule(),
    resolveLocalWordListDirectory(),
  ]);

  const filename = `${length.toString().padStart(2, "0")}.json`;
  const filePath = pathModule.join(directory, filename);
  const raw = await fsModule.readFile(filePath, "utf8");
  const { length: parsedLength, ...rest } = JSON.parse(raw) as WordListJson;
  return {
    length,
    ...rest,
  };
};

const tryLoadLocalWordList = async (
  length: SupportedWordLength
): Promise<WordListJson | null> => {
  if (!LOCAL_WORDLISTS_ENABLED) {
    return null;
  }

  try {
    const localJson = await loadWordListFromLocal(length);
    if (wordListHasEntries(localJson)) {
      return localJson;
    }
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[wordlists] Local dictionary for length ${length} is empty; falling back to remote sources.`
      );
    }
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[wordlists] Failed to load local dictionary for length ${length}:`,
        error
      );
    }
  }

  return null;
};

const resolveCloudflareKvNamespace = async (): Promise<CloudflareKVNamespace | null> => {
  if (isBrowser()) {
    return null;
  }

  if (cachedKvNamespace !== undefined) {
    return cachedKvNamespace;
  }

  try {
    const contextSymbol = Symbol.for("__cloudflare-context__");
    const context = (globalThis as any)[contextSymbol];
    const kvNamespace = extractKvNamespace(context?.env);
    if (kvNamespace) {
      cachedKvNamespace = kvNamespace;
      return cachedKvNamespace;
    }
  } catch {
    // ignore and continue
  }

  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const context = await getCloudflareContext({ async: true });
    const kvNamespace = extractKvNamespace(context?.env);
    if (kvNamespace) {
      cachedKvNamespace = kvNamespace;
      return cachedKvNamespace;
    }
  } catch {
    // ignore and fall back
  }

  cachedKvNamespace = null;
  return null;
};

const loadWordListFromKV = async (
  length: SupportedWordLength
): Promise<WordListJson | null> => {
  const kv = await resolveCloudflareKvNamespace();
  if (!kv) {
    return null;
  }

  try {
    const result = await kv.get(kvKeyForLength(length), {
      type: "json",
    });
    if (isWordListJson(result)) {
      return result;
    }
  } catch (error) {
    console.warn(
      `[wordlists] Failed to read from Cloudflare KV for length ${length}:`,
      error
    );
  }

  return null;
};

const fetchWordListViaHttp = async (
  length: SupportedWordLength,
  baseUrl: string | undefined
): Promise<WordListJson | null> => {
  if (!baseUrl) {
    return null;
  }

  const normalizedBase = baseUrl.endsWith("/")
    ? baseUrl.slice(0, -1)
    : baseUrl;
  const url = `${normalizedBase}/${length.toString().padStart(2, "0")}`;

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      return null;
    }
    const json = await response.json();
    if (isWordListJson(json)) {
      return json;
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn(`[wordlists] HTTP fetch failed for ${url}:`, error);
    }
  }

  return null;
};

const loadWordListInternal = async (
  length: SupportedWordLength
): Promise<WordListData> => {
  if (isBrowser()) {
    const localJson = await tryLoadLocalWordList(length);
    if (localJson) {
      if (wordListHasEntries(localJson)) {
        await saveWordListToIndexedDb(length, localJson);
      }
      return normalizeLoaderData(length, localJson);
    }

    const cachedJson = await loadWordListFromIndexedDb(length);
    if (cachedJson && wordListHasEntries(cachedJson)) {
      return normalizeLoaderData(length, cachedJson);
    }

    const remoteJson = await fetchWordListViaHttp(length, WORDLIST_API_BASE);
    if (remoteJson && wordListHasEntries(remoteJson)) {
      await saveWordListToIndexedDb(length, remoteJson);
      return normalizeLoaderData(length, remoteJson);
    }

    const fallbackLocal = await tryLoadLocalWordList(length);
    if (fallbackLocal) {
      if (wordListHasEntries(fallbackLocal)) {
        await saveWordListToIndexedDb(length, fallbackLocal);
      }
      return normalizeLoaderData(length, fallbackLocal);
    }

    throw new Error(`Unable to resolve word list for length ${length}`);
  }

  const localJson = await tryLoadLocalWordList(length);
  if (localJson) {
    return normalizeLoaderData(length, localJson);
  }

  const kvJson = await loadWordListFromKV(length);
  if (kvJson && wordListHasEntries(kvJson)) {
    return normalizeLoaderData(length, kvJson);
  }

  const httpJson = await fetchWordListViaHttp(
    length,
    SERVER_WORDLIST_API_BASE
  );
  if (httpJson && wordListHasEntries(httpJson)) {
    return normalizeLoaderData(length, httpJson);
  }

  throw new Error(`Unable to resolve word list for length ${length}`);
};

export const loadWordList = (
  length: SupportedWordLength
): Promise<WordListData> => {
  if (!cache.has(length)) {
    cache.set(length, loadWordListInternal(length));
  }

  return cache.get(length)!;
};

export const clearWordListCache = (): void => {
  cache.clear();
};

export const canonicalizeGuess = (
  word: string,
  wordData: WordListData
): string | null => {
  const normalized = normalizeWordInsensitive(word);
  return wordData.normalizedToCanonical.get(normalized) ?? null;
};

export const isWordInWordList = (
  word: string,
  wordData: WordListData
): boolean => canonicalizeGuess(word, wordData) !== null;

export const getWordOfDay = (
  wordData: WordListData,
  referenceDate: Date = new Date(),
  variant: "fixed" | "free" = "fixed"
): string => {
  if (wordData.answers.length === 0) {
    throw new Error(`Answer list for length ${wordData.length} is empty`);
  }

  const dayIndex =
    getDaysSinceEpochInTimeZone(referenceDate) % wordData.answers.length;
  const offset =
    variant === "free"
      ? Math.max(1, Math.floor(wordData.answers.length / 2))
      : 0;
  const index = (dayIndex + offset) % wordData.answers.length;
  return wordData.answers[index];
};

export const getRandomWord = (wordData: WordListData): string => {
  const pool = wordData.answers.length > 0 ? wordData.answers : wordData.guesses;
  if (pool.length === 0) {
    throw new Error(`Word list for length ${wordData.length} is empty`);
  }
  const randomIndex = Math.floor(Math.random() * pool.length);
  return pool[randomIndex];
};
