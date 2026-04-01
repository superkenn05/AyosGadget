'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Filipino with strict formatting preservation.
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
  input: {schema: TranslateGuideInputSchema},
  output: {schema: TranslateGuideOutputSchema},
  prompt: `You are a professional technical translator. 
Translate the electronics repair guide into clear Filipino (Tagalog).

FORMATTING PROTOCOL:
- PRESERVE EVERY BULLET POINT (e.g., '•').
- MAINTAIN ALL LINE BREAKS AND NEWLINES.
- DO NOT COMBINE PARAGRAPHS.
- Technical terms like "logic board", "motherboard", "ribbon cable" can be left as is or used in Taglish context.

Title: {{{title}}}
Description: {{{description}}}

Steps:
{{#each steps}}
--- STEP {{@index}} ---
Title: {{this.title}}
Content:
{{{this.description}}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 2000;

  while (attempts < maxAttempts) {
    try {
      const {output} = await translatePrompt(input);
      if (!output) throw new Error('No output from AI');
      return output;
    } catch (error: any) {
      attempts++;
      
      const isRetryable = 
        error.message?.includes('503') || 
        error.message?.includes('high demand') || 
        error.message?.includes('429') ||
        error.message?.includes('overloaded');
      
      if (isRetryable && attempts < maxAttempts) {
        const delay = baseDelay * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Neural translation failed after multiple retries.');
}
