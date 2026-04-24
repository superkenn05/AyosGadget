'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Optimized for technical terms used in the Philippines.
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
      })).optional(),
    })
  },
  output: {schema: TranslateGuideOutputSchema},
  prompt: `You are a friendly Pinoy hardware repair expert for AyosGadget. 
Translate the provided content into MABABAW NA TAGALOG / TAGLISH.

CRITICAL INSTRUCTIONS:
1. TRANSLATE EVERYTHING: The title, the intro description (Before you begin), and all steps.
2. NATURAL STYLE: Use the casual language used by technicians in Greenhills or hardware shops.
3. KEEP ENGLISH TERMS: Do not translate technical terms like "battery", "connector", "logic board", "LCD", "screw", "flex", "adhesive", "isopropyl alcohol", "volts", "amps", "mAh".
4. TONE: Friendly, helpful, and very clear.

EXAMPLES:
- English: "Allow your phone's battery to drain below 25%, as a charged lithium-ion battery is a potential safety hazard."
- Taglish: "Hayaan mo munang ma-drain ang battery ng phone mo hanggang 25% pababa para safe itong baklasin at hindi mag-leak."

- English: "Hold the power button and either volume button, then slide to power off your phone."
- Taglish: "Pindutin at i-hold ang power button pati ang volume button, tapos i-slide mo para ma-off ang phone."

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description/Intro (Before you begin): {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const BATCH_SIZE = 4;
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  // 1. Translate Title and the "Before you begin" Description first
  try {
    const headerResult = await translatePrompt({
      title: input.title,
      description: input.description,
      steps: input.steps.slice(0, 1), // Pass one step for context
    });
    
    if (headerResult.output) {
      finalTitle = headerResult.output.title || finalTitle;
      finalDescription = headerResult.output.description || finalDescription;
      // We don't push the step from here to avoid duplication if we batch separately
    }
  } catch (e) {
    console.error("Header translation failed:", e);
  }

  // 2. Batch translate all steps to ensure full coverage (1-20+ steps)
  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    try {
      const result = await translatePrompt({
        steps: batch,
      });

      if (result.output && result.output.steps) {
        translatedSteps.push(...result.output.steps);
      } else {
        translatedSteps.push(...batch);
      }
    } catch (error) {
      console.error(`Batch translation failed at step ${i}:`, error);
      translatedSteps.push(...batch);
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps.length >= totalSteps ? translatedSteps : [...translatedSteps, ...input.steps.slice(translatedSteps.length)],
  };
}