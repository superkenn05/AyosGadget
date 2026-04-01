'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Filipino with batched processing for large manuals.
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
  prompt: `You are a professional technical translator specializing in electronics repair manuals.
Translate the following guide content into clear, natural Filipino (Tagalog/Taglish).

STRICT INTEGRITY AND FORMATTING RULES:
1. COMPLETENESS: You MUST translate EVERY SINGLE STEP provided in this batch.
2. BULLET POINTS: EVERY bullet point (•) MUST start on its own NEW LINE. 
3. TECHNICAL TERMS: Standard industry terms like "logic board", "spudger", "ribbon cable" should be kept as is (Taglish).
4. NO SUMMARIZATION: Translate everything provided.

Source Content:
{{#if title}}Title: {{{title}}}{{/if}}
{{#if description}}Description: {{{description}}}{{/if}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
Title: {{this.title}}
Content:
{{{this.description}}}
{{/each}}`,
});

/**
 * Translates a guide in batches to handle manuals with many steps (e.g., 20+ steps) 
 * without hitting token limits or skipping data.
 */
export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  const BATCH_SIZE = 5;
  const totalSteps = input.steps.length;
  const translatedSteps: any[] = [];
  
  // 1. Translate Title and Description in the first batch
  let finalTitle = input.title;
  let finalDescription = input.description;

  // 2. Process steps in small batches for stability
  for (let i = 0; i < totalSteps; i += BATCH_SIZE) {
    const batch = input.steps.slice(i, i + BATCH_SIZE);
    let attempts = 0;
    const maxAttempts = 3;

    while (attempts < maxAttempts) {
      try {
        const result = await translatePrompt({
          title: i === 0 ? input.title : undefined,
          description: i === 0 ? input.description : undefined,
          steps: batch,
        });

        const output = result.output;
        if (!output) throw new Error('No output from AI');

        if (i === 0) {
          finalTitle = output.title;
          finalDescription = output.description;
        }

        // Integrity check for this batch
        if (output.steps.length !== batch.length) {
          throw new Error(`Integrity check failed: Expected ${batch.length} steps, got ${output.steps.length}`);
        }

        translatedSteps.push(...output.steps);
        break;
      } catch (error: any) {
        attempts++;
        if (attempts >= maxAttempts) throw error;
        // Exponential backoff for quota issues
        await new Promise(resolve => setTimeout(resolve, 5000 * attempts));
      }
    }
  }

  return {
    title: finalTitle,
    description: finalDescription,
    steps: translatedSteps,
  };
}