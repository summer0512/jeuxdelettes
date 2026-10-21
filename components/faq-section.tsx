"use client";

interface FaqEntry {
    question: string;
    answer: string;
}

interface FaqSectionProps {
    title: string;
    subtitle: string;
    items: FaqEntry[];
}

export function FaqSection({ title, subtitle, items }: FaqSectionProps) {
    return (
        <section className="bg-yellow-50 p-8 md:p-10">
            <div className="max-w-4xl mx-auto space-y-4">
                <div className="text-center mb-10">
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                        {title}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">{subtitle}</p>
                </div>
                {items.map((item, i) => (
                    <div
                        key={i}
                        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 hover:shadow-md transition-all duration-300"
                    >
                        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
                            <span className="w-6 h-6 bg-primary-gray rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                                ?
                            </span>
                            {item.question}
                        </h3>
                        <p className="text-gray-700 leading-relaxed ml-9">{item.answer}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}
