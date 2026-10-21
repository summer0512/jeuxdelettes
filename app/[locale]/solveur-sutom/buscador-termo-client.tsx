"use client";

import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import MultiSelectDropdown from "@/components/ui/multi-select-dropdown";
import {
  Filter,
  Info,
  RotateCcw,
  ArrowLeft,
  Target,
  Zap,
  BookOpen,
  Share2,
} from "lucide-react";
import { loadWordList, normalizeWordInsensitive } from "@/lib/words";
import { cn } from "@/lib/utils";
import type { SupportedWordLength } from "@/lib/wordLengths";
import { LengthSwitcher, type LengthOption } from "@/components/length-switcher";
import { copyToClipboard } from "@/lib/share";

const ALPHABET = Array.from({ length: 26 }, (_, index) =>
  String.fromCharCode(65 + index)
);
const MAX_RESULTS = 200;

interface BuscadorTermoClientProps {
  initialWords: string[];
  wordLength: SupportedWordLength;
  lengthOptions: LengthOption[];
  homeHref: string;
}

const sanitizePositionInput = (raw: string): string =>
  raw
    .normalize("NFC")
    .replace(/[^A-Za-zÀ-ÿ]/g, "")
    .toUpperCase()
    .slice(0, 1);

const createEmptyPositions = (length: number) =>
  Array.from({ length }, () => "");

const buildWordList = (words: string[], length: number): string[] => {
  const unique = new Set<string>();
  words.forEach((word) => {
    const canonical = word.trim().toUpperCase();
    if (canonical.length === length) {
      unique.add(canonical);
    }
  });
  return Array.from(unique).sort();
};

