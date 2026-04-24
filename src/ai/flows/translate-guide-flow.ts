'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into simple Filipino/Taglish.
 * Optimized for stability with 20+ steps guides.
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
  prompt: `You are a technical translator for AyosGadget. 
Translate the following guide into natural, simple Filipino (Mababaw na Tagalog or Taglish).

RULES:
1. LANGUAGE: Use "mababaw" (simple) Tagalog or Taglish. Avoid deep/poetic Tagalog (e.g., use "Buksan" instead of "Ibukas", use "Turnilyo" instead of "Pako na paikot").
2. TECHNICAL TERMS: Keep terms like "logic board", "ribbon cable", "spudger", "battery connector", "LCD screen" as is (Taglish style).
3. COMPLETENESS: You MUST translate every single step provided. 
4. BULLET POINTS: Keep the bullet points (•, 🔵, ⚠️) at the start of lines.

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Steps to translate:
{{#each steps}}
--- STEP {{@index}} ---
Title: {{this.title}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const BATCH_SIZE = 3; // Processing in small batches for stability
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
          finalTitle = output.title;
          finalDescription = output.description;
        }
        translatedSteps.push(...output.steps);
      }
    } catch (error) {
      console.error("Batch translation failed, using original for this batch:", error);
      translatedSteps.push(...batch); // Fallback to original if AI fails
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps,
  };
}
