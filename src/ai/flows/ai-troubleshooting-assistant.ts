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
// Tip: In a production environment, this tool could call the iFixit API (https://www.ifixit.com/api/2.0/doc)
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
    // Professional Tip: Use iFixit API for real-world repair data.
    // For now, we simulate a robust database with more categories.
    const query = input.query.toLowerCase();
    const device = input.deviceType?.toLowerCase() || '';

    if (query.includes('screen') || query.includes('basag')) {
      return [
        { id: 'iphone-13-screen', title: 'iPhone 13 Screen Replacement', url: '/guides/iphone-13-screen', difficulty: 'medium' },
        { id: 'generic-screen-repair', title: 'General Smartphone Screen Repair', url: '/guides/iphone-13-screen', difficulty: 'hard' },
      ];
    }
    
    if (query.includes('battery') || query.includes('mabilis malowbat') || query.includes('ayaw magcharge')) {
      return [
        { id: 'macbook-pro-battery', title: 'MacBook Pro Battery Replacement', url: '/guides/macbook-pro-battery', difficulty: 'hard' },
        { id: 'laptop-charging-port', title: 'Laptop DC Jack Repair', url: '/guides/macbook-pro-battery', difficulty: 'medium' },
      ];
    }

    if (query.includes('drift') || query.includes('joystick') || query.includes('pumipitik')) {
      return [
        { id: 'switch-joycon-drift', title: 'Nintendo Switch Joy-Con Drift Repair', url: '/guides/switch-joycon-drift', difficulty: 'easy' },
        { id: 'ps5-controller-fix', title: 'DualSense Analog Stick Replacement', url: '/guides/switch-joycon-drift', difficulty: 'hard' },
      ];
    }

    if (query.includes('water') || query.includes('nabasa')) {
      return [
        { id: 'water-damage-protocol', title: 'Emergency Water Damage Recovery', url: '/guides/iphone-13-screen', difficulty: 'medium' },
      ];
    }

    return [
      { id: 'general-power-fix', title: 'System Diagnostics: Power Issues', url: '/guides/iphone-13-screen', difficulty: 'easy' },
      { id: 'hardware-reset-guide', title: 'Full Hardware Reset Protocol', url: '/guides/switch-joycon-drift', difficulty: 'easy' },
    ];
  }
);


const aiTroubleshootingAssistantPrompt = ai.definePrompt({
  name: 'aiTroubleshootingAssistantPrompt',
  input: {schema: AITroubleshootingAssistantInputSchema},
  output: {schema: AITroubleshootingAssistantOutputSchema},
  tools: [searchRepairGuidesTool],
  prompt: `You are an AI-powered interactive troubleshooting assistant for electronic devices, part of the AyosGadget repair platform.
Your goal is to help users diagnose problems with their devices and recommend relevant repair guides.

Based on the user's problem description and any conversation history, perform the following steps:
1. Provide a concise diagnosis of the potential problem in a professional, "Neural Engine" style.
2. If more information is needed, ask specific, clarifying questions. Limit to 1-2 questions per turn.
3. Suggest preliminary solutions or troubleshooting steps the user can try.
4. IMPORTANT: Use the 'searchRepairGuides' tool to find and recommend relevant repair guides from AyosGadget. Ensure the query for the tool is descriptive and includes device type if known.

Language Constraint: Use simple Filipino (Mababaw na Tagalog) if the user speaks in Tagalog, otherwise use English.

Conversation History:
{{#if conversationHistory}}
  {{#each conversationHistory}}
    {{this.role}}: {{this.content}}
  {{/each}}
{{/if}}

User's Device Problem:
Device Type: {{deviceType}}
Problem Description: {{{problemDescription}}}

Think step-by-step. First, analyze the problem. Then, formulate your diagnosis, questions, solutions, and finally, search for relevant guides using the provided tool.`
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
