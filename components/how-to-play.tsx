"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { Cell } from "./grid/Cell";
import { type CharStatus, getGuessStatuses } from "@/lib/statuses";

type HowToPlayStep = {
    number: string;
    title: string;
    description: string;
};

type HowToPlayContent = {
    title: string;
    subtitle: string;
    steps: HowToPlayStep[];
    tipsTitle: string;
    tipsList: string[];
    stepCaptions?: string[];
};

interface HowToPlayProps {
    wordLength?: number;
    content?: HowToPlayContent;
}

type ShortStatus = "a" | "c" | "p";

type ExampleRow = {
    word: string;
    statuses: (CharStatus | ShortStatus | undefined)[];
};

// Convert short codes to full statuses (a -> absent, c -> correct, p -> present)
function shortToFullStatus(s?: CharStatus | ShortStatus | undefined): CharStatus | undefined {
    if (!s) return undefined;
    if (s === "a") return "absent";
    if (s === "c") return "correct";
    if (s === "p") return "present";
    return s as CharStatus;
}

function expandStatuses(arr: (CharStatus | ShortStatus | undefined)[]) {
    return arr.map(shortToFullStatus);
}

const buildGenericExamples = (length: number): ExampleRow[] => {
    const makeWord = (letter: string) => letter.repeat(length);
    return [
        { word: makeWord("A"), statuses: Array(length).fill("a") },
        { word: makeWord("E"), statuses: ["p", ...Array(length - 1).fill("a")] },
        {
            word: makeWord("S"),
            statuses: Array.from({ length }, (_, index) => (index < 2 ? "c" : "a")),
        },
        { word: makeWord("S"), statuses: Array(length).fill("c") },
    ];
};

const EXAMPLE_SETS: Record<number, { target: string; guesses: string[] }> = {
    3: { target: "LES", guesses: ["LUI", "LOI", "LIS", "LOS", "LIT", "LES"] },
    4: { target: "POUR", guesses: ["PAYS", "PUIS", "PLUS", "PEUR", "POUX", "POUR"] },
    5: { target: "COMME", guesses: ["CELUI", "CETTE", "CHOSE", "COUPE", "COMTE", "COMME"] },
    6: { target: "ENCORE", guesses: ["EMPLOI", "ENFANT", "EUROPE", "ENVOIE", "ENCODE", "ENCORE"] },
    7: { target: "COMMENT", guesses: ["CULTURE", "CHAMBRE", "CONSEIL", "COURANT", "COMMUNE", "COMMENT"] },
    8: { target: "TOUJOURS", guesses: ["TENDANCE", "TROUBLES", "TOURISME", "TOURNOIS", "TOULOUSE", "TOUJOURS"] },
    9: { target: "PLUSIEURS", guesses: ["POLITIQUE", "PROBLÈMES", "PERSONNES", "PUBLIQUES", "PHYSIQUES", "PLUSIEURS"] },
    10: { target: "MAINTENANT", guesses: ["MOUVEMENTS", "MILITAIRES", "MAGNIFIQUE", "MANNEQUINS", "MANAGEMENT", "MAINTENANT"] },
    11: { target: "ENTREPRISES", guesses: ["EXPLICATION", "ENCADREMENT", "ENTIÈREMENT", "EXEMPLAIRES", "EXPRESSIONS", "ENTREPRISES"] },
};

const buildExamplesForLength = (length: number): ExampleRow[] => {
    const set = EXAMPLE_SETS[length];
    if (!set) {
        return buildGenericExamples(length);
    }

    return set.guesses.map((guess) => ({
        word: guess.toUpperCase(),
        statuses: getGuessStatuses(guess, set.target),
    }));
};

// Helper to fill missing steps if we don't have enough rows for the tutorial visual
// The tutorial has 4 steps (0, 1, 2, 3).
// Step 0: Show 1st row.
// Step 1: Show some intermediate state.
// Step 2: Show near completion.
// Step 3: Show completion.
function getTutorialRows(length: number, stepIndex: number): ExampleRow[] {
    const examples = buildExamplesForLength(length);

    // For 5 letters, we have a full 6-row game.
    // For others, we might have fewer.
    // We need to map "Step Index" (0..3) to "How many rows to show".

    const totalRows = examples.length;

    if (stepIndex === 0) {
        // First attempt: Show just the first row, no status (or neutral?)
        // The original code showed "VESGO" with neutral cells in step 0?
        // Looking at original code:
        // i===0: <Cell value="V" /> (no status prop, so neutral)
        // So for step 0, we take the first word and strip statuses.
        return [{ word: examples[0].word, statuses: Array(length).fill(undefined) as any }];
    }

    if (stepIndex === 3) {
        // Final step: Show all rows including the winning one.
        return examples;
    }

    // Intermediate steps (1 and 2)
    // We want to show a progression.
    // If we have many rows (like 5-letter), we can show partials.
    // If we have few rows (like 2), we just show what we have.

    if (totalRows <= 2) {
        // If short game, just show what we have up to the last one (exclusive of win?)
        // Or just show the first row with status.
        return examples.slice(0, 1);
    }

    // For longer games:
    // Step 1: Show ~50%
    // Step 2: Show ~80%
    const count = Math.ceil(totalRows * (stepIndex / 3));
    return examples.slice(0, count);
}


