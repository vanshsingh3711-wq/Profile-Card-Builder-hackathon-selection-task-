import OpenAI from "openai";
import { NextResponse } from "next/server";
import type {
  PhotoValidationResult,
  SubjectBox,
  SubjectType,
} from "@/types/builder";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Validate that a raw value looks like a usable SubjectBox.
 * Returns a sanitized copy or `null` if the data is invalid.
 */
function sanitizeSubjectBox(
  raw: unknown
): SubjectBox | null {
  if (!raw || typeof raw !== "object") return null;

  const box = raw as Record<string, unknown>;

  const x = Number(box.x);
  const y = Number(box.y);
  const width = Number(box.width);
  const height = Number(box.height);

  if (
    !Number.isFinite(x) ||
    !Number.isFinite(y) ||
    !Number.isFinite(width) ||
    !Number.isFinite(height) ||
    width <= 0 ||
    height <= 0
  ) {
    return null;
  }

  return { x, y, width, height };
}

/** Narrow a raw string to one of the accepted subject types. */
function toSubjectType(raw: unknown): SubjectType {
  if (
    raw === "human" ||
    raw === "anime" ||
    raw === "illustration"
  ) {
    return raw;
  }
  return "invalid";
}

export async function POST(req: Request) {
  try {
    const body: unknown = await req.json();

    if (
      !body ||
      typeof body !== "object" ||
      !("image" in body) ||
      typeof (body as Record<string, unknown>).image !== "string"
    ) {
      const rejection: PhotoValidationResult = {
        valid: false,
        type: "invalid",
        reason: "No image provided.",
        subjectBox: null,
      };
      return NextResponse.json(rejection, { status: 400 });
    }

    const image = (body as Record<string, unknown>).image as string;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // gpt-5-mini doesn't exist, use gpt-4o for vision
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are an image validator. You must always return a JSON object with this exact structure: { \"valid\": boolean, \"type\": \"human\"|\"anime\"|\"illustration\"|\"invalid\", \"reason\": string, \"subjectBox\": { \"x\": number, \"y\": number, \"width\": number, \"height\": number } | null }. The bounding box coordinates must be PIXEL coordinates relative to the original image.",
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Your job is to determine whether the uploaded image contains ONE clear main human or humanoid character.

ACCEPT:
- real human person
- anime character
- manga character
- illustrated human
- cartoon human
- fictional humanoid
- stylized humanoid avatar

REJECT:
- animals
- pets
- cars
- motorcycles
- buildings
- landscapes
- food
- products
- laptops
- phones
- objects
- logos
- screenshots
- scenery
- empty images
- abstract images
- images where the main subject is not human/humanoid
- groups where there is no clearly dominant main subject

IMPORTANT:
There should be ONE clearly identifiable main subject.
If there are multiple people, only accept the image if one person is clearly the dominant/main subject.

For accepted images:
1. Identify the main subject.
2. Determine the subject type.
3. Find the bounding box of the main subject.
4. The bounding box should include the person's/character's head and upper body.
5. The coordinates must be PIXEL coordinates relative to the original image.
6. Do not return normalized coordinates.
7. Do not hallucinate coordinates.
8. If you cannot confidently identify a human/humanoid subject, reject the image.
`,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
                detail: "high"
              },
            },
          ],
        },
      ],
    });

    const text = response.choices[0]?.message?.content?.trim();

    if (!text) {
      throw new Error("OpenAI returned an empty response.");
    }

    /*
     * Models occasionally wrap JSON in markdown despite instructions.
     * Remove it defensively before parsing.
     */
    const cleanedText = text
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    const result: Record<string, unknown> = JSON.parse(cleanedText);

    /*
     * Defensive validation.
     */
    if (typeof result.valid !== "boolean") {
      throw new Error("Invalid validation response.");
    }

    if (!result.valid) {
      const rejection: PhotoValidationResult = {
        valid: false,
        type: "invalid",
        reason:
          typeof result.reason === "string" && result.reason
            ? result.reason
            : "Please upload an image containing a person or character.",
        subjectBox: null,
      };
      return NextResponse.json(rejection);
    }

    const accepted: PhotoValidationResult = {
      valid: true,
      type: toSubjectType(result.type),
      reason:
        typeof result.reason === "string" && result.reason
          ? result.reason
          : "A valid main subject was detected.",
      subjectBox: sanitizeSubjectBox(result.subjectBox),
    };
    return NextResponse.json(accepted);
  } catch (error) {
    console.error("Photo validation error:", error);

    const fallback: PhotoValidationResult = {
      valid: false,
      type: "invalid",
      reason:
        "Unable to validate this image. Please try another photo.",
      subjectBox: null,
    };
    return NextResponse.json(fallback, { status: 500 });
  }
}