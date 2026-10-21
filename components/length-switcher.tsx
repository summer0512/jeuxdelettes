import Link from "next/link";
import type { SupportedWordLength } from "@/lib/wordLengths";

export type LengthOption = {
  length: SupportedWordLength;
  href: string;
};

const sortOptions = (options: LengthOption[]): LengthOption[] =>
  [...options].sort((a, b) => a.length - b.length);

export const LengthSwitcher = ({
  options,
  currentLength,
  className,
  label,
  variant = "standalone",
}: {
  options: LengthOption[];
  currentLength: SupportedWordLength;
  className?: string;
  label?: string;
  variant?: "standalone" | "inline";
}) => {
  const sortedOptions = sortOptions(options);
  const wrapperClassName = ["flex flex-col md:flex-row items-center mb-2 md:mb-0", className]
    .filter(Boolean)
    .join(" ");

  const labelClasses =
    "px-2 py-1 uppercase tracking-wide text-[10px] font-semibold text-gray-500 whitespace-nowrap";

  if (variant === "inline") {
    return (
      <div className={wrapperClassName}>
        {label ? <span className={labelClasses}>{label}</span> : null}
        <span>{sortedOptions.map((option) => {
          const isActive = option.length === currentLength;
          return (
            <Link
              key={option.length}
              href={option.href}
              prefetch
              className={`px-3 py-1 rounded-full transition ${
                isActive
                  ? "bg-white text-primary-green shadow"
                  : "hover:text-gray-800"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Sélectionner les mots de ${option.length} lettres`}
            >
              {option.length}
            </Link>
          );
        })}</span>
      </div>
    );
  }

  return (
    <div className={wrapperClassName}>
      <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-xs font-medium text-gray-600">
        {label ? (
          <span className={`${labelClasses} mr-1 rounded-full`}>
            {label}
          </span>
        ) : null}
        {sortedOptions.map((option) => {
          const isActive = option.length === currentLength;
          return (
            <Link
              key={option.length}
              href={option.href}
              prefetch
              className={`px-3 py-1 rounded-full transition ${
                isActive
                  ? "bg-white text-primary-green shadow"
                  : "hover:text-gray-800"
              }`}
              aria-current={isActive ? "page" : undefined}
              aria-label={`Sélectionner les mots de ${option.length} lettres`}
            >
              {option.length}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
