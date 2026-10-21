import type { SupportedWordLength } from "@/lib/wordLengths";
import rawStats from "@/data/length-stats.json";

export type LetterShare = {
  letter: string;
  share: number;
};

export type EndingShare = {
  ending: string;
  share: number;
};

export type LengthStatsBucket = {
  wordCount: number;
  vowelAverage: number;
  duplicateRate: number;
  topLetters: LetterShare[];
  commonEndings2: EndingShare[];
  commonEndings3: EndingShare[];
};

export type LengthStats = {
  length: number;
  answers: LengthStatsBucket & {
    starterWords: string[];
  };
  all: LengthStatsBucket & {
    allowCount: number;
  };
};

const lengthStats = rawStats as Record<string, LengthStats>;

export const getLengthStats = (length: SupportedWordLength): LengthStats => {
  const key = String(length);
  const entry = lengthStats[key];
  if (!entry) {
    throw new Error(`Missing length stats for length ${length}`);
  }
  return entry;
};
