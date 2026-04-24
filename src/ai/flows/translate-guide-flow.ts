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
Translate the provided technical content into MABABAW NA TAGALOG / TAGLISH (Casual conversational Filipino).

CRITICAL INSTRUCTIONS:
1. TRANSLATE EVERYTHING: Every sentence, instruction, and description MUST be in Taglish. Do not leave English sentences untranslated.
2. NATURAL STYLE: Use the casual language used by technicians in Greenhills or hardware shops. Be very "mabait" and clear.
3. TECHNICAL TERMS: KEEP technical terms in English: "battery", "connector", "logic board", "LCD", "screw", "flex", "adhesive", "isopropyl alcohol", "volts", "amps", "mAh", "module", "expansion bay", "lever", "keyboard".
4. FORMAT: Maintain the bullet points (•) and line breaks.

EXAMPLES:
- English: "Allow your phone's battery to drain below 25%, as a charged lithium-ion battery is a potential safety hazard."
- Taglish: "Hayaan mo munang ma-drain ang battery ng phone mo hanggang 25% pababa para safe itong baklasin at hindi mag-leak o sumabog."

- English: "Remove both expansion bay modules using the levers on the front of the computer."
- Taglish: "Baklasin mo yung dalawang expansion bay modules gamit yung mga lever sa harap ng computer."

- English: "Pull the tabs toward yourself and the keyboard will pop up."
- Taglish: "Hilahin mo yung mga tab papunta sa iyo at kusa nang lulutang o aangat yung keyboard."

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description/Intro: {{{description}}}{{/if}}

Steps to translate:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideInput> {
  const BATCH_SIZE = 3; // Smaller batch for higher accuracy
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  // 1. Translate Title and the Intro Description
  try {
    const headerResult = await translatePrompt({
      title: input.title,
      description: input.description,
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

      if (result.output && result.output.steps && result.output.steps.length > 0) {
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
