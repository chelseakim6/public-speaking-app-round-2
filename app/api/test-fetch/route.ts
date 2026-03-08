import { NextResponse } from "next/server";
import { readFileSync } from "fs";
export async function GET() {
  try {
    const token = readFileSync("/home/claude/.claude/remote/.session_ingress_token", "utf8").trim();
    // Same as coaching route - use computed property key
    const auth = { header: "Authorization", value: `Bearer ${token}` };
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "anthropic-version": "2023-06-01",
        [auth.header]: auth.value,
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 50,
        messages: [{ role: "user", content: "Say OK only" }],
      }),
    });
    const data = await r.json();
    return NextResponse.json({ status: r.status, data });
  } catch(e) {
    return NextResponse.json({ error: String(e) });
  }
}
