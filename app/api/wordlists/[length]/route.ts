import { NextResponse } from "next/server";
import { ensureSupportedLength, loadWordList } from "@/lib/words";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ length: string }> }
) {
  try {
    const { length } = await params;
    const lengthParam = Number(length);
    const supportedLength = ensureSupportedLength(lengthParam);
    const wordData = await loadWordList(supportedLength);
    return NextResponse.json(
      {
        length: supportedLength,
        guesses: wordData.guesses,
        answers: wordData.answers,
        lastUpdated: new Date().toISOString(),
      },
      {
        headers: {
          "Cache-Control": "public, max-age=600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    return NextResponse.json(
      {
        error: "Invalid word length",
      },
      {
        status: 400,
      }
    );
  }
}
