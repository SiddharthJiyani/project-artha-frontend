// src/ai/flows/chat-interface.ts
'use server';

/**
 * @fileOverview An intelligent chat interface flow that simulates Artha's thinking process.
 *
 * - sendMessage - A function that processes user messages and generates responses with AI insights.
 * - ChatInput - The input type for the sendMessage function.
 * - ChatOutput - The return type for the sendMessage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ChatInputSchema = z.object({
  message: z.string().describe('The user message.'),
  chatHistory: z
    .string()
    .describe('The history of the chat between the user and Artha.'),
  netWorth: z.string().describe('The user\u2019s net worth.'),
  monthlyIncome: z.string().describe('The user\u2019s monthly income.'),
  creditScore: z.string().describe('The user\u2019s credit score.'),
  monthlyEMI: z.string().describe('The user\u2019s monthly EMI payments.'),
  idleSavings: z.string().describe('The amount of idle savings the user has.'),
  collateralAvailable: z.string().describe('The amount of collateral available to the user.'),
  paymentDiscipline: z.string().describe('The user\'s payment discipline as a percentage.'),
  financialBiases: z.string().describe('The user\'s financial biases, such as anchoring bias or herding behavior.'),
  diwaliExpenses: z.string().describe('The user\'s expenses related to Diwali.'),
  familyStabilityMaintained: z.string().describe('Whether the user has maintained family stability.'),
  puneRealEstatePerformance: z.string().describe('The performance of Pune real estate compared to Mumbai rental yield.'),
});

export type ChatInput = z.infer<typeof ChatInputSchema>;

const ChatOutputSchema = z.object({
  response: z.string().describe('The response from Artha.'),
  thinkingProcess: z
    .array(z.string())
    .describe('The steps Artha took to generate the response.'),
});

export type ChatOutput = z.infer<typeof ChatOutputSchema>;

export async function sendMessage(input: ChatInput): Promise<ChatOutput> {
  return chatInterfaceFlow(input);
}

const chatInterfacePrompt = ai.definePrompt({
  name: 'chatInterfacePrompt',
  input: {schema: ChatInputSchema},
  output: {schema: ChatOutputSchema},
  prompt: `You are Artha, a helpful AI financial assistant.

  Here is some information about the user:
  Net Worth: {{{netWorth}}}
  Monthly Income: {{{monthlyIncome}}}
  Credit Score: {{{creditScore}}}
  Monthly EMI: {{{monthlyEMI}}}
  Idle Savings: {{{idleSavings}}}
  Collateral Available: {{{collateralAvailable}}}
  Payment Discipline: {{{paymentDiscipline}}}
  Financial Biases: {{{financialBiases}}}
  Diwali Expenses: {{{diwaliExpenses}}}
  Family Stability Maintained: {{{familyStabilityMaintained}}}
  Pune Real Estate Performance: {{{puneRealEstatePerformance}}}

  You will respond to the user message, taking into account the user's financial information.

  Generate a response to the user message. Also, provide the "thinkingProcess" of Artha, which should simulate the AI agents
  analyzing data, consulting risk factors, and synthesizing recommendations. This should be an array of strings.

  User Message: {{{message}}}

  Format the output as a JSON object with the following keys:
  - response: The response from Artha.
  - thinkingProcess: The steps Artha took to generate the response (array of strings).`,
});

const chatInterfaceFlow = ai.defineFlow(
  {
    name: 'chatInterfaceFlow',
    inputSchema: ChatInputSchema,
    outputSchema: ChatOutputSchema,
  },
  async input => {
    const {output} = await chatInterfacePrompt(input);

    return output!;
  }
);
