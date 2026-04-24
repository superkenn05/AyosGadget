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
  prompt: `You are a Filipino hardware repair expert (Technician) for AyosGadget. 
Your task is to translate the provided technical repair instructions into natural, conversational MABABAW NA TAGALOG / TAGLISH (Casual Greenhills/Raon Style).

CRITICAL RULES:
1. NO ENGLISH SENTENCES ALLOWED: Every single instruction, action, and description MUST be translated into Taglish. Do not leave English sentences as is.
2. AGGRESSIVE TRANSLATION: If you see "Remove the modules", you MUST output "Baklasin ang mga modules". If you see "Pull the tabs", output "Hugutin ang mga tabs".
3. NATURAL TECHNICIAN STYLE: Use words like "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin", "I-disconnect", "Baklasin ang tornilyo", "Bunutin ang connector".
4. TECHNICAL TERMS (KEEP IN ENGLISH): Only keep these specific words in English: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "expansion bay", "index finger", "ribbed tabs", "power button", "volume button", "RAM", "hard drive", "tabs".
5. BULLET POINTS: Preserve the formatting of bullet points (•) and numbered lists.

Source Content to Translate:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description/Intro: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
{{#if this.title}}Step Title: {{this.title}}{{/if}}
Instruction:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideInput> {
  const BATCH_SIZE = 5; 
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

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

      if (result.output && result.output.steps && result.output.steps.length > 0) {
        translatedSteps.push(...result.output.steps);
      } else {
        // If translation fails, we still need to push SOMETHING to keep the indices aligned
        translatedSteps.push(...batch);
      }
    } catch (error) {
      console.error("Batch translation failed", error);
      translatedSteps.push(...batch);
    }
  }

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
