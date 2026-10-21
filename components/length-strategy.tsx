import type { LengthStats } from "@/lib/length-stats";
import type { LengthStrategy } from "@/lib/length-strategies";

interface LengthStrategySectionProps {
  length: number;
  strategy: LengthStrategy;
  stats: LengthStats;
}

export function LengthStrategySection({ length, strategy, stats }: LengthStrategySectionProps) {
  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto p-8 md:p-10 space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-gray">
          Plan de jeu
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Stratégie pour Sutom {length} lettres
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          {strategy.intro}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[strategy.opening, strategy.midgame, strategy.endgame, strategy.pitfalls].map((section) => (
          <div
            key={section.title}
            className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-3"
          >
            <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              {section.bullets.map((item) => (
                <li key={item} className="flex items-start gap-2">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary-gray" aria-hidden />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-primary-gray/20 bg-yellow-50 p-6 space-y-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Mots d’ouverture suggérés
          </h3>
          <p className="text-sm text-gray-600">
            Sélectionnés parmi les réponses pour couvrir les lettres fréquentes.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {stats.answers.starterWords.map((word) => (
            <span
              key={word}
              className="inline-flex items-center rounded-full border border-primary-gray/30 bg-white px-3 py-1 text-sm font-semibold text-primary-gray"
            >
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-6 space-y-3">
        <h3 className="text-lg font-semibold text-gray-900">{strategy.example.title}</h3>
        <ol className="space-y-2 text-sm text-gray-700">
          {strategy.example.steps.map((step, index) => (
            <li key={step} className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary-gray/10 text-xs font-bold text-primary-gray">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
