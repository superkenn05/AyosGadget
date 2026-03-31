'use server';
/**
 * @fileOverview An AI-powered interactive troubleshooting tool for electronic devices.
 * Now integrated with real iFixit API data.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import {searchIFixitGuides} from '@/lib/ifixit-api';

// Input Schema
const AITroubleshootingAssistantInputSchema = z.object({
  problemDescription: z.string().describe('A detailed description of the device problem provided by the user.'),
  deviceType: z.string().optional().describe('The type of electronic device (e.g., "smartphone", "laptop", "refrigerator").'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Previous turns in the conversation to maintain context.'),
});
export type AITroubleshootingAssistantInput = z.infer<typeof AITroubleshootingAssistantInputSchema>;

// Output Schema
const AITroubleshootingAssistantOutputSchema = z.object({
  diagnosis: z.string().describe('A clear diagnosis of the potential problem with the device.'),
  questionsToAsk: z.array(z.string()).optional().describe('Further questions to gathering telemetry.'),
  suggestedSolutions: z.array(z.string()).optional().describe('Preliminary solutions or troubleshooting steps.'),
  recommendedGuides: z.array(z.object({
    id: z.string().describe('The unique identifier of the repair guide.'),
    title: z.string().describe('The title of the recommended repair guide.'),
    url: z.string().url().describe('The internal URL to the recommended repair guide (e.g., /guides/1234).'),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('Difficulty level.'),
  })).optional().describe('Relevant repair guides fetched from iFixit.'),
});
export type AITroubleshootingAssistantOutput = z.infer<typeof AITroubleshootingAssistantOutputSchema>;

// Real iFixit Tool
const searchRepairGuidesTool = ai.defineTool(
  {
    name: 'searchRepairGuides',
    description: 'Searches the real-world iFixit database for relevant repair guides based on keywords.',
    inputSchema: z.object({
      query: z.string().describe('Search terms (e.g., "iPhone 13 battery", "MacBook logic board").'),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    })),
  },
  async (input) => {
    const results = await searchIFixitGuides(input.query);
    return results.map((r: any) => ({
      id: r.guideid.toString(),
      title: r.title,
      url: `/guides/${r.guideid}`,
      difficulty: r.difficulty?.toLowerCase().includes('easy') ? 'easy' : r.difficulty?.toLowerCase().includes('moderate') ? 'medium' : 'hard',
    }));
  }
);

const aiTroubleshootingAssistantPrompt = ai.definePrompt({
  name: 'aiTroubleshootingAssistantPrompt',
  input: {schema: AITroubleshootingAssistantInputSchema},
  output: {schema: AITroubleshootingAssistantOutputSchema},
  tools: [searchRepairGuidesTool],
  prompt: `You are an AI-powered interactive troubleshooting assistant for electronic devices, part of the AyosGadget platform.
Your goal is to help users diagnose problems and recommend REAL iFixit repair guides.

Step-by-Step:
1. Provide a concise technical diagnosis.
2. Ask 1-2 clarifying questions if needed.
3. Suggest immediate troubleshooting steps.
4. CRITICAL: Call 'searchRepairGuides' with a highly descriptive query to find real iFixit manuals.

Language: Use simple Filipino (Mababaw na Tagalog) if the user speaks Tagalog, otherwise English.

History:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}
{{/if}}

User's Device Problem:
Device Type: {{deviceType}}
Problem Description: {{{problemDescription}}}`
});

const aiTroubleshootingAssistantFlow = ai.defineFlow(
  {
    name: 'aiTroubleshootingAssistantFlow',
    inputSchema: AITroubleshootingAssistantInputSchema,
    outputSchema: AITroubleshootingAssistantOutputSchema,
  },
  async (input) => {
    const {output} = await aiTroubleshootingAssistantPrompt(input);
    return output!;
  }
);

export async function aiTroubleshootingAssistant(input: AITroubleshootingAssistantInput): Promise<AITroubleshootingAssistantOutput> {
  return aiTroubleshootingAssistantFlow(input);
}
