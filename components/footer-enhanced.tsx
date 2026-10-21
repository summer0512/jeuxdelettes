'use client';

import Link from 'next/link';

export default function FooterEnhanced() {
  return (
    <>
      {/* Main Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 flex">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand Section */}
            <div className="md:col-span-1">
              <h3 className="text-xl font-bold mb-4">Sutom</h3>
              <p className="text-gray-300 text-sm mb-4">
                Le jeu de lettres quotidien le plus populaire en français.
              </p>
              <p className="text-gray-400 text-xs">
                jeuxdelettes.com © 2026
              </p>
            </div>

            {/* Game Modes */}
            <div>
              <h4 className="font-semibold mb-4">Modes de jeu</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Mot du jour
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Mode infini
                  </Link>
                </li>
                <li>
                  <Link href="/" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Défis personnalisés
                  </Link>
                </li>
              </ul>
            </div>

            {/* Guides & Tips */}
            <div>
              <h4 className="font-semibold mb-4">Guides & astuces</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/guide-sutom" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Guide Sutom
                  </Link>
                </li>
                <li>
                  <Link href="/solveur-sutom" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Solveur Sutom
                  </Link>
                </li>
                <li>
                  <Link href="/guide-sutom" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Sutom & Wordle
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a 
                    href="mailto:contact@jeuxdelettes.com?subject=Sutom" 
                    className="text-gray-300 hover:text-primary-gray transition-colors"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <Link href="/confidentialite" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Politique de confidentialité
                  </Link>
                </li>
                <li>
                  <Link href="/conditions-utilisation" className="text-gray-300 hover:text-primary-gray transition-colors">
                    Conditions d’utilisation
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              Sutom - Le meilleur jeu de lettres en français |
              <span className="ml-2">
                <Link href="/" className="text-blue-400 hover:text-blue-300">
                  Jouer maintenant
                </Link>
              </span>
            </p>
          </div>
        </div>
      </footer>
    </>
  );
}
