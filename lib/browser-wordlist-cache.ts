import type { SupportedWordLength } from "./wordLengths";
import type { WordListJson } from "./wordlist-json";

type WordListCacheRecord = {
  key: string;
  length: SupportedWordLength;
  updatedAt: string;
  payload: WordListJson;
};

const DB_NAME = "sutom-wordlists";
const DB_VERSION = 3;
const STORE_NAME = "wordlists";

const KEY_PREFIX = "length:";

const supportsIndexedDb = (): boolean =>
  typeof window !== "undefined" && "indexedDB" in window;

const buildKey = (length: SupportedWordLength): string =>
  `${KEY_PREFIX}${length.toString().padStart(2, "0")}`;

let dbPromise: Promise<IDBDatabase> | null = null;

const openDatabase = (): Promise<IDBDatabase> => {
  if (!supportsIndexedDb()) {
    return Promise.reject(
      new Error("IndexedDB is not available in this environment.")
    );
  }

  if (dbPromise) {
    return dbPromise;
  }

  dbPromise = new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains(STORE_NAME)) {
        db.deleteObjectStore(STORE_NAME);
      }
      db.createObjectStore(STORE_NAME, { keyPath: "key" });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(request.error ?? new Error("Failed to open IndexedDB."));
  });

  return dbPromise;
};

const executeTransaction = async <T>(
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> => {
  const db = await openDatabase();
  return new Promise<T>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, mode);
    const store = transaction.objectStore(STORE_NAME);
    const request = operation(store);

    request.onsuccess = () => resolve(request.result as T);
    request.onerror = () =>
      reject(request.error ?? new Error("IndexedDB request failed."));
  });
};

export const loadWordListFromIndexedDb = async (
  length: SupportedWordLength
): Promise<WordListJson | null> => {
  if (!supportsIndexedDb()) {
    return null;
  }

  try {
    const key = buildKey(length);
    const record = (await executeTransaction<WordListCacheRecord | undefined>(
      "readonly",
      (store) => store.get(key)
    )) ?? null;

    return record?.payload ?? null;
  } catch (error) {
    console.warn(
      `[wordlists] Failed to read IndexedDB cache for length ${length}:`,
      error
    );
    return null;
  }
};

export const saveWordListToIndexedDb = async (
  length: SupportedWordLength,
  payload: WordListJson
): Promise<void> => {
  if (!supportsIndexedDb()) {
    return;
  }

  try {
    const record: WordListCacheRecord = {
      key: buildKey(length),
      length,
      payload,
      updatedAt: new Date().toISOString(),
    };

    await executeTransaction("readwrite", (store) => store.put(record));
  } catch (error) {
    console.warn(
      `[wordlists] Failed to persist word list ${length} in IndexedDB:`,
      error
    );
  }
};

export const clearWordListFromIndexedDb = async (
  length: SupportedWordLength
): Promise<void> => {
  if (!supportsIndexedDb()) {
    return;
  }

  try {
    await executeTransaction("readwrite", (store) =>
      store.delete(buildKey(length))
    );
  } catch (error) {
    console.warn(
      `[wordlists] Failed to clear IndexedDB entry for ${length}:`,
      error
    );
  }
};
