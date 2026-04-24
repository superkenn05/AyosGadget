/**
 * @fileOverview Heuristic pattern-based translator for repair guides.
 * Converts technical English to "Purong Tagalog" without using AI.
 */

const DICTIONARY: Record<string, string> = {
  // Action Verbs (Purong Tagalog)
  "remove": "tanggalin",
  "unscrew": "alisin ang tornilyo",
  "disconnect": "hugutin ang koneksyon",
  "pull": "hilahin",
  "push": "itulak",
  "lift": "iangat",
  "slide": "iusog",
  "pry": "tuklapin",
  "open": "buksan",
  "close": "isara",
  "insert": "isuksok",
  "search": "hanapin",
  "located": "matatagpuan",
  "toward": "patungo sa",
  "pop up": "aangat",
  "using": "gamit ang",
  "the": "ang",
  "front": "harapan",
  "back": "hulihan",
  "upper": "itaas",
  "lower": "ibaba",
  "near": "malapit sa",
  "inside": "sa loob ng",
  "search for": "hanapin ang",
  "with": "gamit ang",
  "and": "at",
  "both": "parehong",
  "underside of": "ilalim ng",
  "your": "iyong",
  "index fingers": "mga hintuturo",
  "levers": "mga panungkit",
  "tabs": "mga tab",
  "ribbed": "may mga guhit",
  "keyboard": "tipaan",
  "expansion bay": "bahagi ng pagpapalawak",
  "module": "modyul",
  "computer": "kompyuter",
  "battery": "baterya",
  "screw": "tornilyo",
  "screws": "mga tornilyo",
  "case": "kaha",
  "top": "itaas",
  "bottom": "ibaba",
  "connector": "konektor",
  "display": "tabing",
  "screen": "tabing",
  "tool": "kagamitan",
  "part": "piyesa",
  "replace": "palitan",
  "install": "ikabit",
};

/**
 * Performs a fast, dictionary-based translation of English repair instructions to Pure Tagalog.
 */
export function heuristicTranslate(text: string): string {
  if (!text) return "";
  
  let result = text.toLowerCase();

  // 1. Replace multi-word phrases first
  const phrases = [
    ["search for", "hanapin ang"],
    ["front of the computer", "harapan ng kompyuter"],
    ["front of", "harapan ng"],
    ["corners of", "mga sulok ng"],
    ["underside of the", "ilalim ng"],
    ["underside of", "ilalim ng"],
    ["index fingers", "mga hintuturo"],
    ["pull the tabs toward yourself", "hilahin ang mga tab patungo sa iyo"],
    ["will pop up", "ay kusa nang aangat"],
  ];

  phrases.forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 2. Replace single words based on dictionary
  Object.entries(DICTIONARY).forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 3. Post-processing
  result = result
    .replace(/\bang ang\b/g, "ang")
    .replace(/\bang sa\b/g, "sa")
    .replace(/\bgamit ang ang\b/g, "gamit ang");

  // Capitalize first letter of sentences
  result = result.replace(/(^\w|\.\s+\w)/gm, (m) => m.toUpperCase());
  
  return result;
}

/**
 * For backward compatibility
 */
export async function translateFast(text: string): Promise<string> {
  return heuristicTranslate(text);
}
