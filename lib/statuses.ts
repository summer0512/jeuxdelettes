import { normalizeWordInsensitive } from "./words";

export type CharStatus = "absent" | "present" | "correct";

export type CharValue =
  | "Q"
  | "W"
  | "E"
  | "R"
  | "T"
  | "Y"
  | "U"
  | "I"
  | "O"
  | "P"
  | "A"
  | "S"
  | "D"
  | "F"
  | "G"
  | "H"
  | "J"
  | "K"
  | "L"
  | "Z"
  | "X"
  | "C"
  | "V"
  | "B"
  | "N"
  | "M"
  | "Ç";

export const getStatuses = (
  guesses: string[],
  solutionWord: string
): { [key: string]: CharStatus } => {
  const charObj: { [key: string]: CharStatus } = {};
  const normalizedSolution = normalizeWordInsensitive(solutionWord.toLowerCase());

  // 只处理实际使用过的字母，不要初始化所有字母
  const usedLetters = new Set<string>();

  // 处理每个猜测
  guesses.forEach((word) => {
    const statuses = getGuessStatuses(word, solutionWord);
    const originalWord = word.toLowerCase();
    const normalizedWord = normalizeWordInsensitive(word.toLowerCase());

    statuses.forEach((status, i) => {
      // 使用规范化的字母作为键（移除音调符号）
      const normalizedLetter = normalizedWord[i];
      const upperLetter = normalizedLetter.toUpperCase();

      // 同时也设置原始字母的大写版本（带音调）
      const originalUpperLetter = originalWord[i].toUpperCase();

      usedLetters.add(upperLetter);
      usedLetters.add(originalUpperLetter);

      // 更新状态优先级：correct > present > absent
      if (status === "correct") {
        charObj[upperLetter] = "correct";
        charObj[originalUpperLetter] = "correct";
      } else if (status === "present" && charObj[upperLetter] !== "correct") {
        charObj[upperLetter] = "present";
        charObj[originalUpperLetter] = "present";
      } else if (status === "absent" && !charObj[upperLetter]) {
        // 只有在字母没有被标记为 correct 或 present 时才设置为 absent
        charObj[upperLetter] = "absent";
        charObj[originalUpperLetter] = "absent";
      }
    });
  });

  return charObj;
};

export const getGuessStatuses = (guess: string, solutionWord: string): CharStatus[] => {
  // 规范化处理，确保重音符号匹配 - 使用音调不敏感的规范化
  const normalizedSolution = normalizeWordInsensitive(solutionWord.toLowerCase());
  const normalizedGuess = normalizeWordInsensitive(guess.toLowerCase());

    
  const splitSolution = normalizedSolution.split("");
  const splitGuess = normalizedGuess.split("");

  const solutionCharsTaken = splitSolution.map((_) => false);

  const statuses: CharStatus[] = Array.from(Array(guess.length));

  // handle all correct cases first
  splitGuess.forEach((letter, i) => {
    if (letter === splitSolution[i]) {
      statuses[i] = "correct";
      solutionCharsTaken[i] = true;
      return;
    }
  });

  splitGuess.forEach((letter, i) => {
    if (statuses[i]) return;

    if (!splitSolution.includes(letter)) {
      // handles the absent case
      statuses[i] = "absent";
      return;
    }

    // now we are left with "present"s
    const indexOfPresentChar = splitSolution.findIndex(
      (x, index) => x === letter && !solutionCharsTaken[index]
    );

    if (indexOfPresentChar > -1) {
      statuses[i] = "present";
      solutionCharsTaken[indexOfPresentChar] = true;
      return;
    } else {
      statuses[i] = "absent";
      return;
    }
  });

  return statuses;
};
