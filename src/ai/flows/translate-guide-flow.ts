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
Translate the following repair guide content into MABABAW NA TAGALOG / TAGLISH (Filipino-English mix) as used in hardware shops in the Philippines.

MANDATORY RULES:
1. USE NATURAL TAGLISH: Do not use deep, formal Tagalog (Avoid: "Ibukas", "Alisin", "Pambalot").
   - Use: "Buksan", "Tanggalin", "Hugutin", "Baklasin".
   - Use: "Dahan-dahan" or "Ingat lang".
   - Translate preparation steps like "Allow battery to drain" to "Hayaan muna ma-drain ang battery hanggang 25% pababa".
2. KEEP TECH TERMS IN ENGLISH: Do NOT translate: "battery", "lithium-ion battery", "connector", "logic board", "LCD", "screw", "bracket", "ribbon cable", "flex", "spudger", "adhesive", "thermal paste", "isopropyl alcohol", "cotton swab".
3. TONE: Friendly, instructional, and very easy to follow for beginners.
4. EXAMPLE: 
   - English: "Allow your phone's battery to drain below 25%." 
   - Taglish: "Hayaan mo munang ma-drain ang battery ng phone mo hanggang 25% pababa para safe baklasin."

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
  const BATCH_SIZE = 3;
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  // Initial translation for Title and Description
  try {
    const headerResult = await translatePrompt({
      title: input.title,
      description: input.description,
      steps: input.steps.slice(0, 1), // Include one step to help context
    });
    if (headerResult.output) {
      finalTitle = headerResult.output.title || finalTitle;
      finalDescription = headerResult.output.description || finalDescription;
    }
  } catch (e) {
    console.error("Header translation failed:", e);
  }

  // Batch translate all steps
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
