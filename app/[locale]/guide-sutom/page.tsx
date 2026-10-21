import type { Metadata } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { BarChart3 } from "lucide-react";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";

const sections = [
  {
    id: "introducao",
    titleKey: "intro.title",
    descriptionKey: "intro.description",
  },
  {
    id: "estrategias",
    titleKey: "strategies.title",
    descriptionKey: "strategies.description",
  },
    {
      id: "modes-de-jeu",
      titleKey: "modes.title",
      descriptionKey: "modes.description",
    },
  {
    id: "desafios",
    titleKey: "challenges.title",
    descriptionKey: "challenges.description",
  },
  {
    id: "estatisticas",
    titleKey: "stats.title",
    descriptionKey: "stats.description",
  },
  {
    id: "recursos",
    titleKey: "resources.title",
    descriptionKey: "resources.description",
  },
  {
    id: "faq",
    titleKey: "faq.title",
    descriptionKey: "faq.description",
  },
] as const;


export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "GuidePage" });

  return createMetadata({
    locale,
    pathname: "/guide-sutom",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default function GuidePage() {
  const locale = useLocale();
  const t = useTranslations("GuidePage");

  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "Jeux de Lettres", path: "/" },
      { name: t("hero.title"), path: "/guide-sutom" },
    ],
  });
  const breadcrumbStructuredDataJson = JSON.stringify(breadcrumbStructuredData);

  const guideSections = sections.map((entry) => {
    // Get the correct items key based on the mapping
    let itemsKey = `${entry.id}.items`;
    if (entry.id === "introducao") itemsKey = "intro.items";
    else if (entry.id === "estrategias") itemsKey = "strategies.items";
    else if (entry.id === "modes-de-jeu") itemsKey = "modes.items";
    else if (entry.id === "desafios") itemsKey = "challenges.items";
    else if (entry.id === "estatisticas") itemsKey = "stats.items";
    else if (entry.id === "recursos") itemsKey = "resources.items";
    else if (entry.id === "faq") itemsKey = "faq.entries";

    let items: string[] | undefined;
    if (entry.id === "faq") {
      // For FAQ, extract questions from entries
      const faqEntries = t.raw("faq.entries") as Array<{ question: string; answer: string }>;
      items = faqEntries?.map(entry => entry.question);
    } else {
      items = t.raw(itemsKey) as string[] | undefined;
    }

    return {
      ...entry,
      title: t(entry.titleKey),
      description: t(entry.descriptionKey),
      items,
    };
  });

  const faqEntries = t.raw("faq.entries") as Array<{ question: string; answer: string }>;
  const lengthGuideItems = t.raw("lengthGuides.items") as Array<{
    title: string;
    description: string;
    href: string;
  }>;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jeuxdelettes.com";
  const canonicalUrl = `${siteUrl}/guide-sutom`;

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t("hero.title"),
    description: t("meta.description"),
    inLanguage: locale === "fr" ? "fr-FR" : locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    potentialAction: {
      '@type': 'ReadAction',
      target: canonicalUrl,
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
    keywords: t("meta.keywords"),
  };

  const faqStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqEntries.map((entry) => ({
      '@type': 'Question',
      name: entry.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: entry.answer,
      },
    })),
  };

  const howToStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Comment jouer à Sutom - Guide complet',
    description: 'Apprenez à jouer à Sutom en moins d’une minute',
    image: 'https://jeuxdelettes.com/icon.png',
    step: [
      {
        '@type': 'HowToStep',
        name: 'Entrez un mot',
        text: 'Commencez par un mot français de 6 lettres.',
        image: 'https://jeuxdelettes.com/icon.png',
      },
      {
        '@type': 'HowToStep',
        name: 'Lisez les couleurs',
        text: '🟥 Rouge : lettre bien placée | 🟡 Jaune cerclé : lettre présente | 🟦 Bleu : lettre absente',
        image: 'https://jeuxdelettes.com/icon.png',
      },
      {
        '@type': 'HowToStep',
        name: 'Affinez vos essais',
        text: 'Gardez les rouges, repositionnez les jaunes et éliminez les bleues.',
        image: 'https://jeuxdelettes.com/icon.png',
      },
      {
        '@type': 'HowToStep',
        name: 'Trouvez le mot',
        text: 'Vous avez 6 essais pour deviner le mot du jour.',
        image: 'https://jeuxdelettes.com/icon.png',
      },
    ],
  };

  const courseStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: 'Guide complet Sutom',
    description: 'Stratégies gagnantes et astuces pour maîtriser Sutom',
    provider: {
      '@type': 'Organization',
      name: 'Jeux de Lettres',
      url: 'https://jeuxdelettes.com',
    },
    hasCourseInstance: {
      '@type': 'CourseInstance',
      courseMode: 'online',
      instructor: {
        '@type': 'Organization',
        name: 'Jeux de Lettres',
      },
    },
    teaches: [
      'Stratégies d’ouverture pour Sutom',
      'Interprétation des couleurs',
      'Choix de mots de départ',
      'Analyse des statistiques',
      'Mode infini',
      'Défis personnalisés',
    ],
    inLanguage: locale === "fr" ? "fr-FR" : locale,
    about: [
      'Jeu de lettres',
      'Sutom',
      'Wordle français',
      'Stratégies de jeu',
    ],
  };

  const videoGameStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'VideoGame',
    name: 'Sutom - Jeu de lettres en français',
    description: 'Jouez à Sutom en ligne gratuitement : mot du jour, mode infini et défis.',
    url: 'https://jeuxdelettes.com',
    genre: ['Puzzle', 'Word Game', 'Educational'],
    gamePlatform: 'Web Browser',
    applicationCategory: 'Game',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'EUR',
      availability: 'https://schema.org/InStock',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jeux de Lettres',
      url: 'https://jeuxdelettes.com',
    },
    inLanguage: 'fr-FR',
  };

  const structuredDataJson = JSON.stringify(structuredData);
  const faqStructuredDataJson = JSON.stringify(faqStructuredData);
  const howToStructuredDataJson = JSON.stringify(howToStructuredData);
  const courseStructuredDataJson = JSON.stringify(courseStructuredData);
  const videoGameStructuredDataJson = JSON.stringify(videoGameStructuredData);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <section className="bg-yellow-50 py-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-6 px-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-gray">
              Académie Sutom
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("hero.title")}</h1>
            <p className="mx-auto max-w-3xl text-base text-gray-700 sm:text-lg">
              {t("hero.subtitle")}
            </p>
            <p className="mx-auto max-w-3xl text-sm leading-relaxed text-gray-600">
              {t("hero.content")}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#introducao"
                className="inline-flex items-center justify-center rounded-full bg-primary-gray px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
              >
                {t("hero.cta")}
              </Link>
              <Link
                href="#modes-de-jeu"
                className="inline-flex items-center justify-center rounded-full border border-primary-gray/30 px-6 py-2 text-sm font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
              >
                {t("modes.title")}
              </Link>
            </div>
          </div>
        </section>

        <nav className="border-b border-gray-200 bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
          <div className="mx-auto flex max-w-5xl flex-wrap gap-3 px-4 py-4 text-sm">
            {guideSections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="rounded-full border border-gray-200 px-4 py-1 text-gray-600 transition hover:border-primary-gray hover:text-primary-gray"
              >
                {section.title}
              </a>
            ))}
          </div>
        </nav>

        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
          {guideSections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-6 scroll-mt-24">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-primary-gray">
                  {section.id.replace("-", " ")}
                </p>
                <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
                <p className="text-sm leading-relaxed text-gray-600">{section.description}</p>
              </div>

              {section.items && section.items.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2">
                  {section.items.map((item) => (
                    <li key={item} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm leading-relaxed text-gray-700">
                      {item}
                    </li>
                  ))}
                </ul>
              )}

              {section.id === "estatisticas" && (
                <div className="rounded-xl border border-primary-gray/20 bg-yellow-50 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {t("stats.cta")}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4">
                    {t("stats.ctaDescription")}
                  </p>
                  <div className="flex gap-3">
                    <Link
                      href="/"
                      className="inline-flex items-center justify-center rounded-full bg-primary-gray px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
                    >
                      <BarChart3 className="h-4 w-4 mr-2" />
                      Voir les statistiques
                    </Link>
                    <span className="inline-flex items-center text-xs text-gray-500">
                      📊 Icône en haut à droite
                    </span>
                  </div>
                </div>
              )}
            </section>
          ))}

          <section id="faq" className="space-y-6 scroll-mt-24">
            <div className="space-y-2 text-center">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary-gray">
                FAQ Sutom
              </p>
              <h2 className="text-2xl font-bold text-gray-900">{t("faq.title")}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{t("faq.description")}</p>
            </div>
            <div className="space-y-4">
              {faqEntries.map((entry, index) => (
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

          <section className="rounded-2xl border border-primary-gray/20 bg-yellow-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Autres ressources</h3>
            <p className="mt-2 text-sm text-gray-600">
              Explorez des contenus complémentaires sur le mot du jour, les défis et les jeux de lettres.
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {(t.raw("pointers") as Array<{ title: string; description: string; href: string }>).map((pointer) => (
                <Link
                  key={pointer.href}
                  href={pointer.href}
                  className="rounded-xl border border-white/60 bg-white p-4 text-sm leading-relaxed text-gray-700 transition hover:border-primary-gray/40"
                >
                  <span className="font-semibold text-primary-gray block mb-1">{pointer.title}</span>
                  {pointer.description}
                </Link>
              ))}
            </div>
          </section>

          <section className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{t("lengthGuides.title")}</h2>
              <p className="text-sm text-gray-600">{t("lengthGuides.description")}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {lengthGuideItems?.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:border-primary-gray/50 hover:bg-white"
                >
                  <h3 className="font-semibold text-primary-gray mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-600">{item.description}</p>
                </Link>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Link href="/" className="rounded-xl border border-gray-200 bg-gray-50 p-6 text-left transition hover:border-primary-gray/50 hover:bg-white">
                <h3 className="font-semibold text-primary-gray mb-2">← Retour au jeu</h3>
                <p className="text-sm text-gray-600">Jouez le mot du jour et entraînez-vous en mode infini</p>
              </Link>
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-6">
                <h3 className="font-semibold text-gray-800 mb-2">📊 Améliorez vos statistiques</h3>
                <p className="text-sm text-gray-600">Suivez vos progrès et améliorez votre niveau</p>
                <Link href="/" className="text-primary-gray text-sm font-medium mt-2 inline-block">Voir les statistiques →</Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: breadcrumbStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: howToStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: courseStructuredDataJson }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: videoGameStructuredDataJson }} />
    </div>
  );
}
