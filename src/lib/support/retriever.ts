import fs from "fs";
import path from "path";

export interface KnowledgeChunk {
  id: string;
  topic: string;
  heading: string;
  content: string;
}

let cachedChunks: KnowledgeChunk[] | null = null;

const KNOWLEDGE_FILES = [
  { file: "overview-and-tasks.md", topic: "Tasks & Reviews" },
  { file: "points-tiers-and-streaks.md", topic: "Points, Tiers & Streaks" },
  { file: "wallet-mpesa-and-limits.md", topic: "Wallet & M-Pesa Withdrawals" },
  { file: "watch-ads-and-campaigns.md", topic: "Watch Ads & Advertiser Portal" },
  { file: "account-security-and-troubleshooting.md", topic: "Account, Security & FAQs" },
];

export function loadKnowledgeChunks(): KnowledgeChunk[] {
  if (cachedChunks) return cachedChunks;

  const chunks: KnowledgeChunk[] = [];
  const kbDir = path.join(process.cwd(), "src", "lib", "support", "knowledge");

  for (const item of KNOWLEDGE_FILES) {
    try {
      const fullPath = path.join(kbDir, item.file);
      const raw = fs.readFileSync(fullPath, "utf8");
      const sections = raw.split(/\n(?=##\s+)/g);

      sections.forEach((sec, idx) => {
        const lines = sec.trim().split("\n");
        const heading = lines[0].replace(/^#+\s*/, "").trim();
        const body = lines.slice(1).join("\n").trim();
        if (body) {
          chunks.push({
            id: `${item.topic}_${idx}`,
            topic: item.topic,
            heading,
            content: `${heading}\n${body}`,
          });
        }
      });
    } catch {
      // ignore missing file in restricted environments
    }
  }

  cachedChunks = chunks;
  return chunks;
}

/**
 * Retrieves the top N most relevant knowledge chunks for a user query using keyword/BM25-style scoring.
 * Never returns internal filesystem paths.
 */
export function retrieveKnowledgeForQuery(query: string, topK = 4): KnowledgeChunk[] {
  const allChunks = loadKnowledgeChunks();
  if (allChunks.length === 0) return [];

  const tokens = query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (tokens.length === 0) {
    return allChunks.slice(0, topK);
  }

  const scored = allChunks.map((chunk) => {
    const hayHeading = chunk.heading.toLowerCase();
    const hayContent = chunk.content.toLowerCase();
    let score = 0;

    for (const tok of tokens) {
      if (hayHeading.includes(tok)) score += 4;
      if (hayContent.includes(tok)) score += 2;
    }

    return { chunk, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const matched = scored.filter((s) => s.score > 0).map((s) => s.chunk);

  if (matched.length === 0) {
    return allChunks.slice(0, Math.min(2, topK));
  }

  return matched.slice(0, topK);
}
