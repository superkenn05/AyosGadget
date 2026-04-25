
/**
 * @fileOverview Heuristic pattern-based translator for repair guides.
 * Processes technical English to "Mababaw na Tagalog" (Conversational Taglish).
 */

const DICTIONARY: Record<string, string> = {
  "remove": "baklasin",
  "unscrew": "luwagan ang tornilyo",
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
  "located": "makikita",
  "toward": "papunta sa",
  "pop up": "kusa nang aangat",
  "using": "gamit ang",
  "the": "ang",
  "front": "harapan",
  "back": "likod",
  "upper": "taas",
  "lower": "ibaba",
  "near": "malapit sa",
  "inside": "sa loob ng",
  "with": "kasama ang",
  "and": "at",
  "both": "parehong",
  "underside": "ilalim",
  "keyboard": "keyboard",
  "expansion bay": "expansion bay",
  "module": "module",
  "computer": "gadget",
  "battery": "battery",
  "screw": "tornilyo",
  "screws": "mga tornilyo",
  "case": "case",
  "top": "itaas",
  "bottom": "ibaba",
  "connector": "connector",
  "display": "screen",
  "screen": "screen",
  "tool": "gamit",
  "part": "piyesa",
  "replace": "palitan",
  "install": "ikabit",
};

/**
 * Translates a single sentence into Mababaw na Tagalog.
 */
function translateSentence(sentence: string): string {
  let result = sentence.toLowerCase().trim();
  if (!result) return "";

  // 1. Common Phrases
  const phrases = [
    ["search for", "hanapin ang"],
    ["front of the", "harapan ng"],
    ["underside of", "ilalim ng"],
    ["pop up", "kusa nang aangat"],
    ["pull the tabs", "hilahin ang mga lock"],
    ["be careful", "ingat lang"],
    ["make sure", "siguraduhin"],
  ];

  phrases.forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 2. Single Words
  Object.entries(DICTIONARY).forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // Post-process cleanup
  result = result
    .replace(/\bang ang\b/g, "ang")
    .replace(/\bang sa\b/g, "sa")
    .replace(/\bgamit ang ang\b/g, "gamit ang");

  return result.charAt(0).toUpperCase() + result.slice(1);
}

/**
 * Performs a fast, dictionary-based translation of English repair instructions to Mababaw na Tagalog.
 * Processes the text sentence by sentence for a more natural flow.
 */
export function heuristicTranslate(text: string): string {
  if (!text) return "";
  
  // Split by common sentence terminators and process per sentence
  const sentences = text.split(/([.!\n])/);
  let result = "";

  for (let i = 0; i < sentences.length; i++) {
    const part = sentences[i];
    if (part === undefined) continue;
    
    if (/[.!\n]/.test(part)) {
      result += part;
    } else {
      result += translateSentence(part);
    }
  }

  return result;
}
