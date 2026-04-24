'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Optimized for technical terms used in the Philippines with Zero-Leakage English policy.
 * Persona: Raon / Greenhills Hardware Technician.
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
  prompt: `You are a professional Filipino hardware technician from Greenhills or Raon. 
Your task is to translate the following technical repair manual into natural, conversational MABABAW NA TAGALOG / TAGLISH.

STRICT TRANSLATION RULES:
1. ZERO ENGLISH LEAKAGE: Every single instruction, description, and title MUST be translated. Do not leave English sentences as they are.
2. TECHNICIAN PERSONA: Use words like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin", "I-disconnect", "Baklasin ang tornilyo", "Kalikutin", "I-angat".
3. TECHNICAL TERMS (KEEP AS IS): Only keep these specific words in English if necessary: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "RAM", "hard drive", "trackpad", "expansion bay".
4. FALLBACK: If you encounter an error, do not leave it blank, instead use technical Taglish to explain.

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{getGuideWithAllSteps}}{{/if}}
Instruction:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const BATCH_SIZE = 3; 
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  const SYNC_ERROR_MSG = "[SYNC ERROR: Sinusubukang i-sync ulit ang bawat hakbang...]";

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
    console.error("Header translation failed", e);
  }

  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    try {
      const result = await translatePrompt({
        steps: batch,
      });

      if (result.output && result.output.steps) {
        for (let j = 0; j < batch.length; j++) {
          const s = result.output.steps[j];
          translatedSteps.push({
            title: s?.title || `Hakbang ${i + j + 1}`,
            description: s?.description || SYNC_ERROR_MSG,
          });
        }
      } else {
        translatedSteps.push(...batch.map(() => ({ description: SYNC_ERROR_MSG })));
      }
    } catch (error) {
      console.error(`Batch ${i} translation failed`, error);
      translatedSteps.push(...batch.map(() => ({ description: SYNC_ERROR_MSG })));
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps.slice(0, totalSteps),
  };
}