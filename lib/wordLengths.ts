export const SUPPORTED_WORD_LENGTHS = [3, 4, 5, 6, 7, 8, 9, 10, 11] as const;

export type SupportedWordLength = (typeof SUPPORTED_WORD_LENGTHS)[number];

export const formatWordLengthLabel = (length: SupportedWordLength): string =>
  `${length} lettres`;
