'use server';
/**
 * @fileOverview An AI-powered interactive troubleshooting tool for electronic devices.
 *
 * - aiTroubleshootingAssistant - A function that handles the device troubleshooting process.
 * - AITroubleshootingAssistantInput - The input type for the aiTroubleshootingAssistant function.
 * - AITroubleshootingAssistantOutput - The return type for the aiTroubleshootingAssistant function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Input Schema
const AITroubleshootingAssistantInputSchema = z.object({
  problemDescription: z.string().describe('A detailed description of the device problem provided by the user.'),
  deviceType: z.string().optional().describe('The type of electronic device (e.g., "smartphone", "laptop", "refrigerator").'),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'model']),
    content: z.string(),
  })).optional().describe('Previous turns in the conversation to maintain context. This helps the AI understand the ongoing dialogue.'),
});
export type AITroubleshootingAssistantInput = z.infer<typeof AITroubleshootingAssistantInputSchema>;

// Output Schema
const AITroubleshootingAssistantOutputSchema = z.object({
  diagnosis: z.string().describe('A clear diagnosis of the potential problem with the device, based on the provided information.'),
  questionsToAsk: z.array(z.string()).optional().describe('A list of further questions to ask the user to gather more information and refine the diagnosis.'),
  suggestedSolutions: z.array(z.string()).optional().describe('A list of preliminary solutions or troubleshooting steps the user can try immediately.'),
  recommendedGuides: z.array(z.object({
    id: z.string().describe('The unique identifier of the repair guide.'),
    title: z.string().describe('The title of the recommended repair guide.'),
    url: z.string().url().describe('The URL to the recommended repair guide.'),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe('The difficulty level of the repair guide.'),
  })).optional().describe('A list of relevant repair guide IDs, titles, URLs, and difficulty levels from AyosGadget.'),
});
export type AITroubleshootingAssistantOutput = z.infer<typeof AITroubleshootingAssistantOutputSchema>;

// Define a tool to search for repair guides
const searchRepairGuidesTool = ai.defineTool(
  {
    name: 'searchRepairGuides',
    description: 'Searches the AyosGadget database for relevant repair guides based on keywords and device type.',
    inputSchema: z.object({
      query: z.string().describe('Keywords or a brief description of the repair needed (e.g., "iPhone 13 screen replacement", "laptop not charging").'),
      deviceType: z.string().optional().describe('The type of electronic device to filter guides (e.g., "smartphone", "laptop").'),
    }),
    outputSchema: z.array(z.object({
      id: z.string(),
      title: z.string(),
      url: z.string().url(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
    })),
  },
  async (input) => {
    // Placeholder for actual database search.
    // In a real application, this would query a database or API for repair guides.
    console.log(`Searching for guides with query: "${input.query}" for deviceType: "${input.deviceType || 'any'}"`);
    if (input.query.toLowerCase().includes('screen') && input.deviceType?.toLowerCase().includes('iphone')) {
      return [
        { id: 'iphone-13-screen-replace', title: 'iPhone 13 Screen Replacement', url: '/guides/iphone-13-screen-replacement', difficulty: 'medium' },
        { id: 'iphone-13-glass-repair', title: 'iPhone 13 Front Glass Repair', url: '/guides/iphone-13-glass-repair', difficulty: 'hard' },
      ];
    }
    if (input.query.toLowerCase().includes('battery') && input.deviceType?.toLowerCase().includes('laptop')) {
        return [
            { id: 'laptop-battery-replace', title: 'Laptop Battery Replacement', url: '/guides/laptop-battery-replacement', difficulty: 'easy' },
        ];
    }
    return [
      { id: 'general-troubleshooting-power', title: 'General Power Troubleshooting for Devices', url: '/guides/general-power-troubleshooting', difficulty: 'easy' },
      { id: 'common-mobile-repairs', title: 'Common Mobile Device Repairs', url: '/guides/common-mobile-repairs', difficulty: 'medium' },
    ];
  }
);


const aiTroubleshootingAssistantPrompt = ai.definePrompt({
  name: 'aiTroubleshootingAssistantPrompt',
  input: {schema: AITroubleshootingAssistantInputSchema},
  output: {schema: AITroubleshootingAssistantOutputSchema},
  tools: [searchRepairGuidesTool],
  prompt: `You are an AI-powered interactive troubleshooting assistant for electronic devices, part of the AyosGadget repair platform.\nYour goal is to help users diagnose problems with their devices and recommend relevant repair guides.\n\nBased on the user's problem description and any conversation history, perform the following steps:\n1. Provide a concise diagnosis of the potential problem.\n2. If more information is needed, ask specific, clarifying questions. Limit to 1-2 questions per turn.\n3. Suggest preliminary solutions or troubleshooting steps the user can try.\n4. IMPORTANT: Use the 'searchRepairGuides' tool to find and recommend relevant repair guides from AyosGadget. Ensure the query for the tool is descriptive and includes device type if known.\n\nConversation History:\n{{#if conversationHistory}}\n  {{#each conversationHistory}}\n    {{this.role}}: {{this.content}}\n  {{/each}}\n{{/if}}\n\nUser's Device Problem:\nDevice Type: {{deviceType}}\nProblem Description: {{{problemDescription}}}\n\nThink step-by-step. First, analyze the problem. Then, formulate your diagnosis, questions, solutions, and finally, search for relevant guides using the provided tool.\n`
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
