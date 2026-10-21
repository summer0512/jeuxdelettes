import type { SupportedWordLength } from "./wordLengths";

export const SUPPORTED_GUIDE_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

const SUPPORTED_GUIDE_SET = new Set<number>(SUPPORTED_GUIDE_LENGTHS);

export const isGuideLength = (length: SupportedWordLength): boolean =>
  SUPPORTED_GUIDE_SET.has(length);
