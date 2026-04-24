/**
 * @fileOverview Heuristic pattern-based translator for repair guides.
 * Converts technical English to "Pinoy Technician Taglish" without using AI.
 * Persona: Professional Hardware Technician from Raon / Greenhills.
 */

const DICTIONARY: Record<string, string> = {
  // Action Verbs (Mababaw na Salita)
  "remove": "baklasin",
  "unscrew": "luwagan ang tornilyo",
  "disconnect": "hugutin ang connector",
  "pull": "hilahin",
  "push": "itulak",
  "lift": "i-angat",
  "slide": "i-usog",
  "pry": "tuklapin",
  "open": "buksan",
  "close": "isara",
  "insert": "isuksok",
  "search": "hanapin",
  "located": "makikita",
  "toward": "papunta sa",
  "pop up": "aangat",
  "using": "gamit ang",
  "the": "ang",
  "front": "harap",
  "back": "likod",
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
  "levers": "mga lever",
  "tabs": "mga tab",
  "ribbed": "may guhit",
  "keyboard": "keyboard",
  "expansion bay": "expansion bay",
  "module": "module",
  "computer": "computer",
  "battery": "battery",
  "screw": "tornilyo",
  "screws": "mga tornilyo",
  "case": "case",
  "top": "itaas",
  "bottom": "ibaba",
};

/**
 * Performs a fast, dictionary-based translation of English repair instructions to Taglish.
 * Persona: Raon/Greenhills Technician.
 */
export function heuristicTranslate(text: string): string {
  if (!text) return "";
  
  let result = text.toLowerCase();

  // 1. Replace multi-word phrases first (Specific common repair sequences)
  const phrases = [
    ["search for", "hanapin ang"],
    ["front of the computer", "harap ng computer"],
    ["front of", "harap ng"],
    ["corners of", "sulok ng"],
    ["underside of the", "ilalim ng"],
    ["underside of", "ilalim ng"],
    ["index fingers", "mga hintuturo"],
    ["pull the tabs toward yourself", "hilahin ang mga tab pabalik sa iyo"],
    ["will pop up", "ay kusa nang aangat"],
  ];

  phrases.forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 2. Replace single words based on dictionary
  Object.entries(DICTIONARY).forEach(([eng, tag]) => {
    // Only replace if it's a whole word to avoid partial matches
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 3. Post-processing: Clean up common grammar issues in Taglish
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
