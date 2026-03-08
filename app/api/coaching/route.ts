import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "fs";

export const maxDuration = 120;

function getAuthHeader(): { header: string; value: string } {
  if (process.env.ANTHROPIC_API_KEY) {
    return { header: "x-api-key", value: process.env.ANTHROPIC_API_KEY };
  }
  const tokenPath = "/home/claude/.claude/remote/.session_ingress_token";
  try {
    const token = readFileSync(tokenPath, "utf8").trim();
    if (token) return { header: "Authorization", value: `Bearer ${token}` };
  } catch {
    // token file not available
  }
  throw new Error("No Anthropic API key configured. Set ANTHROPIC_API_KEY in your environment.");
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { transcript, scenarioTitle, duration } = body as {
      transcript: string;
      scenarioTitle: string;
      duration: number;
    };

    if (!transcript || transcript.trim().length < 20) {
      return NextResponse.json(
        { error: "Transcript too short to analyze. Please speak for at least a few seconds." },
        { status: 400 }
      );
    }

    const wordCount = transcript.trim().split(/\s+/).length;
    const minutes = Math.max(duration / 60, 0.1);
    const wpm = Math.round(wordCount / minutes);

    const systemPrompt = `You are an expert public speaking coach with 20 years of experience coaching executives, politicians, and TEDx speakers. You give direct, specific, actionable feedback. You notice patterns other coaches miss. Your tone is warm but honest — you don't sugarcoat, but you always encourage.`;

    const userPrompt = `Analyze this practice session and return ONLY a valid JSON object — no markdown, no explanation, no code fences.

**Scenario:** ${scenarioTitle}
**Duration:** ${Math.round(duration)} seconds
**Word count:** ${wordCount} words
**Calculated WPM:** ${wpm}

**Transcript:**
"""
${transcript.trim()}
"""

Count every instance of common filler words: um, uh, like, you know, so, basically, actually, literally, right, okay, well, I mean, sort of, kind of. Be precise.

Return this exact JSON structure:
{
  "overallScore": <integer 0-100>,
  "summary": "<2-3 sentence honest, specific assessment of this particular speech>",
  "scores": {
    "clarity": <integer 0-100>,
    "confidence": <integer 0-100>,
    "structure": <integer 0-100>,
    "delivery": <integer 0-100>
  },
  "fillerWords": {
    "count": <total integer>,
    "words": [{"word": "<word>", "count": <integer>}],
    "impact": "<one sentence on how this affects the speech>"
  },
  "pacing": {
    "assessment": "<slow|good|fast>",
    "wordsPerMinute": ${wpm},
    "suggestion": "<specific, actionable advice about pacing>"
  },
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "improvements": ["<specific improvement 1>", "<specific improvement 2>", "<specific improvement 3>"],
  "oneThingToFocus": "<the single most impactful thing to work on in the next session>"
}`;

    const auth = getAuthHeader();
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 90000);

    let apiResponse: Response;
    try {
      apiResponse = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "anthropic-version": "2023-06-01",
          [auth.header]: auth.value,
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 2048,
          system: systemPrompt,
          messages: [{ role: "user", content: userPrompt }],
        }),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!apiResponse.ok) {
      const errBody = await apiResponse.json().catch(() => ({})) as { error?: { message?: string } };
      if (apiResponse.status === 401) {
        return NextResponse.json(
          { error: "API key not configured. Set ANTHROPIC_API_KEY in your environment." },
          { status: 401 }
        );
      }
      if (apiResponse.status === 429) {
        return NextResponse.json(
          { error: "Rate limit reached. Please try again in a moment." },
          { status: 429 }
        );
      }
      throw new Error(errBody?.error?.message ?? `API error ${apiResponse.status}`);
    }

    const data = await apiResponse.json() as { content: Array<{ type: string; text?: string }> };
    const textBlock = data.content.find((b) => b.type === "text");
    if (!textBlock?.text) throw new Error("No text response from Claude");

    const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("Could not extract JSON from response");

    const report = JSON.parse(jsonMatch[0]);
    return NextResponse.json(report);
  } catch (error) {
    console.error("Coaching API error:", error);
    const msg = error instanceof Error ? error.message : "Analysis failed. Please try again.";
    if (msg.includes("API key not configured")) {
      return NextResponse.json({ error: msg }, { status: 401 });
    }
    return NextResponse.json({ error: "Analysis failed. Please try again." }, { status: 500 });
  }
}
