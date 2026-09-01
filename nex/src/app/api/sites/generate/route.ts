import { NextRequest, NextResponse } from "next/server";
import { buildSiteHtml } from "@/lib/site-template";
import { buildSocialSiteHtml } from "@/lib/social-site-template";
import { toSlug } from "@/lib/slug";
import type { Business, SocialPage } from "@/lib/types";

type GenerateRequest =
  | { type: "business"; data: Business }
  | { type: "social"; data: SocialPage };

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as GenerateRequest;

    if (body.type === "social") {
      const page = body.data;
      if (!page?.name) {
        return NextResponse.json({ error: "Page name is required" }, { status: 400 });
      }

      const slug = toSlug(`${page.username}-${page.platform}`);
      const html = buildSocialSiteHtml(page);

      return NextResponse.json({
        slug,
        type: "social",
        title: page.name,
        social: page,
        html,
        previewUrl: `/sites/${slug}`,
        createdAt: new Date().toISOString(),
      });
    }

    const business = body.data as Business;
    if (!business?.name || business.lat == null || business.lng == null) {
      return NextResponse.json(
        { error: "Business name and location are required" },
        { status: 400 },
      );
    }

    const slug = toSlug(business.name);
    const html = buildSiteHtml(business);

    return NextResponse.json({
      slug,
      type: "business",
      title: business.name,
      business,
      html,
      previewUrl: `/sites/${slug}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
