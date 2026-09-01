import { parseProfileUrl } from "./url-parser";
import type { SocialPage, SocialPlatform } from "./types";

type OgData = {
  title?: string;
  description?: string;
  image?: string;
  images: string[];
};

export async function importProfileFromUrl(url: string): Promise<{
  page: SocialPage;
  source: "meta" | "scrape" | "basic";
}> {
  const parsed = parseProfileUrl(url);
  if (!parsed) {
    throw new Error("Invalid profile link. Paste an Instagram or Facebook profile URL.");
  }

  const token = process.env.META_ACCESS_TOKEN;
  if (token && parsed.platform === "facebook") {
    const fromMeta = await fetchFacebookViaGraph(parsed.username, parsed.profileUrl, token);
    if (fromMeta) return { page: fromMeta, source: "meta" };
  }

  const og = await scrapeOpenGraph(parsed.profileUrl, parsed.platform);
  const page = buildPageFromScrape(parsed, og);
  return { page, source: og.image ? "scrape" : "basic" };
}

async function fetchFacebookViaGraph(
  username: string,
  profileUrl: string,
  token: string,
): Promise<SocialPage | null> {
  const fields = [
    "id",
    "name",
    "username",
    "fan_count",
    "about",
    "category",
    "website",
    "picture{url}",
    "cover{source}",
    "posts.limit(6){full_picture}",
  ].join(",");

  const response = await fetch(
    `https://graph.facebook.com/v21.0/${encodeURIComponent(username)}?fields=${fields}&access_token=${token}`,
  );

  if (!response.ok) return null;

  const data = await response.json();
  const postImages = (data.posts?.data ?? [])
    .map((p: { full_picture?: string }) => p.full_picture)
    .filter(Boolean) as string[];

  return {
    id: data.id ?? `fb-${username}`,
    name: data.name ?? username,
    username: data.username ?? username,
    platform: "facebook",
    followers: data.fan_count ?? 0,
    category: data.category,
    website: data.website,
    profileUrl,
    isActive: true,
    assets: {
      profileImage: data.picture?.data?.url ?? data.picture?.url,
      coverImage: data.cover?.source,
      bio: data.about,
      postImages,
      brandColor: "#1877f2",
    },
  };
}

async function scrapeOpenGraph(profileUrl: string, platform: SocialPlatform): Promise<OgData> {
  try {
    const response = await fetch(profileUrl, {
      headers: {
        "User-Agent":
          "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
      redirect: "follow",
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) return { images: [] };

    const html = await response.text();
    return extractOgFromHtml(html);
  } catch {
    return { images: [] };
  }
}

function extractOgFromHtml(html: string): OgData {
  const getMeta = (property: string) => {
    const patterns = [
      new RegExp(`<meta[^>]+property=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
      new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${property}["']`, "i"),
      new RegExp(`<meta[^>]+name=["']${property}["'][^>]+content=["']([^"']+)["']`, "i"),
    ];
    for (const re of patterns) {
      const match = html.match(re);
      if (match?.[1]) return decodeHtmlEntities(match[1]);
    }
    return undefined;
  };

  const title = getMeta("og:title") ?? getMeta("twitter:title");
  const description = getMeta("og:description") ?? getMeta("description");
  const image = getMeta("og:image") ?? getMeta("twitter:image");

  const images: string[] = [];
  if (image) images.push(image);

  const jsonLdMatches = html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/gi);
  for (const match of jsonLdMatches) {
    try {
      const json = JSON.parse(match[1]);
      const items = Array.isArray(json) ? json : [json];
      for (const item of items) {
        if (item?.image) {
          const imgs = Array.isArray(item.image) ? item.image : [item.image];
          for (const img of imgs) {
            const url = typeof img === "string" ? img : img?.url;
            if (url && !images.includes(url)) images.push(url);
          }
        }
      }
    } catch {
      // ignore invalid json-ld
    }
  }

  return { title, description, image, images };
}

function buildPageFromScrape(
  parsed: { platform: SocialPlatform; username: string; profileUrl: string },
  og: OgData,
): SocialPage {
  const name = cleanTitle(og.title, parsed.username);
  const profileImage = og.image ?? og.images[0];
  const postImages = og.images.filter((img) => img !== profileImage).slice(0, 6);

  return {
    id: `import-${parsed.platform}-${parsed.username}`,
    name,
    username: parsed.username,
    platform: parsed.platform,
    followers: 0,
    category: parsed.platform === "instagram" ? "Instagram Profile" : "Facebook Page",
    profileUrl: parsed.profileUrl,
    isActive: true,
    assets: {
      profileImage,
      coverImage: postImages[0] ?? profileImage,
      bio: og.description ?? `Follow @${parsed.username} on ${parsed.platform === "instagram" ? "Instagram" : "Facebook"}`,
      postImages,
      brandColor: parsed.platform === "instagram" ? "#e1306c" : "#1877f2",
    },
  };
}

function cleanTitle(title: string | undefined, fallback: string): string {
  if (!title) return fallback;
  return title
    .replace(/\s*[(@•|·-].*$/u, "")
    .replace(/\s*on Instagram.*$/i, "")
    .replace(/\s*\| Facebook.*$/i, "")
    .trim() || fallback;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");
}
