import { readFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { SUPPORTED_WORD_LENGTHS, type SupportedWordLength } from "@/lib/wordLengths";
import type { WordListJson } from "@/lib/wordlist-json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ALLOW_IN_PRODUCTION =
  process.env.SUTOM_ALLOW_LOCAL_WORDLIST_ENDPOINT === "true";

const isLocalEndpointEnabled = (): boolean => {
  if (ALLOW_IN_PRODUCTION) {
    return true;
  }
  return process.env.NODE_ENV !== "production";
};

const ensureSupportedLength = (
  value: number
): value is SupportedWordLength =>
  SUPPORTED_WORD_LENGTHS.includes(value as SupportedWordLength);

const normalizeResponsePayload = (
  data: WordListJson
): WordListJson => ({
  length: data.length,
  guesses: data.guesses,
  answers: data.answers,
  allow: data.allow,
  answer: data.answer,
  accentMap: data.accentMap ?? {},
  stats: data.stats,
  version: data.version,
  checksum: data.checksum,
  generatedAt: data.generatedAt,
});

const resolveLocalDirectory = (): string => {
  const configured = process.env.SUTOM_LOCAL_WORDLIST_DIR?.trim();
  if (configured) {
    return path.isAbsolute(configured)
      ? configured
      : path.join(process.cwd(), configured);
  }
  return path.join(process.cwd(), "dictionary", "generated");
};

const readLocalWordListJson = async (
  length: SupportedWordLength
): Promise<WordListJson> => {
  const directory = resolveLocalDirectory();
  const filename = `${length.toString().padStart(2, "0")}.json`;
  const filePath = path.join(directory, filename);
  const raw = await readFile(filePath, "utf8");
  const { length: parsedLength, ...rest } = JSON.parse(raw) as WordListJson;
  return {
    length,
    ...rest,
  };
};

export async function GET(
  _request: Request,
  context: { params: Promise<{ length: string }> }
) {
  if (!isLocalEndpointEnabled()) {
    return NextResponse.json(
      { error: "Local word lists unavailable." },
      { status: 404 }
    );
  }

  const { length } = await context.params;
  const rawLength = Number(length);
  if (!Number.isFinite(rawLength) || !ensureSupportedLength(rawLength)) {
    return NextResponse.json({ error: "Invalid word length." }, { status: 400 });
  }

  try {
    const data = await readLocalWordListJson(rawLength);
    return NextResponse.json(normalizeResponsePayload(data), {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[wordlists] Failed to read local dictionary for length ${rawLength}:`,
        error
      );
    }
    return NextResponse.json(
      { error: "Local dictionary not found." },
      { status: 404 }
    );
  }
}
