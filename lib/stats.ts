import { MAX_GUESSES } from "./words";
import type { SupportedWordLength } from "./wordLengths";

export interface GuessDistribution {
  [attempt: string]: number;
}

export interface StoredStats {
  totalGames: number;
  victories: number;
  currentStreak: number;
  maxStreak: number;
  guessDistribution: GuessDistribution;
  failCount: number;
  recordedGameIds: string[];
}

export interface RecordGameParams {
  gameId: string;
  won: boolean;
  guesses: number;
}

const STATS_STORAGE_PREFIX = "sutom-stats";

const getStorageKey = (length: SupportedWordLength): string =>
  `${STATS_STORAGE_PREFIX}-${length}`;

export const createDefaultGuessDistribution = (
  maxAttempts: number = MAX_GUESSES
): GuessDistribution => {
  const distribution: GuessDistribution = {};
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    distribution[String(attempt)] = 0;
  }
  return distribution;
};

export const createDefaultStats = (
  maxAttempts: number = MAX_GUESSES
): StoredStats => ({
  totalGames: 0,
  victories: 0,
  currentStreak: 0,
  maxStreak: 0,
  guessDistribution: createDefaultGuessDistribution(maxAttempts),
  failCount: 0,
  recordedGameIds: [],
});

const cloneStats = (stats: StoredStats): StoredStats => ({
  totalGames: stats.totalGames,
  victories: stats.victories,
  currentStreak: stats.currentStreak,
  maxStreak: stats.maxStreak,
  guessDistribution: { ...stats.guessDistribution },
  failCount: stats.failCount,
  recordedGameIds: [...stats.recordedGameIds],
});

export const loadStats = (
  length: SupportedWordLength,
  maxAttempts: number = MAX_GUESSES
): StoredStats => {
  if (typeof window === "undefined") {
    return cloneStats(createDefaultStats(maxAttempts));
  }

  const key = getStorageKey(length);

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return cloneStats(createDefaultStats(maxAttempts));
    }

    const parsed = JSON.parse(raw) as Partial<StoredStats>;
    const base = createDefaultStats(maxAttempts);

    const guessDistribution = {
      ...base.guessDistribution,
      ...(parsed.guessDistribution ?? {}),
    } as GuessDistribution;

    const recordedGameIds = Array.isArray(parsed.recordedGameIds)
      ? parsed.recordedGameIds.filter(
          (id): id is string => typeof id === "string"
        )
      : [];

    return {
      totalGames:
        typeof parsed.totalGames === "number" ? parsed.totalGames : base.totalGames,
      victories:
        typeof parsed.victories === "number" ? parsed.victories : base.victories,
      currentStreak:
        typeof parsed.currentStreak === "number"
          ? parsed.currentStreak
          : base.currentStreak,
      maxStreak:
        typeof parsed.maxStreak === "number" ? parsed.maxStreak : base.maxStreak,
      guessDistribution,
      failCount:
        typeof parsed.failCount === "number" ? parsed.failCount : base.failCount,
      recordedGameIds,
    };
  } catch (error) {
    console.error("Failed to load stats from localStorage:", error);
    return cloneStats(createDefaultStats(maxAttempts));
  }
};

export const saveStats = (
  length: SupportedWordLength,
  stats: StoredStats
): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const key = getStorageKey(length);
    window.localStorage.setItem(key, JSON.stringify(stats));
  } catch (error) {
    console.error("Failed to save stats to localStorage:", error);
  }
};

export const recordGameResult = (
  length: SupportedWordLength,
  { gameId, won, guesses }: RecordGameParams,
  maxAttempts: number = MAX_GUESSES
): StoredStats => {
  if (!gameId) {
    return cloneStats(createDefaultStats(maxAttempts));
  }

  const current = loadStats(length, maxAttempts);

  if (current.recordedGameIds.includes(gameId)) {
    return current;
  }

  const updated = cloneStats(current);
  updated.recordedGameIds.push(gameId);

  const MAX_TRACKED_IDS = 200;
  if (updated.recordedGameIds.length > MAX_TRACKED_IDS) {
    updated.recordedGameIds = updated.recordedGameIds.slice(-MAX_TRACKED_IDS);
  }

  updated.totalGames += 1;

  if (won) {
    updated.victories += 1;
    updated.currentStreak += 1;
    updated.maxStreak = Math.max(updated.maxStreak, updated.currentStreak);

    const bucket = String(Math.min(Math.max(guesses, 1), maxAttempts));
    updated.guessDistribution[bucket] =
      (updated.guessDistribution[bucket] ?? 0) + 1;
  } else {
    updated.currentStreak = 0;
    updated.failCount += 1;
  }

  saveStats(length, updated);
  return updated;
};

export const resetStats = (
  length: SupportedWordLength,
  maxAttempts: number = MAX_GUESSES
): void => {
  saveStats(length, cloneStats(createDefaultStats(maxAttempts)));
};
