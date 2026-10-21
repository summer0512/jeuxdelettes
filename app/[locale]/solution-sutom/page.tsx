import type { Metadata } from "next";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import Footer from "@/components/footer";
import { createBreadcrumbStructuredData, createMetadata } from "@/lib/seo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "SolutionPage" });

  return createMetadata({
    locale,
    pathname: "/solution-sutom",
    title: t("meta.title"),
    description: t("meta.description"),
    keywords: t("meta.keywords"),
  });
}

export default function SolutionPage() {
  const locale = useLocale();
  const t = useTranslations("SolutionPage");

  const sections = t.raw("sections") as Array<{
    id: string;
    title: string;
    description: string;
    items: string[];
  }>;
  const faqEntries = t.raw("faq.entries") as Array<{ question: string; answer: string }>;

  const breadcrumbStructuredData = createBreadcrumbStructuredData({
    locale,
    items: [
      { name: "Jeux de Lettres", path: "/" },
      { name: t("hero.title"), path: "/solution-sutom" },
    ],
  });

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jeuxdelettes.com";
  const canonicalUrl = `${siteUrl}/solution-sutom`;

  const articleStructuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t("hero.title"),
    description: t("meta.description"),
    inLanguage: locale === "fr" ? "fr-FR" : locale,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    },
    author: {
      '@type': 'Organization',
      name: 'Jeux de Lettres',
      url: siteUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Jeux de Lettres',
      url: siteUrl,
    },
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

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <main className="flex-1">
        <section className="bg-yellow-50 py-12">
          <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary-gray">
              {t("hero.subtitle")}
            </p>
            <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
              {t("hero.title")}
            </h1>
            <p className="mx-auto max-w-3xl text-base text-gray-700">
              {t("hero.description")}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-primary-gray px-6 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
              >
                {t("hero.ctaPlay")}
              </Link>
              <Link
                href="/solveur-sutom"
                className="inline-flex items-center justify-center rounded-full border border-primary-gray/30 px-6 py-2 text-sm font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
              >
                {t("hero.ctaSolver")}
              </Link>
            </div>
          </div>
        </section>

        <div className="mx-auto flex max-w-5xl flex-col gap-12 px-4 py-12">
          {sections.map((section) => (
            <section key={section.id} id={section.id} className="space-y-4 scroll-mt-24">
              <h2 className="text-2xl font-bold text-gray-900">{section.title}</h2>
              <p className="text-sm leading-relaxed text-gray-600">{section.description}</p>
              <ul className="grid gap-3 sm:grid-cols-2">
                {section.items.map((item) => (
                  <li key={item} className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-700">
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <section className="rounded-2xl border border-primary-gray/20 bg-yellow-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900">Pas de spoiler, mais un coup de main</h3>
            <p className="mt-2 text-sm text-gray-600">
              Le solveur vous aide à converger vers la solution sans la révéler directement.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/solveur-sutom"
                className="inline-flex items-center justify-center rounded-full bg-primary-gray px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-gray/80"
              >
                Ouvrir le solveur
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full border border-primary-gray/30 px-5 py-2 text-sm font-semibold text-primary-gray transition hover:border-primary-gray hover:text-primary-gray"
              >
                Revenir au jeu
              </Link>
            </div>
          </section>

          <section id="faq" className="space-y-4 scroll-mt-24">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold text-gray-900">{t("faq.title")}</h2>
              <p className="text-sm text-gray-600">{t("faq.description")}</p>
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
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{entry.answer}</p>
                </details>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleStructuredData) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </div>
  );
}
