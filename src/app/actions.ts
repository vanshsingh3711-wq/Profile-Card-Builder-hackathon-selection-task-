'use server';

import { generateObject } from 'ai';
import { createOpenAI } from '@ai-sdk/openai';
import { z } from 'zod';

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'dummy_key',
});

/**
 * Stage 1: Chat to gather builder info. Returns suggestedTitles when ready.
 * Stage 2: Generate more title suggestions when user asks for alternatives.
 */
const chatResponseSchema = z.object({
  chatResponse: z.string().describe("Your warm, human, conversational reply. If presenting titles, say something like 'Here are 3 title options for you:'"),
  readyForTitles: z.boolean().describe("True ONLY when you have gathered ALL 3 required fields (name, role, stack). False if any are missing."),
  profile: z.object({
    name: z.string().nullable().describe("The builder's name, or null if not known yet."),
    role: z.string().nullable().describe("The builder's professional role (e.g. 'AI Developer'), or null if not known."),
    stack: z.array(z.string()).describe("List of technologies. Empty array if not known yet."),
  }).describe("Always include this. Use null/empty for unknown fields. Extract from natural language."),
  suggestedTitles: z.array(z.string()).describe("Exactly 3 bold, badass 1-3 word builder titles (ALL CAPS) if readyForTitles is true. Empty array otherwise.")
});

export async function chatWithBuilder(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("No API key");
    }

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: chatResponseSchema,
      system: `You are the Studio AI for Hacker House Goa 2026.
Your job: learn who the user is, their role, and their tech stack. Then suggest 3 badass builder titles.

Rules:
1. You MUST gather exactly these 3 fields: Name, Role, and Tech Stack.
2. If ALL three fields are available: set readyForTitles=true and provide exactly 3 title suggestions (ALL CAPS, 1-3 words) in suggestedTitles. Do NOT ask another question.
3. If one or more fields are missing: set readyForTitles=false and ask ONLY for the missing information in chatResponse. Do not show warnings or tell the user to "tell Studio AI" anything.
4. Extract information if the user provides it naturally in a sentence.
5. Do not ask for builderTitle or personality.
6. If the user asks for more/different titles, generate 3 NEW titles.`,
      messages,
    });

    return { success: true, data: result.object };
  } catch (error) {
    console.error("AI chat failed:", error);
    return {
      success: false,
      data: {
        chatResponse: `Hmm, hit a snag. Error: ${error instanceof Error ? error.message : String(error)}`,
        readyForTitles: false,
        profile: { name: null, role: null, stack: [] },
        suggestedTitles: []
      }
    };
  }
}

const generateTitleSchema = z.object({
  title: z.string().describe("Exactly 1 bold, badass 1-3 word builder title (ALL CAPS). Example: AGENT ARCHITECT")
});

export async function generateBuilderTitle(name: string, role: string, stack: string[]) {
  try {
    if (!process.env.OPENAI_API_KEY) throw new Error("No API key");

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: generateTitleSchema,
      prompt: `Generate exactly one badass 1-3 word builder title for this user.
Name: ${name}
Role: ${role}
Tech Stack: ${stack.join(', ')}
Requirements: MUST be ALL CAPS. Keep it concise (1-3 words). Focus on their role and tech stack.`,
    });

    return { success: true, title: result.object.title };
  } catch (error) {
    console.error("AI title generation failed:", error);
    return { success: false, error: "Failed to generate title" };
  }
}
