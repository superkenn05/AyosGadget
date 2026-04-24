'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Optimized for natural, non-formal technical language used by Pinoy technicians.
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
  prompt: `You are a friendly Pinoy tech expert for AyosGadget. 
Translate the provided technical data into MABABAW NA TAGALOG / TAGLISH.

CRITICAL INSTRUCTION: 
- TRANSLATE EVERYTHING: The title, the description (introduction), and every single step.
- USE NATURAL TAGLISH: Do not use deep, formal Tagalog. Use the language spoken in Greenhills or hardware shops.
- TECHNICAL TERMS: Keep "battery", "connector", "logic board", "LCD", "screw", "flex", "adhesive", "isopropyl alcohol" in English.

EXAMPLES:
- English: "Allow your phone's battery to drain below 25%."
- Taglish: "Hayaan mo munang ma-drain ang battery ng phone mo hanggang 25% pababa para safe baklasin."

- English: "Turn off your smartphone completely."
- Taglish: "I-off mo muna nang tuluyan ang smartphone mo."

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description/Intro: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Title: {{this.title}}{{/if}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  // Increase batch size for better context, but keep it manageable for server timeouts
  const BATCH_SIZE = 5;
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  // 1. Translate Title and Description (The "Before you begin" part)
  try {
    const headerResult = await translatePrompt({
      title: input.title,
      description: input.description,
      steps: input.steps.slice(0, 1), // Pass one step for context
    });
    if (headerResult.output) {
      finalTitle = headerResult.output.title || finalTitle;
      finalDescription = headerResult.output.description || finalDescription;
    }
  } catch (e) {
    console.error("Header translation failed:", e);
  }

  // 2. Batch translate all steps
  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    try {
      const result = await translatePrompt({
        steps: batch,
      });

      const output = result.output;
      if (output && output.steps) {
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
    steps: translatedSteps.length >= totalSteps ? translatedSteps : [...translatedSteps, ...input.steps.slice(translatedSteps.length)],
  };
}
