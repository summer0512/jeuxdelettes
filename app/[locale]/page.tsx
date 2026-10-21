import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import Game from "@/components/game";
import SEOContent from "@/components/seo-content";
import Footer from "@/components/footer";
import { createMetadata } from "@/lib/seo";
import {
  buildChallengePath,
  buildLengthOptions,
  buildSearchHref,
} from "@/lib/routes";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "HomePage" });

  return createMetadata({
    locale,
    pathname: "/",
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
  });
}

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const wordLength = 6 as const;
  const lengthOptions = buildLengthOptions(locale);
  const searchHref = buildSearchHref(locale, wordLength);
  const challengePath = buildChallengePath(locale, wordLength);

  return (
    <div>
      <main>
        <Game
          wordLength={wordLength}
          lengthOptions={lengthOptions}
          searchHref={searchHref}
          challengePath={challengePath}
        />
        <SEOContent locale={locale} />
      </main>
      <Footer />
    </div>
  );
}
