import { CompletedRow } from "./CompletedRow";
import { CurrentRow } from "./CurrentRow";
import { EmptyRow } from "./EmptyRow";

type Props = {
  guesses: string[];
  currentGuess: string;
  revealingRowIndex?: number;
  solution: string;
  wordLength: number;
  maxGuesses: number;
  firstLetter?: string;
  isFirstLetterFixed?: boolean;
};

export const Grid = ({
  guesses,
  currentGuess,
  revealingRowIndex,
  solution,
  wordLength,
  maxGuesses,
  firstLetter,
  isFirstLetterFixed = false,
}: Props) => {
  const showCurrentRow = guesses.length < maxGuesses;
  const emptyRowCount = Math.max(
    maxGuesses - guesses.length - (showCurrentRow ? 1 : 0),
    0
  );

  return (
    <div className="pb-6">
      {guesses.map((guess, i) => (
        <CompletedRow 
          key={i} 
          guess={guess}
          isRevealing={revealingRowIndex === i}
          solution={solution}
        />
      ))}
      {showCurrentRow && (
        <CurrentRow
          guess={currentGuess}
          wordLength={wordLength}
          firstLetter={firstLetter}
          isFirstLetterFixed={isFirstLetterFixed}
        />
      )}
      {Array.from(Array(emptyRowCount)).map((_, i) => (
        <EmptyRow
          key={i}
          wordLength={wordLength}
          firstLetter={firstLetter}
          isFirstLetterFixed={isFirstLetterFixed}
        />
      ))}
    </div>
  );
};
