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
  prompt: `You are a professional technical translator specializing in electronics repair. 
Translate the following repair guide into Filipino (Tagalog). 

CRITICAL FORMATTING RULES:
1. PRESERVE ALL BULLETS: You MUST maintain every bullet point character (e.g., '•') exactly as it appears.
2. PRESERVE ALL NEWLINES: Do NOT merge separate lines into a single paragraph. Every newline in the source must have a corresponding newline in the translation.
3. DO NOT SUMMARIZE: Translate every instruction line by line.
4. Language: Use clear Tagalog. Use technical terms (Taglish) for parts like "ribbon cable", "motherboard", "screws", "logic board" if it is more natural for a technician.

Guide to translate:
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
