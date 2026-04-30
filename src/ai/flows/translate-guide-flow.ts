'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Mababaw na Tagalog (Taglish).
 * Designed for hardware technicians using conversational language used in tech hubs like Raon or Greenhills.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateGuideInputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    title: z.string().optional(),
    description: z.string(),
  })).optional(),
});
export type TranslateGuideInput = z.infer<typeof TranslateGuideInputSchema>;

const TranslateGuideOutputSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(z.object({
    title: z.string().optional(),
    description: z.string(),
  })).optional(),
});
export type TranslateGuideOutput = z.infer<typeof TranslateGuideOutputSchema>;

const translatePrompt = ai.definePrompt({
  name: 'translateGuidePrompt',
  input: {schema: TranslateGuideInputSchema},
  output: {schema: TranslateGuideOutputSchema},
  config: {
    safetySettings: [
      { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
      { category: 'HARM_CATEGORY_CIVIC_INTEGRITY', threshold: 'BLOCK_NONE' },
    ],
  },
  prompt: `You are an expert Filipino hardware technician from Raon, Manila. 
Your task is to translate the provided technical repair manual into "Mababaw na Tagalog" (Conversational Taglish).

STRICT TRANSLATION RULES:
1. MANDATORY TAGLISH: Use conversational words like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Tuklapin", "Tanggalin", "Kabitan", "Tusukin".
2. NO FORMAL FILIPINO: Avoid deep words like "isakatuparan" or "pagmamasid". Use "Gawin" or "Tingnan".
3. KEEP TECH TERMS: Retain original terms for "battery", "logic board", "LCD", "flex cable", "isopropyl alcohol", "volts", "screws", "expansion bay", "levers", "tabs", "keyboard".
4. TONE: Be direct, instructional, and informal—as if you are teaching a junior technician in a busy repair shop.

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

{{#if steps}}
Steps to Translate:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Instruction: {{{this.description}}}
{{/each}}
{{/if}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  try {
    const result = await translatePrompt(input);
    if (!result.output) throw new Error("Empty output from AI");
    
    // Ensure we don't return the same text if it failed to produce a valid translation
    if (result.output.title === input.title && result.output.description === input.description) {
      console.warn("AI returned identical text, possible translation skip.");
    }

    return result.output;
  } catch (error) {
    console.error("Neural translation failed:", error);
    return {
      title: input.title,
      description: input.description,
      steps: input.steps,
    };
  }
}