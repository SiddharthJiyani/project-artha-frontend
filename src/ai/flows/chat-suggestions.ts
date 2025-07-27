// src/ai/flows/chat-suggestions.ts
'use server';
/**
 * @fileOverview A Genkit flow to provide context-aware quick reply suggestions for the chat interface.
 *
 * - getChatSuggestions - A function that generates quick reply suggestions based on the chat history.
 * - ChatSuggestionsInput - The input type for the getChatSuggestions function.
 * - ChatSuggestionsOutput - The return type for the getChatSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatSuggestionsInputSchema = z.object({
  chatHistory: z
    .string()
    .describe('The history of the chat between the user and Artha.'),
});
export type ChatSuggestionsInput = z.infer<typeof ChatSuggestionsInputSchema>;

const ChatSuggestionsOutputSchema = z.object({
  suggestions: z
    .array(z.string())
    .describe('An array of quick reply suggestions for the user.'),
});
export type ChatSuggestionsOutput = z.infer<typeof ChatSuggestionsOutputSchema>;

export async function getChatSuggestions(input: ChatSuggestionsInput): Promise<ChatSuggestionsOutput> {
  return chatSuggestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'chatSuggestionsPrompt',
  input: {schema: ChatSuggestionsInputSchema},
  output: {schema: ChatSuggestionsOutputSchema},
  prompt: `You are Artha, a helpful AI financial assistant.

  Given the following chat history, generate 2-3 quick reply suggestions for the user.
  The suggestions should be context-aware and relevant to the user's financial situation and goals.
  Be concise and direct, but always polite.
  The reply suggestions are a good way to let the user know what Artha is capable of, so take this into consideration when creating the suggestions.

  Chat History:
  {{chatHistory}}`,
});

const chatSuggestionsFlow = ai.defineFlow(
  {
    name: 'chatSuggestionsFlow',
    inputSchema: ChatSuggestionsInputSchema,
    outputSchema: ChatSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
