import { NextRequest, NextResponse } from "next/server";
import { searchSocialPages } from "@/lib/social";
import type { SocialPlatform } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const query = String(body.query ?? "").trim();
    const platform = (body.platform ?? "all") as SocialPlatform | "all";
    const minFollowers = Number(body.minFollowers) || 5000;
    const location = body.location ? String(body.location) : undefined;

    const result = await searchSocialPages({
      query: query || "local business",
      platform,
      minFollowers,
      location,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Search failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
