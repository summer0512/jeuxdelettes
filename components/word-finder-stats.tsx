import type { LengthStats } from "@/lib/length-stats";

interface WordFinderStatsProps {
  wordLength: number;
  stats: LengthStats;
}

const formatPercent = (value: number) => `${(value * 100).toFixed(1)}%`;

export function WordFinderStats({ wordLength, stats }: WordFinderStatsProps) {
  const answerCount = stats.answers.wordCount;
  const allowCount = stats.all.allowCount;
  const totalCount = stats.all.wordCount;

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-100 max-w-5xl mx-auto p-8 md:p-10 space-y-8">
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary-gray">
          Panorama du dictionnaire
        </p>
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
          Données {wordLength} lettres
        </h2>
        <p className="text-base md:text-lg text-gray-600 max-w-3xl mx-auto">
          Statistiques du dictionnaire pour affiner vos filtres et accélérer votre recherche.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "Réponses officielles", value: answerCount },
          { label: "Mots acceptés", value: allowCount },
          { label: "Total analysé", value: totalCount },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-xl border border-gray-200 bg-gray-50 p-4 text-center"
          >
            <p className="text-2xl font-bold text-gray-900">{item.value}</p>
            <p className="text-sm text-gray-600">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Moyenne de voyelles</h3>
          <p className="text-2xl font-bold text-primary-gray">{stats.all.vowelAverage}</p>
          <p className="text-sm text-gray-600">
            Nombre moyen de voyelles par mot.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Lettres répétées</h3>
          <p className="text-2xl font-bold text-primary-gray">
            {formatPercent(stats.all.duplicateRate)}
          </p>
          <p className="text-sm text-gray-600">
            Proportion de mots contenant une lettre doublée.
          </p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-2">
          <h3 className="text-sm font-semibold text-gray-900">Voyelles fréquentes</h3>
          <p className="text-2xl font-bold text-primary-gray">
            {stats.all.topLetters
              .filter((item) => ["A", "E", "I", "O", "U", "Y"].includes(item.letter))
              .slice(0, 3)
              .map((item) => item.letter)
              .join(" ")}
          </p>
          <p className="text-sm text-gray-600">
            Utilisez-les tôt pour réduire les options.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Lettres les plus fréquentes</h3>
          <div className="flex flex-wrap gap-2">
            {stats.all.topLetters.map((item) => (
              <span
                key={item.letter}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700"
              >
                {item.letter} ({formatPercent(item.share)})
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-6 space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Terminaisons courantes</h3>
          <p className="text-sm text-gray-600">
            Les terminaisons fréquentes aident à verrouiller la fin du mot.
          </p>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {stats.all.commonEndings2.map((item) => (
                <span
                  key={item.ending}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700"
                >
                  {item.ending} ({formatPercent(item.share)})
                </span>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {stats.all.commonEndings3.map((item) => (
                <span
                  key={item.ending}
                  className="inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-sm font-semibold text-gray-700"
                >
                  {item.ending} ({formatPercent(item.share)})
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
