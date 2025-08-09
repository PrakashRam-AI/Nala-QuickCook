// youtube.js — YouTube search with synonym expansion + fallbacks

// 🔑 Put your YouTube Data API v3 key here
const YT_API_KEY = "AIzaSyDt9MlePDg0HXXi4gvnhLODXLiHycpd4mc"; // replace with your key

// Map common Indian ↔ global ingredient/dish synonyms
const SYN_MAP = [
  ["paneer", "cottage cheese"],
  ["brinjal", "eggplant", "aubergine"],
  ["lady's finger", "okra", "bhindi"],
  ["capsicum", "bell pepper"],
  ["coriander", "cilantro"],
  ["curd", "yogurt"],
  ["beetroot", "beet"],
  ["maida", "all-purpose flour", "plain flour"],
  ["corn flour", "cornstarch"],
  ["green gram", "mung bean", "moong dal"],
  ["black gram", "urad dal"],
  ["chickpea", "chana", "garbanzo"],
  ["flattened rice", "poha"],
  ["semolina", "rava", "sooji"],
];

function expandSynonyms(text) {
  const lower = text.toLowerCase();
  const extras = new Set();

  for (const group of SYN_MAP) {
    const hit = group.find((term) => lower.includes(term));
    if (hit) {
      for (const term of group) {
        if (!lower.includes(term)) extras.add(term);
      }
    }
  }
  return Array.from(extras);
}

// Basic cleanup: remove noisy words that hurt search precision
function normalizeTitleForSearch(title) {
  return title
    .replace(/\b(how to|best|easy|quick|tasty|authentic|home style|restaurant style)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

// Call YouTube Search API for a single query; return videoId or null
async function fetchVideoIdForQuery(q) {
  const url = new URL("https://www.googleapis.com/youtube/v3/search");
  url.searchParams.set("part", "snippet");
  url.searchParams.set("type", "video");
  url.searchParams.set("maxResults", "1");
  url.searchParams.set("q", q);
  url.searchParams.set("key", YT_API_KEY);

  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const data = await res.json();
    return data?.items?.[0]?.id?.videoId || null;
  } catch {
    return null;
  }
}

// Public API: return an embeddable URL or null
export async function getYoutubeEmbedFor(recipeName) {
  if (!recipeName) return null;

  const base = normalizeTitleForSearch(String(recipeName));
  const syns = expandSynonyms(base);

  // Build candidate queries in priority order
  const candidates = [
    `${base} recipe`,
    base, // raw title
    // append each synonym to widen the search
    ...syns.map((s) => `${base} ${s} recipe`),
    // minimal fallback: just the key ingredient word if present
    ...syns, // try synonyms alone
  ];

  // Deduplicate while preserving order
  const seen = new Set();
  const queries = candidates.filter((q) => {
    const key = q.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return key.length > 0;
  });

  for (const q of queries) {
    const vid = await fetchVideoIdForQuery(q);
    if (vid) return `https://www.youtube.com/embed/${vid}`;
  }
  return null; // nothing found
}
