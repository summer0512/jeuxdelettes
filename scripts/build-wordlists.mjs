#!/usr/bin/env node
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const SOURCE_DIR = path.join(ROOT_DIR, "dictionary", "fr-wordlists");
const ANSWER_DIR = path.join(SOURCE_DIR, "answer");
const OUTPUT_DIR = path.join(ROOT_DIR, "dictionary", "generated");
const SUPPORTED_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11];

const args = process.argv.slice(2);
const modeArg = args
  .find((arg) => arg.startsWith("--mode="))
  ?.split("=")[1]
  ?.toLowerCase();
const STUB_MODE = args.includes("--stub") || modeArg === "stub";

const COMBINING_MARKS = /[\u0300-\u036f]/g;

const log = (...args) => console.log("[build-wordlists]", ...args);
const error = (...args) => console.error("[build-wordlists]", ...args);

const ensureDirectory = async (dirPath) => {
  await mkdir(dirPath, { recursive: true });
};

const stripDiacritics = (word) =>
  word.normalize("NFD").replace(COMBINING_MARKS, "");

const normalizeKey = (word) => stripDiacritics(word).toLowerCase();

const hasDiacritics = (word) => stripDiacritics(word) !== word;

const readWordFile = async (filePath) => {
  const contents = await readFile(filePath, "utf8");
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((word) => word.toUpperCase());
};

const uniqueSorted = (words) => Array.from(new Set(words)).sort();

const registerWord = (word, accentMap) => {
  const canonical = word.toUpperCase();
  const normalized = normalizeKey(canonical);
  const existing = accentMap.get(normalized);
  if (!existing || (!hasDiacritics(existing) && hasDiacritics(canonical))) {
    accentMap.set(normalized, canonical);
  }
};

const buildWordListForLength = async (length) => {
  const paddedLength = length.toString().padStart(2, "0");
  let payload;

  if (STUB_MODE) {
    payload = {
      length,
      allow: [],
      answer: [],
      accentMap: {},
    };
  } else {
    const guessesPath = path.join(SOURCE_DIR, `${paddedLength}.txt`);
    const answersPath = path.join(ANSWER_DIR, `${paddedLength}.txt`);

    if (!existsSync(guessesPath) || !existsSync(answersPath)) {
      log(
        `[skip] Missing source files for length ${length}. Run the generator to create ${guessesPath} and ${answersPath}.`
      );
      return;
    }

    const guesses = uniqueSorted(await readWordFile(guessesPath));
    const answers = uniqueSorted(await readWordFile(answersPath));

    const accentMap = new Map();
    guesses.forEach((word) => registerWord(word, accentMap));
    answers.forEach((word) => registerWord(word, accentMap));

    payload = {
      length,
      allow: guesses,
      answer: answers,
      accentMap: Object.fromEntries(
        Array.from(accentMap.entries()).sort((a, b) =>
          a[0].localeCompare(b[0], "fr")
        )
      ),
    };
  }

  const targetPath = path.join(OUTPUT_DIR, `${paddedLength}.json`);
  await writeFile(targetPath, JSON.stringify(payload));
  const modeLabel = STUB_MODE ? "stub" : "full";
  log(`[${modeLabel}] Wrote ${targetPath}`);
};

const main = async () => {
  await ensureDirectory(OUTPUT_DIR);
  if (!STUB_MODE) {
    if (!existsSync(SOURCE_DIR) || !existsSync(ANSWER_DIR)) {
      log(
        "Source word lists not found; skipping rebuild. Run the generator script if you need local dictionaries."
      );
      return;
    }
  }
  for (const length of SUPPORTED_LENGTHS) {
    await buildWordListForLength(length);
  }
  log("Word list generation complete.");
};

main().catch((err) => {
  error(err);
  process.exitCode = 1;
});
