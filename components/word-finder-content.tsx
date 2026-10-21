import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import type { LengthStats } from "@/lib/length-stats";
import { WordFinderStats } from "@/components/word-finder-stats";

interface WordFinderContentProps {
    wordLength: number;
    stats: LengthStats;
    guideHref?: string;
    guideLabel?: string;
}

export default function WordFinderContent({ wordLength, stats, guideHref, guideLabel }: WordFinderContentProps) {
    const t = useTranslations("WordFinderPage");
    const rawLengthContent = t.raw(`lengthContent.${wordLength}`) as {
        sections?: Array<{
            id: string;
            badge: string;
            title: string;
            description: string;
            paragraphs: string[];
            bullets?: string[];
        }>;
        faq?: {
            title: string;
            description: string;
            entries: Array<{ question: string; answer: string }>;
        };
    };

    const rawSections = rawLengthContent?.sections ?? t.raw("sections");
    const sections = Array.isArray(rawSections) ? rawSections : [];

    const rawFaq = rawLengthContent?.faq?.entries ?? t.raw("faq.entries");
    const faqEntries = Array.isArray(rawFaq) ? rawFaq : [];
    const faqTitle = rawLengthContent?.faq?.title ?? t("faq.title");
    const faqDescription = rawLengthContent?.faq?.description ?? t("faq.description");

    return (
        <div className="w-full space-y-12 py-12">
            {/* Content Sections */}
            <div className="mx-auto max-w-5xl space-y-16 px-4">
                {sections.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-24 space-y-6">
                        <div className="space-y-3 text-center md:text-left">
                            <span className="inline-block rounded-full bg-primary-gray/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-gray">
                                {section.badge}
                            </span>
                            <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                                {section.title}
                            </h2>
                            <p className="text-lg text-gray-600 leading-relaxed">
                                {section.description}
                            </p>
                        </div>

                        <div className="space-y-4 text-gray-700 leading-relaxed">
                            {section.paragraphs.map((paragraph: string, idx: number) => (
                                <p key={idx}>{paragraph}</p>
                            ))}
                        </div>

                        {section.bullets && section.bullets.length > 0 && (
                            <ul className="grid gap-3 md:grid-cols-2">
                                {section.bullets.map((bullet: string, idx: number) => (
                                    <li
                                        key={idx}
                                        className="flex items-start gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
                                    >
                                        <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary-gray" />
                                        <span>{bullet}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                ))}
            </div>

            <WordFinderStats wordLength={wordLength} stats={stats} />

            {/* FAQ Section */}
            <section className="bg-yellow-50 py-12">
                <div className="mx-auto max-w-4xl px-4">
                    <div className="mb-10 text-center space-y-4">
                        <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">
                            {faqTitle}
                        </h2>
                        <p className="mx-auto max-w-2xl text-lg text-gray-600">
                            {faqDescription}
                        </p>
                    </div>

                    <div className="grid gap-4">
                        {faqEntries.map((entry, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-gray-200 bg-white/80 p-6 shadow-sm transition hover:shadow-md"
                            >
                                <h3 className="flex items-start gap-3 text-lg font-semibold text-gray-900">
                                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-gray text-xs font-bold text-white">
                                        ?
                                    </span>
                                    {entry.question}
                                </h3>
                                <p className="mt-3 pl-9 text-gray-600 leading-relaxed">
                                    {entry.answer}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="mx-auto max-w-4xl px-4 text-center">
                <div className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-8 md:p-12 text-white shadow-xl">
                    <h2 className="text-2xl font-bold md:text-3xl mb-4">
                        Prêt à tester votre vocabulaire ?
                    </h2>
                    <p className="mb-8 text-gray-300 text-lg max-w-2xl mx-auto">
                        Maintenant que vous connaissez les meilleures stratégies, revenez au jeu et testez-vous avec le mot du jour.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            href="/"
                            className="inline-flex items-center justify-center rounded-full bg-primary-gray px-8 py-3 text-base font-bold text-white transition hover:bg-primary-gray/90"
                        >
                            Jouer maintenant
                        </Link>
                        <Link
                            href={guideHref ?? "/guide-sutom"}
                            className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-8 py-3 text-base font-bold text-white transition hover:bg-white/20"
                        >
                            {guideLabel ?? "Lire le guide complet"}
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
