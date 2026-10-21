#!/usr/bin/env node
import { readdir, readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const ROOT_DIR = process.cwd();
const WORDLIST_DIR = path.join(ROOT_DIR, "dictionary", "generated");
const DEFAULT_PREFIX = "wordlists";

const log = (...args) => console.log("[upload-wordlists]", ...args);
const error = (...args) => console.error("[upload-wordlists]", ...args);

const parseEnvFile = (filePath) => {
  if (!existsSync(filePath)) {
    return {};
  }
  const raw = readFileSync(filePath, "utf8");
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"))
    .reduce((acc, line) => {
      const idx = line.indexOf("=");
      if (idx === -1) return acc;
      const key = line.slice(0, idx).trim();
      const value = line.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
      acc[key] = value;
      return acc;
    }, {});
};

const loadEnv = () => {
  const envFromFile = parseEnvFile(path.join(ROOT_DIR, ".env"));
  return {
    CLOUDFLARE_ACCOUNT_ID:
      process.env.CLOUDFLARE_ACCOUNT_ID ?? envFromFile.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_API_TOKEN:
      process.env.CLOUDFLARE_API_TOKEN ?? envFromFile.CLOUDFLARE_API_TOKEN,
    SUTOM_KV_NAMESPACE_ID:
      process.env.SUTOM_KV_NAMESPACE_ID ?? envFromFile.SUTOM_KV_NAMESPACE_ID,
    WORDLIST_PREFIX:
      process.env.SUTOM_KV_PREFIX ??
      envFromFile.SUTOM_KV_PREFIX ??
      DEFAULT_PREFIX,
  };
};

const requiredEnv = loadEnv();

const assertEnv = () => {
  const missing = Object.entries(requiredEnv)
    .filter(([key, value]) => !value && key !== "WORDLIST_PREFIX")
    .map(([key]) => key);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}`
    );
  }
};

const uploadWordList = async (filePath, key) => {
  const url = `https://api.cloudflare.com/client/v4/accounts/${requiredEnv.CLOUDFLARE_ACCOUNT_ID}/storage/kv/namespaces/${requiredEnv.SUTOM_KV_NAMESPACE_ID}/values/${encodeURIComponent(
    key
  )}`;
  const body = await readFile(filePath, "utf8");
  let parsedLength = "unknown";
  try {
    const parsed = JSON.parse(body);
    parsedLength = parsed.length ?? "unknown";
  } catch {
    // ignore parsing issues for logging
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${requiredEnv.CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `Failed to upload ${path.basename(filePath)} (${response.status} ${response.statusText}): ${text}`
    );
  }

  log(`Uploaded ${path.basename(filePath)} as ${key} (length=${parsedLength})`);
};

const main = async () => {
  assertEnv();

  if (!existsSync(WORDLIST_DIR)) {
    throw new Error(
      `Directory ${WORDLIST_DIR} not found. Run the word list generator first.`
    );
  }

  const files = (await readdir(WORDLIST_DIR))
    .filter((file) => file.endsWith(".json"))
    .sort();

  if (files.length === 0) {
    log("No JSON files found to upload.");
    return;
  }

  for (const file of files) {
    const key = `${requiredEnv.WORDLIST_PREFIX}/${file}`;
    const filePath = path.join(WORDLIST_DIR, file);
    await uploadWordList(filePath, key);
  }

  log("Upload complete.");
};

main().catch((err) => {
  error(err);
  process.exitCode = 1;
});
