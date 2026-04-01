'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Filipino with retry logic.
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
  prompt: `You are a professional technical translator specializing in electronics repair. 
Translate the following repair guide into Filipino (Tagalog). 

Guidelines:
1. Use clear, instructional Tagalog (Mababaw na Tagalog/Taglish where appropriate for technical terms like "ribbon cable", "motherboard", "screws").
2. Maintain the formatting and bullet points.
3. Keep the tone helpful and professional.

Guide to translate:
Title: {{{title}}}
Description: {{{description}}}

Steps:
{{#each steps}}
- Step {{@index}}: {{this.description}}
{{/each}}`,
});

export async function translateGuide(input: TranslateGuideInput): Promise<TranslateGuideOutput> {
  let attempts = 0;
  const maxAttempts = 3;
  const baseDelay = 1500; // 1.5 seconds

  while (attempts < maxAttempts) {
    try {
      const {output} = await translatePrompt(input);
      if (!output) throw new Error('Translation failed: No output received');
      return output;
    } catch (error: any) {
      attempts++;
      
      // If it's a 503 or 429 (overloaded/rate limited), wait and retry
      const isRetryable = error.message?.includes('503') || error.message?.includes('high demand') || error.message?.includes('429');
      
      if (isRetryable && attempts < maxAttempts) {
        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempts - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      throw error;
    }
  }
  
  throw new Error('Translation failed after multiple attempts due to high demand.');
}
