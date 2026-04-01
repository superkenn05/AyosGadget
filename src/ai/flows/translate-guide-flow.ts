'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Filipino with strict formatting and completeness rules.
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
  })).describe('An array of translated steps. MUST be the same length as the input steps array.'),
});
export type TranslateGuideOutput = z.infer<typeof TranslateGuideOutputSchema>;

const translatePrompt = ai.definePrompt({
  name: 'translateGuidePrompt',
  input: {schema: TranslateGuideInputSchema},
  output: {schema: TranslateGuideOutputSchema},
  prompt: `You are a professional technical translator specializing in electronics repair manuals.
Translate the following guide into clear, natural Filipino (Tagalog/Taglish).

STRICT INTEGRITY AND FORMATTING RULES:
1. COMPLETENESS: You MUST translate EVERY SINGLE STEP provided. Do not skip, merge, or omit any steps. The output steps array MUST have exactly {{steps.length}} items.
2. BULLET POINTS: EVERY bullet point (•) MUST start on its own NEW LINE. 
3. LINE BREAKS: Use double newlines (\\n\\n) between paragraphs or list items to ensure visual separation.
4. TECHNICAL TERMS: Standard industry terms like "logic board", "spudger", "ribbon cable", "LCD connector" should be kept as is (Taglish) for technical accuracy.

Source Content:
Title: {{{title}}}
Description: {{{description}}}

Steps to translate (DO NOT SKIP ANY):
{{#each steps}}
--- STEP {{@index}} (DO NOT OMIT) ---
Title: {{this.title}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  let attempts = 0;
  const maxAttempts = 4;
  const baseDelay = 3000;

  while (attempts < maxAttempts) {
    try {
      const {output} = await translatePrompt(input);
      if (!output) throw new Error('No output from AI');
      
      // STRICT INTEGRITY CHECK: Step count must match input count
      if (output.steps.length !== input.steps.length) {
        throw new Error(`Integrity Check Failed: Expected ${input.steps.length} steps, but Neural Link returned ${output.steps.length}. Retrying for completeness...`);
      }

      return output;
    } catch (error: any) {
      attempts++;
      
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes('429') || errorMsg.includes('quota');
      const isRetryable = 
        errorMsg.includes('503') || 
        errorMsg.includes('high demand') || 
        isQuotaError ||
        errorMsg.includes('overloaded') ||
        errorMsg.includes('Integrity Check Failed');
      
      if (isRetryable && attempts < maxAttempts) {
        // If it's a quota error, wait significantly longer
        const delay = isQuotaError 
          ? 15000 + (attempts * 5000) 
          : baseDelay * Math.pow(2, attempts - 1);
          
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw new Error(`Neural Link Busy: ${errorMsg}`);
    }
  }
  
  throw new Error('Neural translation failed after multiple retries.');
}
