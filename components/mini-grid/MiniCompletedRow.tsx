import { getGuessStatuses } from "../../lib/statuses";
import { MiniCell } from "./MiniCell";

type Props = {
  guess: string;
  solution?: string;
};

export const MiniCompletedRow = ({ guess, solution }: Props) => {
  const resolvedSolution = solution ?? guess;
  const statuses = getGuessStatuses(guess, resolvedSolution);

  return (
    <div className="flex justify-center mb-1">
      {guess.split("").map((letter, i) => (
        <MiniCell key={i} status={statuses[i]} />
      ))}
    </div>
  );
};
