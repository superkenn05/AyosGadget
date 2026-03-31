'use server';
/**
 * @fileOverview AI Flow to translate repair guide content into Filipino.
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
  const {output} = await translatePrompt(input);
  if (!output) throw new Error('Translation failed');
  return output;
}
