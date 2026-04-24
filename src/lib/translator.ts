/**
 * @fileOverview Heuristic pattern-based translator for repair guides.
 * Converts technical English to "Pinoy Technician Taglish" without using AI.
 */

const DICTIONARY: Record<string, string> = {
  "remove": "baklasin",
  "unscrew": "luwagan ang tornilyo",
  "disconnect": "i-disconnect",
  "pull": "hilahin",
  "push": "itulak",
  "lift": "i-angat",
  "slide": "i-slide",
  "pry": "tuklapin",
  "open": "buksan",
  "close": "isara",
  "insert": "isaksak",
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
  "search for": "hanapin",
  "with": "gamit ang",
  "and": "at",
  "both": "parehong",
  "front of": "harap ng",
  "corners of": "sulok ng",
  "underside of": "ilalim ng",
  "your": "iyong",
  "index fingers": "hintuturo",
};

/**
 * Performs a fast, dictionary-based translation of English repair instructions to Taglish.
 * Persona: Raon/Greenhills Technician.
 */
export function heuristicTranslate(text: string): string {
  if (!text) return "";
  
  let result = text.toLowerCase();

  // 1. Replace multi-word phrases first
  const phrases = [
    ["search for", "hanapin"],
    ["front of", "harap ng"],
    ["corners of", "sulok ng"],
    ["underside of", "ilalim ng"],
    ["index fingers", "mga hintuturo"]
  ];

  phrases.forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 2. Replace single words
  Object.entries(DICTIONARY).forEach(([eng, tag]) => {
    const regex = new RegExp(`\\b${eng}\\b`, 'gi');
    result = result.replace(regex, tag);
  });

  // 3. Capitalize first letter and fix common grammar artifacts
  result = result.charAt(0).toUpperCase() + result.slice(1);
  
  return result;
}

/**
 * For backward compatibility or bulk translation
 */
export async function translateFast(text: string): Promise<string> {
  return heuristicTranslate(text);
}
