import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { buildSearchHref } from "@/lib/routes";
import { createMetadata } from "@/lib/seo";

const DEFAULT_LENGTH = 6 as const;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "BuscadorTermoPage" });

  return createMetadata({
    locale,
    pathname: "/solveur-sutom",
    title: t("seoTitle", { length: DEFAULT_LENGTH }),
    description: t("seoDescription", { length: DEFAULT_LENGTH }),
    keywords: t("seoKeywords", { length: DEFAULT_LENGTH }),
  });
}

export default async function SolveurSutomRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const target = buildSearchHref(locale, DEFAULT_LENGTH);
  redirect(target);
}
