'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Persona: Professional Hardware Technician from Raon / Greenhills.
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
  prompt: `You are a legendary Filipino hardware technician from Raon or Greenhills. 
Your task is to translate technical repair manuals into natural, conversational MABABAW NA TAGALOG / TAGLISH.

STRICT TRANSLATION RULES:
1. ZERO ENGLISH LEAKAGE: Every instruction, description, and title MUST be translated. Never leave an English sentence untranslated.
2. TECHNICIAN PERSONA: Use professional technician slang like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin", "I-disconnect", "Baklasin ang tornilyo", "Kalikutin", "I-angat".
3. TECHNICAL TERMS (KEEP AS IS): Keep ONLY these specific words in English: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "RAM", "hard drive", "trackpad", "expansion bay".
4. CONTEXT: If the user is removing a module, use "Baklasin" or "Hugutin". If they are searching for something, use "Hanapin".

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Steps to Translate:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Instruction: {{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const SYNC_ERROR_MSG = "[SYNC ERROR: Sinusubukang i-sync ulit ang bawat hakbang...]";
  
  try {
    const result = await translatePrompt(input);
    return result.output!;
  } catch (error) {
    console.error("Translation Flow failed", error);
    
    // Fallback: Try translating header and steps independently to recover partial content
    const headerPromise = translatePrompt({
      title: input.title,
      description: input.description,
    }).catch(() => ({ output: { title: input.title, description: input.description } }));

    const stepPromises = input.steps.map(async (step, index) => {
      try {
        const res = await translatePrompt({
          steps: [{ title: step.title || `Hakbang ${index + 1}`, description: step.description }]
        });
        return res.output?.steps?.[0] || { title: step.title, description: SYNC_ERROR_MSG };
      } catch {
        return { title: step.title, description: SYNC_ERROR_MSG };
      }
    });

    const [headerResult, ...translatedSteps] = await Promise.all([headerPromise, ...stepPromises]);

    return {
      title: headerResult.output?.title || input.title,
      description: headerResult.output?.description || input.description,
      steps: translatedSteps,
    };
  }
}
