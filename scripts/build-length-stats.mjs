import fs from "node:fs/promises";
import path from "node:path";

const SOURCE_DIR = path.join(process.cwd(), "dictionary", "generated");
const OUTPUT_PATH = path.join(process.cwd(), "data", "length-stats.json");

const VOWELS = new Set(["A", "E", "I", "O", "U", "Y"]);
const DIACRITICS_REGEX = /[\u0300-\u036f]/g;

const normalizeWord = (word) =>
  word
    .normalize("NFD")
    .replace(DIACRITICS_REGEX, "")
    .toUpperCase();

const toUnique = (words) => Array.from(new Set(words));

const countLetters = (words) => {
  const counts = new Map();
  let total = 0;

  words.forEach((word) => {
    const normalized = normalizeWord(word);
    for (const letter of normalized) {
      total += 1;
      counts.set(letter, (counts.get(letter) || 0) + 1);
    }
  });

  const topLetters = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([letter, count]) => ({
      letter,
      share: Number((count / total).toFixed(4)),
    }));

  return { topLetters };
};

const countEndings = (words, size, limit = 5) => {
  const counts = new Map();
  words.forEach((word) => {
    const normalized = normalizeWord(word);
    const ending = normalized.slice(-size);
    if (ending.length === size) {
      counts.set(ending, (counts.get(ending) || 0) + 1);
    }
  });

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([ending, count]) => ({
      ending,
      share: Number((count / words.length).toFixed(4)),
    }));
};

const computeWordStats = (words) => {
  const normalizedWords = words.map(normalizeWord);

  let vowelTotal = 0;
  let duplicateTotal = 0;

  normalizedWords.forEach((word) => {
    let vowels = 0;
    const seen = new Set();
    let hasDuplicate = false;

    for (const letter of word) {
      if (VOWELS.has(letter)) {
        vowels += 1;
      }
      if (seen.has(letter)) {
        hasDuplicate = true;
      }
      seen.add(letter);
    }

    vowelTotal += vowels;
    if (hasDuplicate) {
      duplicateTotal += 1;
    }
  });

  const vowelAverage = Number((vowelTotal / normalizedWords.length).toFixed(2));
  const duplicateRate = Number((duplicateTotal / normalizedWords.length).toFixed(4));

  return {
    wordCount: words.length,
    vowelAverage,
    duplicateRate,
    ...countLetters(words),
    commonEndings2: countEndings(words, 2),
    commonEndings3: countEndings(words, 3),
  };
};

const pickStarterWords = (words, topLetters, limit = 6) => {
  const frequencyMap = new Map(topLetters.map(({ letter, share }) => [letter, share]));

  const scored = words.map((word) => {
    const normalized = normalizeWord(word);
    const uniqueLetters = new Set(normalized);
    let score = 0;

    uniqueLetters.forEach((letter) => {
      score += frequencyMap.get(letter) || 0;
    });

    return { word, score };
  });

  return scored
    .sort((a, b) => b.score - a.score || a.word.localeCompare(b.word))
    .slice(0, limit)
    .map(({ word }) => word);
};

const buildStatsForLength = (length, data) => {
  const answers = toUnique(data.answers ?? data.answer ?? []);
  const allow = toUnique(data.guesses ?? data.allow ?? []);
  const combined = toUnique([...answers, ...allow]);

  const answerStats = computeWordStats(answers);
  const allStats = computeWordStats(combined);

  return {
    length,
    answers: {
      ...answerStats,
      starterWords: pickStarterWords(answers, answerStats.topLetters),
    },
    all: {
      ...allStats,
      allowCount: allow.length,
    },
  };
};

const run = async () => {
  const entries = await fs.readdir(SOURCE_DIR);
  const files = entries.filter((file) => file.endsWith(".json"));

  const result = {};

  for (const file of files) {
    const fullPath = path.join(SOURCE_DIR, file);
    const content = JSON.parse(await fs.readFile(fullPath, "utf8"));
    const length = content.length;
    result[length] = buildStatsForLength(length, content);
  }

  const ordered = Object.keys(result)
    .sort((a, b) => Number(a) - Number(b))
    .reduce((acc, key) => {
      acc[key] = result[key];
      return acc;
    }, {});

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(ordered, null, 2));
  console.log(`Wrote ${OUTPUT_PATH}`);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
