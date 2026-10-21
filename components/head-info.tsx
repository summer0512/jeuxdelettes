import Script from "next/script";

export type StructuredData = Record<string, unknown>;

interface HeadInfoProps {
  structuredData?: StructuredData[];
}

export default function HeadInfo({ structuredData }: HeadInfoProps) {
  if (!structuredData?.length) {
    return null;
  }

  return (
    <>
      {structuredData.map((schema, index) => (
        <Script
          key={`structured-data-${index}`}
          id={`structured-data-${index}`}
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(schema),
          }}
        />
      ))}
    </>
  );
}
