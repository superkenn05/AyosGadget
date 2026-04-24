'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Persona: Professional Hardware Technician from Raon / Greenhills.
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
      {
        category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HATE_SPEECH',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_NONE',
      },
      {
        category: 'HARM_CATEGORY_CIVIC_INTEGRITY',
        threshold: 'BLOCK_NONE',
      },
    ],
  },
  prompt: `You are a legendary Filipino hardware technician from Raon or Greenhills. 
Your task is to translate technical repair manuals into natural, conversational MABABAW NA TAGALOG / TAGLISH.

STRICT TRANSLATION RULES:
1. ZERO ENGLISH LEAKAGE: Every instruction, title, and description MUST be translated. Never leave an English sentence untranslated.
2. TECHNICIAN PERSONA: Use professional technician slang like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin", "I-disconnect", "Baklasin ang tornilyo", "Kalikutin", "I-angat", "I-atras", "Pukpukin nang bahagya".
3. TECHNICAL TERMS (KEEP AS IS): Keep ONLY these specific words in English: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "RAM", "hard drive", "trackpad", "expansion bay".

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

{{#if steps}}
Steps to Translate (Translate the Instruction/Description of each step into natural Taglish):
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Instruction/Description to Translate: {{{this.description}}}
{{/each}}
{{/if}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  try {
    const result = await translatePrompt(input);
    if (!result.output) throw new Error("Empty output from AI");
    return result.output;
  } catch (error) {
    console.error("Translation failed:", error);
    // Return original as fallback but UI will handle showing skeleton/retry
    return {
      title: input.title,
      description: input.description,
      steps: input.steps,
    };
  }
}
