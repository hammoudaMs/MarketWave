import { NextRequest, NextResponse } from "next/server";
import { getTemplateResponse } from "@/lib/chat";
import type { Business, SocialPage } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { message, businesses = [], socialPages = [] } = (await request.json()) as {
      message: string;
      businesses?: Business[];
      socialPages?: SocialPage[];
    };

    if (!message?.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const ctx = { businesses, socialPages };
    const apiKey = process.env.OPENAI_API_KEY;

    if (apiKey) {
      const contextParts: string[] = [];
      if (businesses.length > 0) {
        contextParts.push(`Selected businesses: ${businesses.map((b) => b.name).join(", ")}`);
      }
      if (socialPages.length > 0) {
        contextParts.push(
          `Selected social pages: ${socialPages.map((p) => `@${p.username} (${p.platform}, ${p.followers} followers)`).join(", ")}`,
        );
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are Nex, an assistant that helps find local businesses and social media pages without websites, then creates landing pages from their assets. Help draft outreach messages. Be concise.${contextParts.length ? ` Context: ${contextParts.join(". ")}` : ""}`,
            },
            { role: "user", content: message },
          ],
          max_tokens: 500,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const reply = data.choices?.[0]?.message?.content ?? getTemplateResponse(message, ctx);
        return NextResponse.json({ reply, source: "openai" });
      }
    }

    const reply = getTemplateResponse(message, ctx);
    return NextResponse.json({ reply, source: "template" });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Chat failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
