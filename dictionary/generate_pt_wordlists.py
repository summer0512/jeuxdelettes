#!/usr/bin/env python3
"""
Extract Portuguese word lists from a ptwiktionary XML dump.

Generated output consists of two sets of files grouped by word length:
 - guesses directory: all candidate input words.
 - answer directory: high-frequency subset suitable as game answers.
"""

from __future__ import annotations

import argparse
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
from pathlib import Path
from typing import Dict, Iterable, Iterator, List, Set, Tuple

# Ensure we can import dependencies installed into dictionary/.deps
CURRENT_DIR = Path(__file__).resolve().parent
DEPS_DIR = CURRENT_DIR / ".deps"
if DEPS_DIR.exists():
    sys.path.insert(0, str(DEPS_DIR))

try:
    from wordfreq import zipf_frequency
except ImportError as exc:  # pragma: no cover - defensive guardrail
    raise SystemExit(
        "The wordfreq package is required. Install with "
        "`python3 -m pip install --target dictionary/.deps wordfreq`."
    ) from exc


NAMESPACE = "{http://www.mediawiki.org/xml/export-0.11/}"
PAGE_TAG = f"{NAMESPACE}page"
TITLE_TAG = f"{NAMESPACE}title"
NS_TAG = f"{NAMESPACE}ns"
REVISION_TAG = f"{NAMESPACE}revision"
TEXT_TAG = f"{NAMESPACE}text"
REDIRECT_TAG = f"{NAMESPACE}redirect"

WORD_RE = re.compile(r"^[A-Za-zÀ-ÖØ-öø-ÿ]+$")
PORTUGUESE_SECTION_PATTERNS = [
    re.compile(r"\{\{\s*-\s*pt\s*-\s*\}\}", flags=re.IGNORECASE),
    re.compile(r"==+\s*Portugu[êe]s\s*==+", flags=re.IGNORECASE),
]
MIN_LEN = 3
MAX_LEN = 11


def normalize_title(title: str) -> str:
    """Normalize a page title into NFC lowercase form."""
    normalized = unicodedata.normalize("NFC", title).strip()
    return normalized.lower()


def iter_portuguese_entries(xml_path: Path) -> Iterator[Tuple[str, str]]:
    """Yield (title, text) pairs for Portuguese entries in the dump."""
    context = ET.iterparse(xml_path, events=("end",))
    for _event, elem in context:
        if elem.tag != PAGE_TAG:
            continue

        title_elem = elem.find(TITLE_TAG)
        ns_elem = elem.find(NS_TAG)
        redirect_elem = elem.find(REDIRECT_TAG)
        revision_elem = elem.find(REVISION_TAG)

        if (
            title_elem is None
            or ns_elem is None
            or ns_elem.text != "0"
            or redirect_elem is not None
            or revision_elem is None
        ):
            elem.clear()
            continue

        text_elem = revision_elem.find(TEXT_TAG)
        if text_elem is None or not text_elem.text:
            elem.clear()
            continue

        title = normalize_title(title_elem.text or "")
        if not title or ":" in title:
            elem.clear()
            continue

        text = text_elem.text
        if not any(pattern.search(text) for pattern in PORTUGUESE_SECTION_PATTERNS):
            elem.clear()
            continue

        yield title, text
        elem.clear()


def collect_word_sets(xml_path: Path) -> Dict[int, Set[str]]:
    """Collect candidate guess words grouped by length."""
    length_map: Dict[int, Set[str]] = {n: set() for n in range(MIN_LEN, MAX_LEN + 1)}

    for title, _text in iter_portuguese_entries(xml_path):
        if not WORD_RE.match(title):
            continue

        word_len = len(title)
        if word_len < MIN_LEN or word_len > MAX_LEN:
            continue

        length_map[word_len].add(title)

    return length_map


def select_answers(words: Iterable[str], target_count: int = 400) -> List[str]:
    """
    Select a high-frequency subset from a list of words.

    The function keeps words with Zipf frequency >= 3.5; if that yields
    fewer than `target_count`, the threshold is relaxed to 3.0 and then
    2.5 if needed. Results are ordered by descending frequency and then
    alphabetically for deterministic output.
    """
    scored = []
    for word in words:
        freq = zipf_frequency(word, "pt")
        if freq <= 0.0:
            continue
        scored.append((freq, word))

    if not scored:
        return []

    for cutoff in (3.5, 3.0, 2.5):
        filtered = [item for item in scored if item[0] >= cutoff]
        if filtered or cutoff == 2.5:
            filtered.sort(key=lambda item: (-item[0], item[1]))
            if len(filtered) > target_count:
                filtered = filtered[:target_count]
            return [word for _freq, word in filtered]

    return []


def write_word_lists(
    base_dir: Path, guesses: Dict[int, Set[str]], answers: Dict[int, List[str]]
) -> None:
    """Persist the generated word lists to disk."""
    guesses_dir = base_dir
    answers_dir = base_dir / "answer"
    guesses_dir.mkdir(parents=True, exist_ok=True)
    answers_dir.mkdir(parents=True, exist_ok=True)

    for length in range(MIN_LEN, MAX_LEN + 1):
        filename = f"{length:02d}.txt"
        guess_words = sorted(guesses.get(length, []))
        answer_words = answers.get(length, [])

        (guesses_dir / filename).write_text(
            "\n".join(guess_words) + ("\n" if guess_words else ""),
            encoding="utf-8",
        )
        (answers_dir / filename).write_text(
            "\n".join(answer_words) + ("\n" if answer_words else ""),
            encoding="utf-8",
        )


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate Portuguese word lists for cf-termo."
    )
    parser.add_argument(
        "--xml",
        type=Path,
        default=CURRENT_DIR / "ptwiktionary-latest-pages-articles-multistream.xml",
        help="Path to the ptwiktionary XML dump.",
    )
    parser.add_argument(
        "--out",
        type=Path,
        default=Path("ptwiktionary-wordlists"),
        help="Directory where output files will be written.",
    )
    parser.add_argument(
        "--answers-per-length",
        type=int,
        default=400,
        help="Target number of high-frequency answers per word length.",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    xml_path = args.xml
    output_dir = args.out

    if not xml_path.exists():
        raise SystemExit(f"XML dump not found: {xml_path}")

    guesses = collect_word_sets(xml_path)
    answers: Dict[int, List[str]] = {}

    for length, words in guesses.items():
        answers[length] = select_answers(words, target_count=args.answers_per_length)

    write_word_lists(output_dir, guesses, answers)


if __name__ == "__main__":
    main()
