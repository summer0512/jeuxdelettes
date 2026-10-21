import { getGuessStatuses } from "../../lib/statuses";
import { Cell } from "./Cell";

type Props = {
  guess: string;
  isRevealing?: boolean;
  solution?: string;
};

export const CompletedRow = ({ guess, isRevealing = false, solution }: Props) => {
  const resolvedSolution = solution ?? guess;
  const statuses = getGuessStatuses(guess, resolvedSolution);
  const displayWord = guess;

  return (
    <div className="flex justify-center mb-1">
      {displayWord.split("").map((letter, i) => (
        <Cell 
          key={i} 
          value={letter} 
          status={statuses[i]} 
          isRevealing={isRevealing}
          animationDelay={i * 100} // 每个格子延迟100ms
        />
      ))}
    </div>
  );
};
