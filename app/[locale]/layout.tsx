import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { ThemeProvider } from "@/components/theme-provider";
import { createSiteStructuredData } from "@/lib/seo";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL?.trim() || "https://jeuxdelettes.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "Jeux de Lettres",
};

export default async function RootLayout(
  props: Readonly<{
    children: React.ReactNode;
    params: Promise<{ locale: string }>;
  }>
) {
  const params = await props.params;
  const { locale } = params;
  const { children } = props;
  const siteStructuredData = createSiteStructuredData(locale);
  const siteStructuredDataJson = JSON.stringify(siteStructuredData);

  if (!routing.locales.includes(locale as (typeof routing.locales)[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <>
      <NextIntlClientProvider messages={messages}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </NextIntlClientProvider>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: siteStructuredDataJson }} />
    </>
  );
}
