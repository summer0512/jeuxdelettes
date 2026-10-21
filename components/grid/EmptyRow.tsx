import { Cell } from "./Cell";

type Props = {
  wordLength: number;
  firstLetter?: string;
  isFirstLetterFixed?: boolean;
};

export const EmptyRow = ({
  wordLength,
  firstLetter,
  isFirstLetterFixed = false,
}: Props) => {
  const emptyCells = Array.from(Array(wordLength));

  return (
    <div className="flex justify-center mb-1">
      {emptyCells.map((_, i) => (
        <Cell
          key={i}
          value={isFirstLetterFixed && i === 0 ? firstLetter : undefined}
          status={isFirstLetterFixed && i === 0 ? "correct" : undefined}
        />
      ))}
    </div>
  );
};
