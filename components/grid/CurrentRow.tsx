import { Cell } from "./Cell";

type Props = {
  guess: string;
  wordLength: number;
  firstLetter?: string;
  isFirstLetterFixed?: boolean;
};

export const CurrentRow = ({
  guess,
  wordLength,
  firstLetter,
  isFirstLetterFixed = false,
}: Props) => {
  const splitGuess = guess.split("");
  if (isFirstLetterFixed && firstLetter) {
    if (!splitGuess[0]) {
      splitGuess[0] = firstLetter;
    }
  }
  const emptyCells = Array.from(
    Array(Math.max(wordLength - splitGuess.length, 0))
  );

  return (
    <div className="flex justify-center mb-1">
      {splitGuess.map((letter, i) => (
        <Cell
          key={i}
          value={letter}
          status={isFirstLetterFixed && i === 0 ? "correct" : undefined}
        />
      ))}
      {emptyCells.map((_, i) => {
        const cellIndex = splitGuess.length + i;
        if (isFirstLetterFixed && cellIndex === 0 && firstLetter) {
          return (
            <Cell key={cellIndex} value={firstLetter} status="correct" />
          );
        }
        return <Cell key={cellIndex} />;
      })}
    </div>
  );
};
