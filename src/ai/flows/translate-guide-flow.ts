'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into simple Filipino/Taglish.
 * Optimized for natural, non-formal technical language.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateGuideInputSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    title: z.string().optional(),
    description: z.string(),
  })),
});
export type TranslateGuideInput = z.infer<typeof TranslateGuideInputSchema>;

const TranslateGuideOutputSchema = z.object({
  title: z.string(),
  description: z.string(),
  steps: z.array(z.object({
    title: z.string().optional(),
    description: z.string(),
  })),
});
export type TranslateGuideOutput = z.infer<typeof TranslateGuideOutputSchema>;

const translatePrompt = ai.definePrompt({
  name: 'translateGuidePrompt',
  input: {
    schema: z.object({
      title: z.string().optional(),
      description: z.string().optional(),
      steps: z.array(z.object({
        title: z.string().optional(),
        description: z.string(),
      })),
    })
  },
  output: {schema: TranslateGuideOutputSchema},
  prompt: `You are a friendly technical expert for AyosGadget. 
Translate the following repair guide content into simple, natural Filipino (Taglish or Mababaw na Tagalog).

IMPORTANT RULES:
1. NATURAL TONE: Use natural, conversational Taglish. Don't use deep or formal Tagalog (e.g., use "Buksan" instead of "Ibukas", use "Turnilyo" instead of "Pako").
2. TECH TERMS: KEEP common tech terms in English: "logic board", "battery connector", "ribbon cable", "spudger", "LCD screen", "flex cable", "bracket".
3. SAFETY FIRST: Make safety warnings clear but simple.
4. CONSISTENCY: Translate every step. Keep bullet points (•, 🔵, ⚠️) exactly as they are.

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Title: {{this.title}}{{/if}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const BATCH_SIZE = 5; // Balanced for speed and reliability
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    try {
      const result = await translatePrompt({
        title: i === 0 ? input.title : undefined,
        description: i === 0 ? input.description : undefined,
        steps: batch,
      });

      const output = result.output;
      if (output) {
        if (i === 0) {
          finalTitle = output.title || finalTitle;
          finalDescription = output.description || finalDescription;
        }
        translatedSteps.push(...output.steps);
      } else {
        translatedSteps.push(...batch);
      }
    } catch (error) {
      console.error("Batch translation failed, using original:", error);
      translatedSteps.push(...batch);
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps,
  };
}
