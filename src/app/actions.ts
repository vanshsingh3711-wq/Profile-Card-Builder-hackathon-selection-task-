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
  readyForTitles: z.boolean().describe("True when you have gathered enough info about the user (name, role, stack) to suggest builder titles. False if still gathering info."),
  profile: z.object({
    name: z.string().nullable().describe("The builder's name, or null if not known yet."),
    role: z.string().nullable().describe("The builder's professional role (e.g. 'AI Developer'), or null if not known."),
    stack: z.array(z.string()).describe("Up to 4 tech stack items. Empty array if not known yet."),
  }).describe("Always include this. Use null/empty for unknown fields."),
  suggestedTitles: z.array(z.string()).describe("Exactly 3 bold, badass 1-3 word builder titles (ALL CAPS) if readyForTitles is true. Empty array otherwise. Examples: AGENT ARCHITECT, SYSTEMS BUILDER, VIBE CODER, NEURAL FORGER.")
});

export async function chatWithBuilder(messages: { role: 'user' | 'assistant'; content: string }[]) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("No API key");
    }

    const result = await generateObject({
      model: openai('gpt-4o-mini'),
      schema: chatResponseSchema,
      system: `You are the Studio AI for Hacker House Goa 2026 — a legendary builder retreat.
Your job: have a short, energetic conversation to learn who the user is, what they build, and their tech stack. Then suggest 3 badass builder titles.

Rules:
- Be warm, human, and fast. Max 1-2 sentences per reply.
- Ask for their name first if they haven't given it. Then ask what they build.
- Once you know their name AND what they build, set readyForTitles=true and provide exactly 3 title suggestions in suggestedTitles (ALL CAPS, 1-3 words each).
- If the user says "more", "different", "suggest more", or similar — generate 3 NEW titles (different from before).
- Do NOT finalize the card. Wait for the user to select a title.`,
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
