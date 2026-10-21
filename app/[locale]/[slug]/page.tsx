import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Game from "@/components/game";
import BuscadorTermoClient from "../solveur-sutom/buscador-termo-client";
import WordFinderContent from "@/components/word-finder-content";
import Footer from "@/components/footer";
import HeadInfo from "@/components/head-info";
import { HowToPlay } from "@/components/how-to-play";
import { FaqSection } from "@/components/faq-section";
import { LengthStrategySection } from "@/components/length-strategy";
import {
  buildChallengePath,
  buildLengthOptions,
  buildGuidePath,
  buildSearchHref,
  buildSearchLengthOptions,
  buildGamePath,
  buildSearchPath,
  DEFAULT_GAME_LENGTH,
} from "@/lib/routes";
import {
  SUPPORTED_WORD_LENGTHS,
  type SupportedWordLength,
} from "@/lib/wordLengths";
import { createMetadata } from "@/lib/seo";
import { loadWordList } from "@/lib/words";
import { languages } from "@/i18n/config";
import { getLengthStats } from "@/lib/length-stats";
import { LENGTH_STRATEGIES } from "@/lib/length-strategies";
import { isGuideLength, SUPPORTED_GUIDE_LENGTHS } from "@/lib/guide-lengths";

const SUPPORTED_SET = new Set<number>(SUPPORTED_WORD_LENGTHS);
const GUIDE_SET = new Set<number>(SUPPORTED_GUIDE_LENGTHS);
const GAME_SLUG_REGEX = /^sutom-(\d+)-lettres$/;
const SEARCH_SLUG_REGEX = /^solveur-sutom-(\d+)-lettres$/;
const GUIDE_SLUG_REGEX = /^guide-sutom-(\d+)-lettres$/;

type Params = { locale: string; slug: string };

const parseLengthFromSlug = (
  slug: string,
  pattern: RegExp
): SupportedWordLength | null => {
  const match = pattern.exec(slug);
  if (!match) {
    return null;
  }

  const numeric = Number(match[1]);
  if (!Number.isInteger(numeric)) {
    return null;
  }

  if (!SUPPORTED_SET.has(numeric)) {
    return null;
  }

  return numeric as SupportedWordLength;
};

