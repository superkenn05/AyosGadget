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
  prompt: `You are a Pinoy hardware repair expert (Technician) for AyosGadget. 
Translate the provided technical content into natural, conversational MABABAW NA TAGALOG / TAGLISH (Casual Greenhills/Raon Style).

CRITICAL RULES:
1. TRANSLATE EVERYTHING: Every single instruction, sentence, and description MUST be translated. Do not leave English sentences untranslated.
2. NATURAL PINOT STYLE: Use the casual language used by technicians in Greenhills or hardware shops. Use words like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin".
3. TECHNICAL TERMS: Keep these specific words in English to avoid confusion: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "expansion bay", "index finger", "ribbed tabs", "power button", "volume button".
4. AGGRESSIVE TRANSLATION: If the input is "Remove the module", output "Baklasin ang module". If the input is "Pull the tabs", output "Hugutin ang mga tabs".

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description/Intro: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideInput> {
  // Use smaller batches for better reliability and avoiding timeouts
  const BATCH_SIZE = 3;
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  // 1. Translate Title and the Intro Description first
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
        // AI returned empty or failed, we must at least maintain structure
        translatedSteps.push(...batch);
      }
    } catch (error) {
      console.error(`Batch translation failed at step ${i}:`, error);
      translatedSteps.push(...batch);
    }
  }

  // Ensure we have the same number of steps as input
  const finalSteps = input.steps.map((originalStep, index) => {
    const translatedStep = translatedSteps[index];
    return {
      title: translatedStep?.title || originalStep.title,
      description: translatedStep?.description || originalStep.description,
    };
  });

  return {
    title: finalTitle,
    description: finalDescription,
    steps: finalSteps,
  };
}
