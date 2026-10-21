import { getGuessStatuses } from "./statuses";

export const CHALLENGE_QUERY_KEY = "challenge";

export const generateShareText = (
  guesses: string[],
  solution: string,
  gameWon: boolean,
  maxAttempts = 6
): string => {
  const attempts = guesses.length;
  const emojiGrid = guesses
    .map((guess) => {
      const statuses = getGuessStatuses(guess, solution);
      return statuses
        .map((status) => {
          switch (status) {
            case "correct":
              return "🟥";
            case "present":
              return "🟨";
            case "absent":
            default:
              return "🟦";
          }
        })
        .join("");
    })
    .join("\n");

  const resultText = gameWon
    ? `J’ai trouvé ce mot en ${attempts}/${maxAttempts} essais ! 🎉`
    : `Je n’ai pas trouvé ce mot en ${maxAttempts} essais. 😅`;

  return `${resultText}

${emojiGrid}

Tu peux deviner ce mot ?
SUTOM : https://jeuxdelettes.com`;
};

export const generateTwitterShareUrl = (
  shareText: string,
  gameUrl?: string
): string => {
  const baseUrl =
    gameUrl ??
    (typeof window !== "undefined" ? window.location.origin : "https://jeuxdelettes.com");
  const encodedText = encodeURIComponent(`${shareText}${baseUrl}`);
  return `https://x.com/intent/post?text=${encodedText}`;
};

export const generateChallengeUrl = (solution: string, pathname?: string, origin?: string): string => {
  const targetOrigin =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  const targetPath =
    pathname ?? (typeof window !== "undefined" ? window.location.pathname : "/");
  const encoded = btoa(solution.toLowerCase());
  return `${targetOrigin}${targetPath}?${CHALLENGE_QUERY_KEY}=${encoded}`;
};

export const clearChallengeFromUrl = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const url = new URL(window.location.href);
  url.searchParams.delete(CHALLENGE_QUERY_KEY);
  window.history.replaceState({}, "", url.toString());
};

export const resolveChallengeWordFromUrl = (
  resolver: (candidate: string) => string | null,
  expectedLength: number
): string | null => {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    const encoded = params.get(CHALLENGE_QUERY_KEY);
    if (!encoded) {
      return null;
    }

    const decoded = atob(encoded);
    const candidate = resolver(decoded.toUpperCase());
    if (!candidate) {
      return null;
    }

    return candidate.length === expectedLength ? candidate : null;
  } catch (error) {
    console.warn("Failed to decode challenge parameter:", error);
    return null;
  }
};

export const copyToClipboard = async (text: string): Promise<boolean> => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      textArea.style.left = "-999999px";
      textArea.style.top = "-999999px";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const result = document.execCommand("copy");
      document.body.removeChild(textArea);
      return result;
    } catch {
      return false;
    }
  }
};