export function HowToPlay({ wordLength = 6, content }: HowToPlayProps) {
    const t = useTranslations("HomePage");
    const fallback: HowToPlayContent = {
        title: t("howToPlay.title"),
        subtitle: t("howToPlay.subtitle"),
        steps: Array.from({ length: 4 }, (_, i) => ({
            number: t(`howToPlay.steps.${i}.number`),
            title: t(`howToPlay.steps.${i}.title`),
            description: t(`howToPlay.steps.${i}.description`),
        })),
        tipsTitle: t("howToPlay.tips.title"),
        tipsList: Array.from({ length: 4 }, (_, i) => t(`howToPlay.tips.list.${i}`)),
        stepCaptions: [
            "Premier essai",
            "Analyse des indices",
            "Élimination des options",
            "Mot trouvé !",
        ],
    };
    const finalContent = content?.steps?.length
        ? {
            ...fallback,
            ...content,
            steps: content.steps,
            tipsList: content.tipsList?.length ? content.tipsList : fallback.tipsList,
            stepCaptions: content.stepCaptions ?? fallback.stepCaptions,
        }
        : fallback;

    return (
        <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10 max-w-4xl mx-auto">
            <div className="text-center mb-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                    {finalContent.title}
                </h2>
                <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                    {finalContent.subtitle}
                </p>
            </div>

            <div className="relative mb-10">
                <div className="space-y-3">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div
                            key={i}
                            className="relative bg-white py-6 rounded-xl shadow-sm border border-gray-100"
                        >
                            {/* Progress dot */}
                            <div className="items-center text-center mb-3">
                                <div className="mx-auto w-10 h-10 bg-primary-yellow text-gray-900 rounded-full flex items-center justify-center font-bold text-lg z-10 relative">
                                    {finalContent.steps[i]?.number ?? String(i + 1)}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="pl-8 ml-auto text-center">
                                <h3 className="text-xl font-semibold text-gray-800 mb-3">
                                    {finalContent.steps[i]?.title}
                                </h3>
                                <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-line mb-4">
                                    {i === 1
                                        ? (finalContent.steps[i]?.description ?? "")
                                            .split(" | ")
                                            .join("\n")
                                        : finalContent.steps[i]?.description}
                                </p>

                                {/* Example Cell display */}
                                <div className="flex justify-center">
                                    <div className="space-y-2">
                                        <div className="flex flex-col space-y-1">
                                            {getTutorialRows(wordLength, i).map((row, rowIndex) => {
                                                const statuses = expandStatuses(row.statuses);
                                                return (
                                                    <div key={rowIndex} className="flex justify-center">
                                                        {row.word.split("").map((letter, letterIndex) => (
                                                            <Cell
                                                                key={letterIndex}
                                                                value={letter}
                                                                status={statuses[letterIndex]}
                                                            />
                                                        ))}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <p className="text-sm text-gray-600 text-center">
                                            {finalContent.stepCaptions?.[i]}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Tips Section */}
            <div className="bg-gradient-to-r bg-yellow-50 rounded-xl p-6 border border-yellow-300">
                <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
                    {finalContent.tipsTitle}
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                    {Array.from({ length: 4 }, (_, i) => (
                        <div
                            key={i}
                            className="flex items-start space-x-3 p-3 bg-white/60 rounded-lg"
                        >
                            <span className="text-yellow-600 font-bold text-lg">💡</span>
                            <span className="text-gray-700 text-sm leading-relaxed">
                                {finalContent.tipsList[i]}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-6 flex flex-col items-center gap-3 text-sm text-gray-600">
                    <span>Besoin d’un coup de main sans spoiler&nbsp;?</span>
                    <div className="flex flex-wrap justify-center gap-2">
                        <Link
                            href="/indice-sutom"
                            className="rounded-full border border-primary-gray px-4 py-1 font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
                        >
                            Indice Sutom
                        </Link>
                        <Link
                            href="/solution-sutom"
                            className="rounded-full border border-primary-gray px-4 py-1 font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
                        >
                            Solution Sutom
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
