"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PlusCircle } from "lucide-react";
import { CreateGameModal } from "./modals/CreateGameModal";
import { PWAInstallPrompt } from "./pwa-install-prompt";
import {
  loadWordList,
  canonicalizeGuess,
  type WordListData,
} from "@/lib/words";
import { generateChallengeUrl } from "@/lib/share";
import type { SupportedWordLength } from "@/lib/wordLengths";
import { cn } from "@/lib/utils";
import { SUPPORTED_WORD_LENGTHS } from "@/lib/wordLengths";
import { buildGamePath, buildSearchPath } from "@/lib/routes";
import { HowToPlay } from "./how-to-play";
import { FaqSection } from "./faq-section";

type FeatureHighlight = {
  title: string;
  description: string;
  keyword: string;
};

interface SEOContentProps {
  locale: string;
}

export default function SEOContent({ locale }: SEOContentProps) {
  const t = useTranslations("HomePage");
  const WORD_LENGTH: SupportedWordLength = 6;
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [wordData, setWordData] = useState<WordListData | null>(null);
  const lengthCards = SUPPORTED_WORD_LENGTHS.map((length) => ({
    length,
    gameHref: buildGamePath(locale, length),
    searchHref: buildSearchPath(locale, length),
  }));
  const rawHighlights = t.raw('gameIntro.featureHighlights');
  const featureHighlights = Array.isArray(rawHighlights) ? (rawHighlights as FeatureHighlight[]) : [];

  const rawFaq = t.raw('faq.questions');
  const faqEntries = Array.isArray(rawFaq) ? (rawFaq as { question: string; answer: string }[]) : [];
  const faqSchema = faqEntries.length
    ? {
      '@type': 'FAQPage',
      mainEntity: faqEntries.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    }
    : null;

  const rawSteps = t.raw('howToPlay.steps');
  const howToEntries = Array.isArray(rawSteps)
    ? (rawSteps as { title: string; description: string }[])
    : [];
  const howToSchema = howToEntries.length
    ? {
      '@type': 'HowTo',
      name: t('howToPlay.title'),
      description: t('howToPlay.subtitle'),
      step: howToEntries.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        name: step.title,
        text: step.description,
      })),
    }
    : null;

  const structuredData = faqSchema || howToSchema
    ? {
      '@context': 'https://schema.org',
      '@graph': [faqSchema, howToSchema].filter(Boolean),
    }
    : null;

  useEffect(() => {
    let cancelled = false;

    loadWordList(WORD_LENGTH)
      .then((data) => {
        if (!cancelled) {
          setWordData(data);
        }
      })
      .catch((error) => {
        console.error("Failed to preload word list:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [WORD_LENGTH]);

  const validateWord = useCallback(
    (word: string) => {
      if (!wordData) {
        return null;
      }
      return canonicalizeGuess(word, wordData);
    },
    [wordData]
  );

  const buildChallengeUrl = useCallback(
    async (canonicalWord: string) => generateChallengeUrl(canonicalWord, "/"),
    []
  );

  const handleOpenCreateModal = () => {
    if (wordData) {
      setIsCreateGameModalOpen(true);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Game Introduction Section */}
      <section className="text-center bg-yellow-50 relative py-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 leading-tight">
            {t("h1")}
          </h1>

          <div className="max-w-3xl mx-auto">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-700 mb-4">
              {t("gameIntro.title")}
            </h2>
            <p className="text-gray-700 mb-2 leading-relaxed max-w-2xl mx-auto">
              {t("gameIntro.description")}
            </p>
          </div>

          {featureHighlights.length > 0 && (
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featureHighlights.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-2xl border border-white/60 bg-white/80 p-6 text-left shadow-sm transition hover:border-primary-gray/50 hover:shadow"
                >
                  <span className="text-xs font-semibold uppercase tracking-wide text-primary-gray">
                    {feature.keyword}
                  </span>
                  <h3 className="mt-2 text-lg font-semibold text-gray-800">{feature.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          )}

          <Link
            href="/guide-sutom"
            className="mt-8 inline-flex items-center justify-center rounded-full bg-primary-gray px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
          >
            Voir le guide Sutom
          </Link>
        </div>
      </section>

      <section className="bg-white/80 border border-gray-100 rounded-2xl shadow-sm mt-12">
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-6">
          <div className="text-center space-y-3">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t("lengthDirectory.title")}
            </h2>
            <p className="text-base md:text-lg text-gray-600">
              {t("lengthDirectory.description")}
            </p>
          </div>
          <div className="grid gap-4 md:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lengthCards.map(({ length, gameHref, searchHref }) => (
              <div
                key={length}
                className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm flex flex-col gap-4"
              >
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-primary-gray">
                    {`Sutom ${length} lettres`}
                  </p>
                  <h3 className="font-semibold text-gray-900">
                    {`Sutom ${length} lettres`}
                  </h3>
                </div>
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Link
                    href={gameHref}
                    className="text-sm flex-1 inline-flex justify-center items-center rounded-lg bg-primary-gray text-white font-semibold px-4 py-2 hover:bg-primary-gray/80 transition-colors"
                  >
                    {t("lengthDirectory.playCta", { length })}
                  </Link>
                  <Link
                    href={searchHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm flex-1 inline-flex justify-center items-center rounded-lg border border-primary-gray text-primary-gray font-semibold px-4 py-2 hover:bg-primary-gray/10 transition-colors"
                  >
                    {t("lengthDirectory.searchCta", { length })}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Custom Sutom Feature Section */}
      <section className="bg-gray-50 rounded-2xl shadow-sm border border-gray-200 p-8 md:p-10 max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            ✨ Créez votre défi Sutom
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Défiez vos amis avec un mot personnalisé et partagez le lien.
          </p>
        </div>

        <div className="text-center">
          <button
            onClick={handleOpenCreateModal}
            disabled={!wordData}
            className={cn(
              "inline-flex items-center gap-2 bg-primary-gray text-white font-semibold px-8 py-4 rounded-xl transition-all duration-300 transform shadow-lg",
              wordData
                ? "hover:scale-105 hover:bg-primary-gray/90"
                : "opacity-60 cursor-not-allowed"
            )}
          >
            <PlusCircle className="h-6 w-6" />
            Créer mon défi
          </button>
          <p className="text-sm text-gray-600 mt-3">
            Gratuit et illimité — créez autant de défis que vous voulez !
          </p>
        </div>
      </section>

      {/* Additional Content */}
      <section className="bg-yellow-50 p-8 md:p-10 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-4">
          Entraînez-vous à votre rythme
        </h2>
        <p className="text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
          Jouez le mot du jour et utilisez le mode infini pour tester vos
          ouvertures et progresser régulièrement.
        </p>
        <div className="grid gap-3 md:grid-cols-3 text-sm max-w-3xl mx-auto mb-6">
          <div className="rounded-xl border border-yellow-200 bg-yellow-100/60 p-4 text-gray-700">
            Mot du jour synchronisé pour tous les joueurs.
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-100/60 p-4 text-gray-700">
            Mode infini pour s’entraîner sans limite.
          </div>
          <div className="rounded-xl border border-yellow-200 bg-yellow-100/60 p-4 text-gray-700">
            Défis personnalisés entre amis.
          </div>
        </div>
        <Link
          href="/"
          className="inline-block bg-primary-gray text-white font-semibold px-8 py-3 rounded-xl transition-colors"
        >
          Commencer à jouer
        </Link>
      </section>

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto p-8">
        <div className="space-y-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Ressources clés pour Sutom
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Mot du jour, indices et solutions possibles : tout pour progresser sans spoiler.
          </p>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3 text-left">
          <Link
            href="/sutom-du-jour"
            className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-primary-gray/50 hover:bg-white"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-gray">
              Mot du jour
            </span>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">Sutom du jour</h3>
            <p className="mt-2 text-sm text-gray-600">
              Heure de mise à jour, règles rapides et méthode sans spoiler.
            </p>
          </Link>
          <Link
            href="/indice-sutom"
            className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-primary-gray/50 hover:bg-white"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-gray">
              Indices
            </span>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">Indice Sutom</h3>
            <p className="mt-2 text-sm text-gray-600">
              Comprendre rouge, jaune cerclé et bleu pour avancer vite.
            </p>
          </Link>
          <Link
            href="/solution-sutom"
            className="rounded-xl border border-gray-200 bg-gray-50 p-5 transition hover:border-primary-gray/50 hover:bg-white"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary-gray">
              Solutions possibles
            </span>
            <h3 className="mt-2 text-lg font-semibold text-gray-900">Solution Sutom</h3>
            <p className="mt-2 text-sm text-gray-600">
              Approche sans spoiler + solveur pour filtrer les possibilités.
            </p>
          </Link>
        </div>
      </section>

      {/* How to Play Section */}
      <HowToPlay />

      {/* FAQ Section */}
      <FaqSection
        title={t("faq.title")}
        subtitle={t("faq.subtitle")}
        items={faqEntries}
      />

      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-4xl mx-auto p-8">
        <div className="space-y-6 text-left md:text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Ressources pour progresser sur Sutom
          </h2>
          <p className="text-lg text-gray-600 leading-relaxed">
            Combinez le mot du jour, le mode infini, les défis personnalisés et vos statistiques pour progresser.
          </p>
          <ul className="grid gap-4 md:grid-cols-2 text-sm leading-relaxed text-gray-700">
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-gray block mb-1">Mot du jour synchronisé</span>
              Découvrez la grille officielle à minuit (heure de Paris) et suivez vos résultats.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-gray block mb-1">Mode infini illimité</span>
              Entraînez-vous avec des centaines de mots en mode infini.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-gray block mb-1">Défis personnalisés</span>
              Créez un lien avec un mot secret et défiez vos amis.
            </li>
            <li className="rounded-xl bg-gray-50 p-4">
              <span className="font-semibold text-primary-gray block mb-1">Bonnes pratiques</span>
              Consultez nos conditions d’utilisation et notre politique de confidentialité.
            </li>
          </ul>
        </div>
      </section>

      {/* Create Game Modal */}
      <CreateGameModal
        isOpen={isCreateGameModalOpen}
        handleClose={() => setIsCreateGameModalOpen(false)}
        wordLength={WORD_LENGTH}
        validateWord={validateWord}
        buildChallengeUrl={buildChallengeUrl}
      />

      <PWAInstallPrompt />

      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
    </div>
  );
}
