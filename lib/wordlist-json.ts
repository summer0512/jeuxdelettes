export type WordListJson = {
  length: number;
  guesses?: string[];
  answers?: string[];
  allow?: string[];
  answer?: string[];
  accentMap?: Record<string, string>;
  stats?: {
    answers: number;
    allowed: number;
    unique: number;
  };
  version?: string;
  checksum?: string;
  generatedAt?: string;
};