export function generateStaticParams() {
  return languages.flatMap(({ value: locale }) =>
    SUPPORTED_WORD_LENGTHS.flatMap((length) => {
      const params = [{ locale, slug: `solveur-sutom-${length}-lettres` }];
      if (length !== DEFAULT_GAME_LENGTH) {
        params.unshift({ locale, slug: `sutom-${length}-lettres` });
      }
      if (GUIDE_SET.has(length)) {
        params.push({ locale, slug: `guide-sutom-${length}-lettres` });
      }
      return params;
    })
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const gameLength = parseLengthFromSlug(slug, GAME_SLUG_REGEX);

  if (gameLength) {
    const lengthLabel = `${gameLength} lettres`;
    const tLength = await getTranslations({ locale, namespace: "LengthPage" });
    const lengthMeta = tLength.raw(`meta.${gameLength}`) as
      | { title?: string; description?: string; keywords?: string[] }
      | undefined;

    return createMetadata({
      locale,
      pathname: `/sutom-${gameLength}-lettres`,
      title:
        lengthMeta?.title ??
        `Sutom ${lengthLabel} - Jouez en ${lengthLabel}`,
      description:
        lengthMeta?.description ??
        `Jouez au Sutom avec des mots de ${lengthLabel}. Nouveau mot chaque jour, mode infini et défis personnalisés.`,
      keywords:
        lengthMeta?.keywords ?? [
          `sutom ${gameLength} lettres`,
          `jeu sutom ${gameLength} lettres`,
          `wordle français ${gameLength} lettres`,
          "sutom du jour",
          "mode infini",
        ],
    });
  }

  const searchLength = parseLengthFromSlug(slug, SEARCH_SLUG_REGEX);

  if (searchLength) {
    const t = await getTranslations({ locale, namespace: "BuscadorTermoPage" });
    const lengthMeta = t.raw(`lengthMeta.${searchLength}`) as
      | { title?: string; description?: string; keywords?: string }
      | undefined;

    return createMetadata({
      locale,
      pathname: `/solveur-sutom-${searchLength}-lettres`,
      title: lengthMeta?.title ?? t("seoTitle", { length: searchLength }),
      description:
        lengthMeta?.description ?? t("seoDescription", { length: searchLength }),
      keywords: lengthMeta?.keywords ?? t("seoKeywords", { length: searchLength }),
    });
  }

  const guideLength = parseLengthFromSlug(slug, GUIDE_SLUG_REGEX);
  if (guideLength && isGuideLength(guideLength)) {
    const tGuide = await getTranslations({ locale, namespace: "LengthGuidePage" });
    const lengthMeta = tGuide.raw(`meta.${guideLength}`) as
      | { title?: string; description?: string; keywords?: string }
      | undefined;

    return createMetadata({
      locale,
      pathname: `/guide-sutom-${guideLength}-lettres`,
      title:
        lengthMeta?.title ?? `Guide Sutom ${guideLength} lettres`,
      description:
        lengthMeta?.description ??
        `Guide complet pour le Sutom ${guideLength} lettres : stratégies, mots de départ et astuces.`,
      keywords: lengthMeta?.keywords ?? `guide sutom ${guideLength} lettres`,
    });
  }

  notFound();
}

export default async function DynamicSlugPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { locale, slug } = await params;

  const gameLength = parseLengthFromSlug(slug, GAME_SLUG_REGEX);
  if (gameLength) {
    if (gameLength === DEFAULT_GAME_LENGTH) {
      redirect(buildGamePath(locale, DEFAULT_GAME_LENGTH));
    }
    const lengthOptions = buildLengthOptions(locale);
    const searchHref = buildSearchHref(locale, gameLength);
    const challengePath = buildChallengePath(locale, gameLength);
    const tLength = await getTranslations({ locale, namespace: "LengthPage" });
    const tHome = await getTranslations({ locale, namespace: "HomePage" });
    const tGuide = await getTranslations({ locale, namespace: "LengthGuidePage" });

    const lengthContent = tLength.raw(`lengthContent.${gameLength}`) as {
      headingDescription?: string;
      introParagraphs: string[];
      tips: string[];
      faqTitle: string;
      faqSubtitle: string;
      faq: { question: string; answer: string }[];
    };
    const heading = tLength("heading", { length: gameLength });
    const headingDescription =
      lengthContent?.headingDescription ??
      tLength("headingDescription", { length: gameLength });
    const introParagraphs = lengthContent?.introParagraphs ?? [];
    const tips = lengthContent?.tips ?? [];
    const introTitle = tLength("introTitle", { length: gameLength });
    const tipsTitle = tLength("tipsTitle");
    const linksTitle = tLength("linksTitle");
    const linksIntro = tLength("linksIntro");
    const sameLengthSearchLabel = tLength("sameLengthSearch", { length: gameLength });
    const otherLengthsTitle = tLength("otherLengthsTitle");
    const otherLengthsDescription = tLength("otherLengthsDescription");
    const otherLengths = SUPPORTED_WORD_LENGTHS.filter((length) => length !== gameLength);
    const searchPathSameLength = buildSearchPath(locale, gameLength);
    const lengthStats = getLengthStats(gameLength);
    const lengthStrategy = LENGTH_STRATEGIES[gameLength];
    const howToContent = tLength.raw(`howToPlay.${gameLength}`) as
      | {
          title: string;
          subtitle: string;
          steps: { number: string; title: string; description: string }[];
          tipsTitle: string;
          tipsList: string[];
          stepCaptions?: string[];
        }
      | undefined;
    const guideContent = isGuideLength(gameLength)
      ? (tGuide.raw(`lengths.${gameLength}`) as { title?: string; linkLabel?: string } | undefined)
      : undefined;
    const hasGuide = Boolean(guideContent);
    const guideHref = hasGuide
      ? buildGuidePath(locale, gameLength)
      : "/guide-sutom";
    const guideLabel = hasGuide
      ? guideContent?.linkLabel ?? `Guide Sutom ${gameLength} lettres`
      : tLength("guideLinkFallback");

    // FAQ Data
    const faqEntries = lengthContent?.faq ?? [];
    const faqTitle = lengthContent?.faqTitle ?? tLength("faq.title", { length: gameLength });
    const faqSubtitle = lengthContent?.faqSubtitle ?? tLength("faq.subtitle", { length: gameLength });

    // Structured Data
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

    const rawSteps = tHome.raw('howToPlay.steps');
    const howToEntries = Array.isArray(rawSteps)
      ? (rawSteps as { title: string; description: string }[])
      : [];

    const howToSchema = howToEntries.length
      ? {
        '@type': 'HowTo',
        name: tHome('howToPlay.title'),
        description: tHome('howToPlay.subtitle'),
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

    return (
      <div>
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
        )}
        <main>
          <section className="border-b border-gray-100 bg-yellow-50">
            <div className="mx-auto max-w-5xl px-6 py-10 text-center space-y-3">
              <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
                {heading}
              </h1>
              <p className="text-base text-gray-700 md:text-lg">
                {headingDescription}
              </p>
            </div>
          </section>
          <Game
            wordLength={gameLength}
            lengthOptions={lengthOptions}
            searchHref={searchHref}
            challengePath={challengePath}
          />
          <section className="bg-white/80 border-t border-gray-100">
            <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                  {introTitle}
                </h2>
                {introParagraphs.map((paragraph, index) => (
                  <p key={index} className="text-base md:text-lg text-gray-700 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-gray-900">{tipsTitle}</h3>
                <ul className="grid gap-3 md:grid-cols-2">
                  {tips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-2 rounded-lg bg-primary-gray/5 border border-primary-gray/20 p-3 text-sm md:text-base text-gray-800">
                      <span className="mt-1 h-2 w-2 rounded-full bg-primary-gray" aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <LengthStrategySection
                length={gameLength}
                strategy={lengthStrategy}
                stats={lengthStats}
              />

              {/* How to Play Section */}
              <HowToPlay wordLength={gameLength} content={howToContent} />

              {/* FAQ Section */}
              <FaqSection
                title={faqTitle}
                subtitle={faqSubtitle}
                items={faqEntries}
              />

              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-900">{linksTitle}</h3>
                <p className="text-gray-700 text-sm md:text-base">{linksIntro}</p>
                <div className="flex flex-col gap-3 md:flex-row">
                  <a
                    href={searchPathSameLength}
                    className="inline-flex items-center justify-center rounded-lg bg-primary-gray text-white font-semibold px-5 py-3 hover:bg-primary-gray/80 transition-colors"
                  >
                    {sameLengthSearchLabel}
                  </a>
                  <a
                    href={challengePath}
                    className="inline-flex items-center justify-center rounded-lg border border-primary-gray text-primary-gray font-semibold px-5 py-3 hover:bg-primary-gray/10 transition-colors"
                  >
                    {tLength("currentLengthPlayCta", { length: gameLength })}
                  </a>
                  <a
                    href={guideHref}
                    className="inline-flex items-center justify-center rounded-lg border border-gray-300 text-gray-700 font-semibold px-5 py-3 hover:border-primary-gray hover:text-primary-gray transition-colors"
                  >
                    {guideLabel}
                  </a>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-gray-900">{otherLengthsTitle}</h4>
                <p className="text-gray-700 text-sm md:text-base">{otherLengthsDescription}</p>
                <div className="flex flex-wrap gap-2">
                  {otherLengths.map((length) => (
                    <a
                      key={length}
                      href={buildGamePath(locale, length)}
                      className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:border-primary-gray hover:text-primary-gray transition-colors"
                    >
                      {tLength("otherLengthCta", { length })}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  const searchLength = parseLengthFromSlug(slug, SEARCH_SLUG_REGEX);
  if (searchLength) {
    const t = await getTranslations({ locale, namespace: "BuscadorTermoPage" });
    const lengthOptions = buildSearchLengthOptions(locale);
    const homeHref = buildChallengePath(locale, searchLength);
    const tGuide = await getTranslations({ locale, namespace: "LengthGuidePage" });
    const shouldPrefetchWordList = searchLength <= 7;

    let initialWords: string[] = [];
    if (shouldPrefetchWordList) {
      const { guesses, answers } = await loadWordList(searchLength);
      const wordSet = new Set<string>([...guesses, ...answers]);
      initialWords = Array.from(wordSet).sort();
    }
    const pageSlug = `solveur-sutom-${searchLength}-lettres`;

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: "Solveur Sutom",
        url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://jeuxdelettes.com"}/${pageSlug}`,
        applicationCategory: "Game",
        operatingSystem: "Any",
        description: t("seoDescription", { length: searchLength }),
        inLanguage: locale,
        featureList: [
          "Filtrer les positions exactes",
          "Inclure les lettres présentes",
          "Exclure les lettres absentes",
        ],
      },
    ];

    return (
      <div>
        <HeadInfo structuredData={structuredData} />
        <main className="py-6">
          <BuscadorTermoClient
            initialWords={initialWords}
            wordLength={searchLength}
            lengthOptions={lengthOptions}
            homeHref={homeHref}
          />
          <WordFinderContent
            wordLength={searchLength}
            stats={getLengthStats(searchLength)}
            guideHref={
              isGuideLength(searchLength)
                ? buildGuidePath(locale, searchLength)
                : "/guide-sutom"
            }
              guideLabel={
                isGuideLength(searchLength)
                ? (tGuide.raw(`lengths.${searchLength}.linkLabel`) as string | undefined) ??
                  `Guide Sutom ${searchLength} lettres`
                : t("guideLinkFallback")
            }
          />
        </main>
        <Footer />
      </div>
    );
  }

  const guideLength = parseLengthFromSlug(slug, GUIDE_SLUG_REGEX);
  if (guideLength && isGuideLength(guideLength)) {
    const tGuide = await getTranslations({ locale, namespace: "LengthGuidePage" });
    const guide = tGuide.raw(`lengths.${guideLength}`) as {
      badge: string;
      title: string;
      subtitle: string;
      intro: string;
      opening?: {
        title: string;
        subtitle: string;
        sets: Array<{
          label: string;
          words: Array<{ word: string; meaning: string }>;
        }>;
        note?: string;
        usage?: string;
      };
      toc: Array<{ id: string; label: string }>;
      sections: Array<{
        id: string;
        eyebrow: string;
        title: string;
        paragraphs: string[];
        bullets?: string[];
        callout?: { title: string; text: string };
      }>;
      checklist?: { title: string; items: string[] };
      faq: {
        title: string;
        description: string;
        entries: Array<{ question: string; answer: string }>;
      };
      cta: {
        title: string;
        description: string;
        primaryLabel: string;
        secondaryLabel: string;
      };
      linkLabel?: string;
    } | undefined;

    if (!guide) {
      notFound();
    }

    const guideStats = getLengthStats(guideLength);
    const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jeuxdelettes.com";
    const canonicalUrl = `${siteUrl}/guide-sutom-${guideLength}-lettres`;

    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: guide.title,
      description: guide.subtitle,
      inLanguage: locale === "fr" ? "fr-FR" : locale,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': canonicalUrl,
      },
      author: {
        '@type': 'Organization',
        name: 'Jeux de Lettres',
        url: 'https://jeuxdelettes.com',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Jeux de Lettres',
        url: 'https://jeuxdelettes.com',
        logo: {
          '@type': 'ImageObject',
          url: 'https://jeuxdelettes.com/logo.png',
        },
      },
      datePublished: '2025-01-01',
      dateModified: '2025-10-16',
      articleSection: 'Jeux de lettres',
      keywords: tGuide.raw(`meta.${guideLength}.keywords`) ?? `guide sutom ${guideLength} lettres`,
    };

    return (
      <div className="min-h-screen flex flex-col bg-white">
        <main className="flex-1">
          <section className="bg-yellow-50 py-12">
            <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-gray">
                {guide.badge}
              </p>
              <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                {guide.title}
              </h1>
              <p className="mx-auto max-w-3xl text-base text-gray-700 sm:text-lg">
                {guide.subtitle}
              </p>
              <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600">
                {guide.intro}
              </p>
              <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={buildGamePath(locale, guideLength)}
                  className="inline-flex items-center justify-center rounded-full bg-primary-gray px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
                >
                  {guide.cta.primaryLabel}
                </a>
                <a
                  href={buildSearchPath(locale, guideLength)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-gray/30 px-6 py-2 text-sm font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
                >
                  {guide.cta.secondaryLabel}
                </a>
              </div>
            </div>
          </section>

          <section className="bg-white border-b border-gray-200">
            <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
              <div className="text-center space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-gray">
                  Données du dictionnaire
                </p>
                <h2 className="text-2xl font-bold text-gray-900">
                  Panorama Sutom {guideLength} lettres
                </h2>
                <p className="text-sm text-gray-600">
                  Les statistiques officielles aident à comprendre les blocages fréquents.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {guideStats.answers.wordCount}
                  </p>
                  <p className="text-sm text-gray-600">Réponses officielles</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {guideStats.all.allowCount}
                  </p>
                  <p className="text-sm text-gray-600">Mots acceptés</p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center">
                  <p className="text-2xl font-bold text-gray-900">
                    {formatPercent(guideStats.all.duplicateRate)}
                  </p>
                  <p className="text-sm text-gray-600">Taux de répétition</p>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Lettres fréquentes</h3>
                  <p className="text-sm text-gray-700">
                    {guideStats.all.topLetters
                      .slice(0, 6)
                      .map((item) => item.letter)
                      .join(", ")}
                  </p>
                  <p className="text-xs text-gray-600">
                    Exemple : priorisez ces lettres dans vos deux premiers essais.
                  </p>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900">Terminaisons courantes</h3>
                  <p className="text-sm text-gray-700">
                    {guideStats.all.commonEndings2
                      .slice(0, 5)
                      .map((item) => item.ending)
                      .join(", ")}
                  </p>
                  <p className="text-xs text-gray-600">
                    Exemple : utilisez les terminaisons fréquentes après 3 ou 4 lettres confirmées.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {guide.opening && (
            <section className="bg-white border-b border-gray-200">
              <div className="mx-auto max-w-5xl px-4 py-10 space-y-6">
                <div className="text-center space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-gray">
                    Ouvertures recommandées
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">{guide.opening.title}</h2>
                  <p className="text-sm text-gray-600">{guide.opening.subtitle}</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {guide.opening.sets.map((set) => (
                    <div
                      key={set.label}
                      className="rounded-xl border border-gray-200 bg-gray-50 p-5 space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">
                        {set.label}
                      </h3>
                      <ul className="space-y-2 text-sm text-gray-700">
                        {set.words.map((item) => (
                          <li key={item.word} className="flex items-start gap-2">
                            <span className="inline-flex items-center rounded-full border border-primary-gray/30 bg-white px-2 py-0.5 text-xs font-semibold text-primary-gray">
                              {item.word}
                            </span>
                            <span>{item.meaning}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
                {guide.opening.note && (
                  <p className="text-xs text-gray-500 text-center">{guide.opening.note}</p>
                )}
                {guide.opening.usage && (
                  <p className="text-sm text-gray-700 text-center">{guide.opening.usage}</p>
                )}
              </div>
            </section>
          )}

          <nav className="border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
            <div className="mx-auto flex max-w-5xl flex-wrap gap-3 px-4 py-4 text-sm">
              {guide.toc.map((item) => (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className="rounded-full border border-gray-200 px-4 py-1 text-gray-600 transition hover:border-primary-gray hover:text-primary-gray"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </nav>

          <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
            {guide.sections.map((section) => (
              <section key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary-gray">
                    {section.eyebrow}
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                </div>

                <div className="space-y-3 text-sm leading-relaxed text-gray-700">
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>

                {section.bullets && section.bullets.length > 0 && (
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {section.bullets.map((item) => (
                      <li key={item} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                        {item}
                      </li>
                    ))}
                  </ul>
                )}

                {section.callout && (
                  <div className="rounded-xl border border-primary-gray/20 bg-yellow-50 p-5">
                    <h3 className="text-lg font-semibold text-gray-900">{section.callout.title}</h3>
                    <p className="mt-2 text-sm text-gray-700">{section.callout.text}</p>
                  </div>
                )}
              </section>
            ))}

            {guide.checklist && (
              <section className="rounded-2xl border border-primary-gray/20 bg-yellow-50 p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">{guide.checklist.title}</h3>
                <ul className="grid gap-3 sm:grid-cols-2 text-sm text-gray-700">
                  {guide.checklist.items.map((item) => (
                    <li key={item} className="rounded-lg border border-white/60 bg-white p-3">
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section id="faq" className="space-y-6 scroll-mt-24">
              <div className="space-y-2 text-center">
                <h2 className="text-2xl font-bold text-gray-900">{guide.faq.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{guide.faq.description}</p>
              </div>
              <div className="space-y-4">
                {guide.faq.entries.map((entry, index) => (
                  <details key={entry.question} className="group rounded-xl border border-gray-200 bg-white/80 p-4">
                    <summary className="flex cursor-pointer items-center justify-between text-left text-sm font-semibold text-gray-800">
                      <span>
                        <span className="mr-3 text-primary-gray">{index + 1}.</span>
                        {entry.question}
                      </span>
                      <span className="text-primary-gray transition group-open:-rotate-180">▼</span>
                    </summary>
                    <p className="mt-3 text-sm leading-relaxed text-gray-600">
                      {entry.answer}
                    </p>
                  </details>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border border-gray-200 bg-gray-50 p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900">{guide.cta.title}</h3>
              <p className="mt-2 text-sm text-gray-600">{guide.cta.description}</p>
              <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <a
                  href={buildGamePath(locale, guideLength)}
                  className="inline-flex items-center justify-center rounded-full bg-primary-gray px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
                >
                  {guide.cta.primaryLabel}
                </a>
                <a
                  href={buildSearchPath(locale, guideLength)}
                  className="inline-flex items-center justify-center rounded-full border border-primary-gray/30 px-6 py-2 text-sm font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
                >
                  {guide.cta.secondaryLabel}
                </a>
              </div>
            </section>
          </div>
        </main>

        <Footer />

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </div>
    );
  }

  notFound();
}
