export const DEFAULT_TIME_ZONE = "Europe/Paris";

type DateParts = { year: number; month: number; day: number };

const getDatePartsInTimeZone = (
  date: Date,
  timeZone: string = DEFAULT_TIME_ZONE
): DateParts => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const parts = formatter.formatToParts(date);
  const lookup = (type: "year" | "month" | "day") =>
    Number(parts.find((part) => part.type === type)?.value ?? 0);

  return {
    year: lookup("year"),
    month: lookup("month"),
    day: lookup("day"),
  };
};

export const formatDateInTimeZone = (
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE
): string => {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);
  const paddedMonth = String(month).padStart(2, "0");
  const paddedDay = String(day).padStart(2, "0");
  return `${year}-${paddedMonth}-${paddedDay}`;
};

export const getDaysSinceEpochInTimeZone = (
  date: Date = new Date(),
  timeZone: string = DEFAULT_TIME_ZONE
): number => {
  const { year, month, day } = getDatePartsInTimeZone(date, timeZone);
  const epoch = Date.UTC(2022, 0, 2);
  const current = Date.UTC(year, month - 1, day);
  return Math.floor((current - epoch) / (24 * 60 * 60 * 1000));
};
