import { NextRequest, NextResponse } from "next/server";
import { importProfileFromUrl } from "@/lib/profile-import";
import { buildSocialSiteHtml } from "@/lib/social-site-template";
import { toSlug } from "@/lib/slug";

export async function POST(request: NextRequest) {
  try {
    const { url, generate } = (await request.json()) as {
      url: string;
      generate?: boolean;
    };

    if (!url?.trim()) {
      return NextResponse.json({ error: "Profile URL is required" }, { status: 400 });
    }

    const result = await importProfileFromUrl(url.trim());

    if (!generate) {
      return NextResponse.json(result);
    }

    const slug = toSlug(`${result.page.username}-${result.page.platform}`);
    const html = buildSocialSiteHtml(result.page);

    return NextResponse.json({
      ...result,
      slug,
      html,
      previewUrl: `/sites/${slug}`,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Import failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
