import type { SupportedWordLength } from "./wordLengths";
import { formatDateInTimeZone } from "./timezone";

export type FirstLetterMode = "fixed" | "free";

export interface DailyGameStatus {
  date: string;
  completed: boolean;
  won?: boolean;
  guesses?: number;
  solution?: string;
  length: SupportedWordLength;
  firstLetterMode: FirstLetterMode;
}

const DAILY_STORAGE_PREFIX = "sutom-daily-status";

const getTodayString = (): string => formatDateInTimeZone();

const getStorageKey = (
  length: SupportedWordLength,
  firstLetterMode: FirstLetterMode
): string => `${DAILY_STORAGE_PREFIX}-${length}-${firstLetterMode}`;

const pruneLegacyKey = () => {
  if (typeof window === "undefined") {
    return;
  }
  if (window.localStorage.getItem(DAILY_STORAGE_PREFIX) !== null) {
    window.localStorage.removeItem(DAILY_STORAGE_PREFIX);
  }
};

export const getDailyGameStatus = (
  length: SupportedWordLength,
  firstLetterMode: FirstLetterMode
): DailyGameStatus | null => {
  if (typeof window === "undefined") {
    return null;
  }

  pruneLegacyKey();

  const key = getStorageKey(length, firstLetterMode);

  try {
    const stored = window.localStorage.getItem(key);
    if (!stored) {
      return null;
    }

    const status = JSON.parse(stored) as DailyGameStatus;
    const today = getTodayString();

    if (
      status.date !== today ||
      status.length !== length ||
      status.firstLetterMode !== firstLetterMode
    ) {
      window.localStorage.removeItem(key);
      return null;
    }

    return status;
  } catch (error) {
    console.error("Error reading daily game status:", error);
    window.localStorage.removeItem(key);
    return null;
  }
};

const saveDailyGameStatus = (
  length: SupportedWordLength,
  firstLetterMode: FirstLetterMode,
  status: Omit<DailyGameStatus, "date" | "length" | "firstLetterMode">
): void => {
  if (typeof window === "undefined") {
    return;
  }

  const key = getStorageKey(length, firstLetterMode);

  try {
    const fullStatus: DailyGameStatus = {
      ...status,
      date: getTodayString(),
      length,
      firstLetterMode,
    };
    window.localStorage.setItem(key, JSON.stringify(fullStatus));
  } catch (error) {
    console.error("Error saving daily game status:", error);
  }
};

export const isDailyGameCompleted = (
  length: SupportedWordLength,
  firstLetterMode: FirstLetterMode,
  expectedSolution?: string
): boolean => {
  const status = getDailyGameStatus(length, firstLetterMode);
  if (!status?.completed) {
    return false;
  }
  if (expectedSolution && status.solution !== expectedSolution) {
    return false;
  }
  return true;
};

export const completeDailyGame = (
  length: SupportedWordLength,
  firstLetterMode: FirstLetterMode,
  won: boolean,
  guesses: number,
  solution: string
): void => {
  saveDailyGameStatus(length, firstLetterMode, {
    completed: true,
    won,
    guesses,
    solution,
  });
};
