import type { SupportedWordLength } from "@/lib/wordLengths";

export type StrategySection = {
  title: string;
  bullets: string[];
};

export type StrategyExample = {
  title: string;
  steps: string[];
};

export type LengthStrategy = {
  length: SupportedWordLength;
  intro: string;
  opening: StrategySection;
  midgame: StrategySection;
  endgame: StrategySection;
  pitfalls: StrategySection;
  example: StrategyExample;
};

const STRATEGY_LENGTHS: SupportedWordLength[] = [3, 4, 5, 6, 7, 8, 9, 10, 11];

const buildStrategy = (length: SupportedWordLength): LengthStrategy => ({
  length,
  intro:
    `Le format ${length} lettres demande méthode et flexibilité : ` +
    "plus la longueur augmente, plus les indices deviennent précieux.",
  opening: {
    title: "Ouverture rapide",
    bullets: [
      "Couvrez des voyelles fréquentes dès le premier essai.",
      "Évitez les doublons pour maximiser l’information.",
      "Fixez rapidement les lettres rouges.",
    ],
  },
  midgame: {
    title: "Milieu de partie",
    bullets: [
      "Réorganisez les lettres jaunes sans attendre.",
      "Testez des combinaisons compatibles avec les positions restantes.",
      "Utilisez le solveur pour réduire les options.",
    ],
  },
  endgame: {
    title: "Finalisation",
    bullets: [
      "Vérifiez les terminaisons courantes en français.",
      "Choisissez le mot qui valide la lettre la moins sûre.",
    ],
  },
  pitfalls: {
    title: "Pièges fréquents",
    bullets: [
      "Les accents ne changent pas la lettre pour les indices.",
      "Les répétitions de lettres sont plus fréquentes qu’on ne le pense.",
    ],
  },
  example: {
    title: "Mini-plan de réflexion",
    steps: [
      "Essai 1 : maximiser la couverture de lettres.",
      "Essai 2 : repositionner les jaunes et fixer les rouges.",
      "Essai 3 : tester la combinaison finale.",
    ],
  },
});

export const LENGTH_STRATEGIES = Object.fromEntries(
  STRATEGY_LENGTHS.map((length) => [length, buildStrategy(length)])
) as Record<SupportedWordLength, LengthStrategy>;