export default function BuscadorTermoClient({
  initialWords,
  wordLength,
  lengthOptions,
  homeHref,
}: BuscadorTermoClientProps) {
  const t = useTranslations("BuscadorTermoPage");
  const tEx = useTranslations("ExtensionPage");

  const [wordList, setWordList] = useState<string[]>(() =>
    buildWordList(initialWords, wordLength)
  );
  const [isLoadingWordList, setIsLoadingWordList] = useState(
    initialWords.length === 0
  );
  const [wordListError, setWordListError] = useState(false);

  const [positionLetters, setPositionLetters] = useState<string[]>(() =>
    createEmptyPositions(wordLength)
  );
  const [includeLetters, setIncludeLetters] = useState<string[]>([]);
  const [excludeLetters, setExcludeLetters] = useState<string[]>([]);
  const [shareFeedback, setShareFeedback] = useState<"shared" | "copied" | "error" | null>(null);
  const positionRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    setPositionLetters(createEmptyPositions(wordLength));
    setIncludeLetters([]);
    setExcludeLetters([]);
    positionRefs.current = positionRefs.current.slice(0, wordLength);
  }, [wordLength]);

  useEffect(() => {
    if (!shareFeedback) {
      return;
    }
    const timeout = window.setTimeout(() => setShareFeedback(null), 4000);
    return () => window.clearTimeout(timeout);
  }, [shareFeedback]);

  useEffect(() => {
    const sanitized = buildWordList(initialWords, wordLength);
    setWordList(sanitized);
    setWordListError(false);

    if (sanitized.length > 0) {
      setIsLoadingWordList(false);
      return;
    }

    let cancelled = false;
    setIsLoadingWordList(true);

    loadWordList(wordLength)
      .then((data) => {
        if (cancelled) return;
        const combined = buildWordList(
          [...data.guesses, ...data.answers],
          wordLength
        );
        setWordList(combined);
        setWordListError(false);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error(
          `[buscador] Failed to load word list for length ${wordLength}:`,
          error
        );
        setWordListError(true);
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingWordList(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [initialWords, wordLength]);

  const results = useMemo(() => {
    return wordList.filter((word) => {
      const normalizedWord = normalizeWordInsensitive(word);

      if (
        positionLetters.some((letter, index) => {
          if (!letter) return false;
          const normalizedLetter = normalizeWordInsensitive(letter).charAt(0);
          return normalizedWord[index] !== normalizedLetter;
        })
      ) {
        return false;
      }

      if (
        includeLetters.some(
          (letter) => !normalizedWord.includes(letter.toLowerCase())
        )
      ) {
        return false;
      }

      if (
        excludeLetters.some((letter) =>
          normalizedWord.includes(letter.toLowerCase())
        )
      ) {
        return false;
      }

      return true;
    });
  }, [wordList, positionLetters, includeLetters, excludeLetters]);

  const sortedResults = useMemo(() => [...results].sort(), [results]);
  const limitedResults = useMemo(
    () => sortedResults.slice(0, MAX_RESULTS),
    [sortedResults]
  );

  const handleShare = useCallback(async () => {
    const shareUrl = typeof window !== "undefined" ? window.location.href : "";
    if (!shareUrl) {
      return;
    }

    const shareText = t("shareMessage", { length: wordLength });

    const nav =
      typeof navigator !== "undefined"
        ? (navigator as Navigator & {
            share?: (data: { title?: string; text?: string; url?: string }) => Promise<void>;
          })
        : null;

    if (nav?.share) {
      try {
        await nav.share({
          title: shareText,
          text: shareText,
          url: shareUrl,
        });
        setShareFeedback("shared");
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
      }
    }

    const success = await copyToClipboard(shareUrl);
    setShareFeedback(success ? "copied" : "error");
  }, [t, wordLength]);

  const hasFilters = useMemo(
    () =>
      positionLetters.some(Boolean) ||
      includeLetters.length > 0 ||
      excludeLetters.length > 0,
    [positionLetters, includeLetters, excludeLetters]
  );

  const handlePositionChange = useCallback((index: number, rawValue: string) => {
    const sanitized = sanitizePositionInput(rawValue);
    setPositionLetters((prev) => {
      const next = [...prev];
      next[index] = sanitized;
      return next;
    });

    if (sanitized) {
      const normalized = normalizeWordInsensitive(sanitized).toUpperCase();
      setExcludeLetters((prev) =>
        prev.filter((letter) => letter !== normalized)
      );
    }
  }, []);

  const handlePositionKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>, index: number) => {
      const key = event.key;

      if (/^[A-Za-zÀ-ÿ]$/.test(key)) {
        event.preventDefault();
        handlePositionChange(index, key);
        const nextRef = positionRefs.current[index + 1];
        if (nextRef) {
          nextRef.focus();
        }
        return;
      }

      if (key === "Backspace") {
        if (positionLetters[index]) {
          event.preventDefault();
          handlePositionChange(index, "");
          return;
        }
        if (index > 0) {
          event.preventDefault();
          const prevRef = positionRefs.current[index - 1];
          if (prevRef) {
            prevRef.focus();
            handlePositionChange(index - 1, "");
          }
        }
        return;
      }

      if (key === "ArrowLeft" && index > 0) {
        event.preventDefault();
        positionRefs.current[index - 1]?.focus();
        return;
      }

      if (key === "ArrowRight" && index < positionLetters.length - 1) {
        event.preventDefault();
        positionRefs.current[index + 1]?.focus();
      }
    },
    [handlePositionChange, positionLetters]
  );

  const toggleLetter = useCallback((letter: string, target: "include" | "exclude") => {
    const normalized = normalizeWordInsensitive(letter).toUpperCase();

    if (target === "include") {
      setIncludeLetters((prev) =>
        prev.includes(normalized)
          ? prev.filter((item) => item !== normalized)
          : [...prev, normalized]
      );
      setExcludeLetters((prev) =>
        prev.filter((item) => item !== normalized)
      );
      return;
    }

    setExcludeLetters((prev) =>
      prev.includes(normalized)
        ? prev.filter((item) => item !== normalized)
        : [...prev, normalized]
    );
    setIncludeLetters((prev) => prev.filter((item) => item !== normalized));
    setPositionLetters((prev) =>
      prev.map((item) =>
        normalizeWordInsensitive(item).toUpperCase() === normalized ? "" : item
      )
    );
  }, []);

  const handleIncludeSelect = useCallback(
    (letter: string) => {
      toggleLetter(letter, "include");
    },
    [toggleLetter]
  );

  const handleExcludeSelect = useCallback(
    (letter: string) => {
      toggleLetter(letter, "exclude");
    },
    [toggleLetter]
  );

  const handleIncludeRemove = useCallback((letter: string) => {
    setIncludeLetters((prev) => prev.filter((item) => item !== letter));
  }, []);

  const handleExcludeRemove = useCallback((letter: string) => {
    setExcludeLetters((prev) => prev.filter((item) => item !== letter));
  }, []);

  const clearAll = useCallback(() => {
    setPositionLetters(createEmptyPositions(wordLength));
    setIncludeLetters([]);
    setExcludeLetters([]);
  }, [wordLength]);

  const resultsCountLabel = t("resultsCount", { count: limitedResults.length });
  const resultsLimitNotice =
    !isLoadingWordList &&
    !wordListError &&
    sortedResults.length > MAX_RESULTS
      ? t("resultsLimitNotice", {
          count: MAX_RESULTS,
          total: sortedResults.length,
        })
      : null;
  const lengthHeadings = t.raw("lengthHeadings") as Record<
    number,
    { heading?: string; subheading?: string }
  >;
  const headingOverride = lengthHeadings?.[wordLength]?.heading;
  const subheadingOverride = lengthHeadings?.[wordLength]?.subheading;
  const headingText =
    typeof headingOverride === "string"
      ? headingOverride
      : t("heading", { length: wordLength });
  const subheadingText =
    typeof subheadingOverride === "string"
      ? subheadingOverride
      : t("subheading", { length: wordLength });

  return (
    <div className="mx-auto flex w-full md:max-w-5xl flex-col gap-4 md:gap-8 md:px-4 pb-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <Link
          href={homeHref}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {tEx("backToHome")}
        </Link>
        <div className="flex flex-col items-start sm:items-end gap-1.5">
          <Button
            type="button"
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-primary-gray text-white hover:bg-primary-gray/90 focus-visible:ring-primary-gray/40"
          >
            <Share2 className="h-4 w-4" />
            {t("shareButton")}
          </Button>
          {shareFeedback === "shared" ? (
            <span className="text-xs text-primary-gray">{t("shareShared")}</span>
          ) : shareFeedback === "copied" ? (
            <span className="text-xs text-primary-gray">{t("shareCopied")}</span>
          ) : shareFeedback === "error" ? (
            <span className="text-xs text-red-500">{t("shareError")}</span>
          ) : null}
        </div>
      </div>

      <div className="text-center space-y-4 md:space-y-6">
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl bg-gradient-to-r from-yellow-500 to-blue-600 bg-clip-text text-transparent">
          {headingText}
        </h1>
        <p className="text-base text-muted-foreground mx-auto">
          {subheadingText}
        </p>
      </div>

      <div className="flex justify-center">
        <LengthSwitcher
          options={lengthOptions}
          currentLength={wordLength}
          label={t("lengthLabel")}
        />
      </div>

      <Card className="border-2 border-yellow-100 dark:border-yellow-900 shadow-lg">
        <CardHeader className="py-4 flex flex-col md:gap-3 md:flex-row md:items-center md:justify-between ">
          <div className="md:space-y-1">
            <CardTitle className="text-2xl flex items-center gap-2">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Filter className="h-5 w-5 text-yellow-700 dark:text-yellow-400" />
              </div>
              {t("filtersTitle")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("filtersDescription")}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            className="inline-flex items-center gap-1"
          >
            <RotateCcw className="h-4 w-4" />
            {t("clearFilters")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-7">
            <section className="space-y-3 md:col-span-3">
              <header className="flex items-center gap-3">
                <div className="p-2 bg-primary-gray/10 rounded-lg">
                  <Target className="h-5 w-5 text-primary-gray" />
                </div>
                <div>
                <h2 className="text-sm font-semibold">
                  {t("correctLettersTitle")}
                </h2>
                <p className="text-xs text-muted-foreground md:min-h-[32px]">
                  {t("correctLettersDescription")}
                </p>
              </div>
            </header>
            <div className="flex gap-1">
              {positionLetters.map((letter, index) => (
                <Input
                  key={index}
                  ref={(ref) => {
                    positionRefs.current[index] = ref;
                  }}
                  value={letter}
                  maxLength={1}
                  onChange={(event) =>
                    handlePositionChange(index, event.target.value)
                  }
                  onKeyDown={(event) => handlePositionKeyDown(event, index)}
                  className={cn(
                    "w-8 h-8 text-center text-sm font-semibold uppercase px-0",
                    letter && "border-primary-gray text-primary-gray"
                  )}
                />
              ))}
            </div>
            </section>
            <section className="space-y-3 md:col-span-2">
              <header className="flex items-center gap-3">
                <div className="p-2 bg-primary-yellow/10 rounded-lg">
                  <Zap className="h-5 w-5 text-primary-yellow" />
                </div>
                <div>
                <h2 className="text-sm font-semibold">
                  {t("includeLettersTitle")}
                </h2>
                <p className="text-xs text-muted-foreground">
                  {t("includeLettersDescription")}
                </p>
              </div>
            </header>
            <MultiSelectDropdown
              availableLetters={ALPHABET}
              selectedLetters={includeLetters}
              disabledLetters={excludeLetters}
              onSelect={handleIncludeSelect}
              onRemove={handleIncludeRemove}
              onClear={() => setIncludeLetters([])}
              clearButtonLabel={t("clearFilters")}
              placeholder={t("includeEmpty")}
              variant="include"
            />
            <div className="flex flex-wrap gap-2">
              {includeLetters.map((letter) => (
                <Badge
                  key={letter}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-primary-yellow border-primary-yellow"
                >
                  {letter}
                  <button
                    type="button"
                    onClick={() => handleIncludeRemove(letter)}
                    className="ml-1 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            </section>
            <section className="space-y-3 md:col-span-2">
              <header className="flex items-center gap-3">
                <div className="p-2 bg-primary-gray/10 rounded-lg">
                  <Info className="h-5 w-5 text-primary-gray" />
                </div>
                <div>
                <h2 className="text-sm font-semibold">
                  {t("excludeLettersTitle")}
                </h2>
                <p className="text-xs text-muted-foreground md:min-h-[32px]">
                  {t("excludeLettersDescription")}
                </p>
              </div>
            </header>
            <MultiSelectDropdown
              availableLetters={ALPHABET}
              selectedLetters={excludeLetters}
              disabledLetters={includeLetters}
              onSelect={handleExcludeSelect}
              onRemove={handleExcludeRemove}
              onClear={() => setExcludeLetters([])}
              clearButtonLabel={t("clearFilters")}
              placeholder={t("excludeEmpty")}
              variant="exclude"
            />
            <div className="flex flex-wrap gap-2">
              {excludeLetters.map((letter) => (
                <Badge
                  key={letter}
                  variant="outline"
                  className="flex items-center gap-1 px-3 py-1 text-primary-gray border-primary-gray"
                >
                  {letter}
                  <button
                    type="button"
                    onClick={() => handleExcludeRemove(letter)}
                    className="ml-1 text-xs"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
            </section>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <header className="flex flex-col gap-1">
          <h2 className="text-xl font-semibold">
            {t("resultsTitle")}
          </h2>
          <p className="text-sm text-muted-foreground">
            {t("resultsDescription")}
          </p>
        </header>
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{resultsCountLabel}</span>
          {resultsLimitNotice && (
            <span className="italic">{resultsLimitNotice}</span>
          )}
        </div>
        <div className="rounded-lg border bg-white dark:bg-slate-950">
          {isLoadingWordList ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("wordListLoading")}
            </div>
          ) : wordListError ? (
            <div className="p-6 text-center text-sm text-red-500">
              {t("wordListError")}
            </div>
          ) : limitedResults.length === 0 ? (
            <div className="p-6 text-center text-sm text-muted-foreground">
              {t("noResultsHelp")}
            </div>
          ) : (
            <div className="flex flex-wrap gap-1 px-4 py-4">
              {limitedResults.map((word, index) => (
                <span
                  key={word}
                  className="inline-flex items-center justify-center text-sm tracking-wide uppercase text-gray-800"
                >
                  {word}
                  {index < limitedResults.length - 1 && ","}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>


      <section className="space-y-4">
        <header className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-300" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">
              {t("helperTitle")}
            </h2>
          </div>
        </header>
        <ul className="space-y-3 text-sm text-muted-foreground">
          <li>• {t("tip1")}</li>
          <li>• {t("tip2")}</li>
          <li>• {t("tip3")}</li>
        </ul>
      </section>

      {hasFilters && (
        <div className="flex justify-center">
          <Button variant="ghost" onClick={clearAll}>
            {t("clearFilters")}
          </Button>
        </div>
      )}
    </div>
  );
}
