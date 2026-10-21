'use client';

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export default function Footer() {
  const t = useTranslations("Footer");

  const navLinks = [
    { href: "/sutom-du-jour", label: t("nav.day") },
    { href: "/indice-sutom", label: t("nav.indice") },
    { href: "/solution-sutom", label: t("nav.solution") },
    { href: "/sutom-5-lettres", label: t("nav.play5") },
    { href: "/", label: t("nav.play6") },
    { href: "/sutom-7-lettres", label: t("nav.play7") },
    { href: "/solveur-sutom", label: t("nav.search") },
    { href: "/guide-sutom", label: t("nav.guide") },
  ];

  const utilityLinks = [
    { href: "/confidentialite", label: t("privacy") },
    { href: "/conditions-utilisation", label: t("terms") },
  ];

  const partnerLinks = [
    // { name: 'Morse Code Kit', href: 'https://morsecodekit.com/', follow: true },
    // { name: 'PrintableGen', href: 'https://printablegen.com/', follow: true },
    // { name: 'Generate Org Chart', href: 'https://generateorgchart.com/', follow: true },
    // { name: 'Size Chart Kit', href: 'https://sizechartkit.com/', follow: true },
    // { name: 'Device Test Tools', href: 'https://devicetesttools.com/', follow: true },
    // { name: 'IBAN Tools', href: 'https://ibantools.net/', follow: true },
    // { name: 'Randlyx', href: 'https://randlyx.com/', follow: true },
    // { name: 'Subnautica Hub', href: 'https://subnauticahub.com/', follow: true },
    // { name: 'Test Score Hub', href: 'https://testscorehub.com/', follow: true },
    // { name: 'EasyPdfNow', href: 'https://easypdfnow.com/', follow: true },
    // { name: 'Solarpunk Hub', href: 'https://solarpunkhub.com/', follow: true },
    // { name: "GAG2Hub", href: "https://gag2hub.com/", follow: true },
    { name: 'SudokuAgora', href: 'https://sudokuagora.com/', follow: true },
    { name: 'SudokuDefi', href: 'https://sudokudefi.com/', follow: true },
  ];

  return (
    <footer className="border-t border-gray-200 py-6">
      <div className="container mx-auto px-4 text-center space-y-4">
        <nav className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-sm font-medium text-gray-700">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-gray-600 hover:text-primary-gray transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-gray-500">
          {utilityLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="hover:text-primary-gray transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
          <span className="text-gray-600">Liens recommandés:</span>
          {partnerLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel={item.follow ? 'noopener noreferrer' : 'nofollow noopener noreferrer'}
              className="text-green-600 hover:text-green-700 transition-colors"
            >
              {item.name}
            </a>
          ))}
        </div>
        <p className="text-gray-400 text-xs">{t("copyright")}</p>
      </div>
    </footer>
  );
}
