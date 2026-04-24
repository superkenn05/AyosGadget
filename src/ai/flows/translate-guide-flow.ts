'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into natural, easy-to-understand Taglish.
 * Optimized for technical terms used in the Philippines with Zero-Leakage English policy.
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
  prompt: `You are a Filipino hardware repair master (Technician) for AyosGadget. 
Your task is to translate technical repair instructions into natural, conversational MABABAW NA TAGALOG / TAGLISH (Casual Greenhills/Raon Style).

STRICT TRANSLATION RULES:
1. NO ENGLISH SENTENCES: Every single instruction, action, and description MUST be translated into Taglish. You are strictly forbidden from leaving English sentences as is.
2. AGGRESSIVE TRANSLATION: "Remove the modules" -> "Baklasin ang mga modules". "Pull the tabs" -> "Hugutin ang mga tabs". "Insert your fingers" -> "Ipasok ang mga daliri".
3. PERSONA: Talk like a real technician from Raon or Greenhills. Use technician lingo: "Baklasin", "Hugutin", "Luwagan", "Ikabit", "I-check", "Bunutin", "Tuklapin", "I-disconnect", "Baklasin ang tornilyo", "Bunutin ang connector".
4. TECHNICAL TERMS (KEEP IN ENGLISH): Only keep these specific words in English: "battery", "connector", "logic board", "LCD", "screw", "flex cable", "adhesive", "isopropyl alcohol", "volts", "amps", "module", "lever", "keyboard", "motherboard", "heatsink", "expansion bay", "index finger", "ribbed tabs", "power button", "volume button", "RAM", "hard drive", "tabs", "trackpad".
5. FORMATTING: You MUST preserve the formatting of bullet points (•) and numbered lists exactly.

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
  const BATCH_SIZE = 3; 
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  let finalTitle = input.title;
  let finalDescription = input.description;

  const FALLBACK_DESC = "[SYNC ERROR: Sinusubukang i-sync ulit ang bawat hakbang...]";

  try {
    const headerResult = await translatePrompt({
      title: input.title,
      description: input.description,
    });
    
    if (headerResult.output) {
      finalTitle = headerResult.output.title || finalTitle;
      finalDescription = headerResult.output.description || "[SYNC ERROR: Sinusubukang i-translate ang intro...]";
    }
  } catch (e) {
    finalDescription = "[SYNC ERROR: Sinusubukang i-translate ang intro...]";
  }

  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    try {
      const result = await translatePrompt({
        steps: batch,
      });

      if (result.output && result.output.steps && result.output.steps.length > 0) {
        const mappedBatch = result.output.steps.map((s, idx) => ({
          title: s.title || `Hakbang ${i + idx + 1}`,
          description: s.description || FALLBACK_DESC,
        }));
        translatedSteps.push(...mappedBatch);
      } else {
        translatedSteps.push(...batch.map(b => ({ ...b, description: FALLBACK_DESC })));
      }
    } catch (error) {
      translatedSteps.push(...batch.map(b => ({ ...b, description: FALLBACK_DESC })));
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps,
  };
}
