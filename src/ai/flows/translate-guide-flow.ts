
'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Mababaw na Tagalog.
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
  prompt: `You are an expert Filipino hardware technician.
Your task is to translate technical repair manuals into "Mababaw na Tagalog" (Conversational Taglish) as used in shops like Raon or Greenhills.

STRICT TRANSLATION RULES:
1. CONVERSATIONAL TAGLISH: Use words like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Tuklapin".
2. KEEP TECH TERMS: Keep terms like "battery", "logic board", "LCD", "flex cable", "isopropyl alcohol", "volts" as is.

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{if steps}}
Steps to Translate:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Instruction: {{{this.description}}}
{{/each}}
{{/if}}{{/if}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  try {
    const result = await translatePrompt(input);
    if (!result.output) throw new Error("Empty output from AI");
    return result.output;
  } catch (error) {
    console.warn("Translation failed, returning original text.");
    return {
      title: input.title,
      description: input.description,
      steps: input.steps,
    };
  }
}
