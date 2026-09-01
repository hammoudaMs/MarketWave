import type { SocialPlatform } from "./types";

export type ParsedProfileUrl = {
  platform: SocialPlatform;
  username: string;
  profileUrl: string;
};

const INSTAGRAM_RE =
  /(?:https?:\/\/)?(?:www\.)?instagram\.com\/([a-zA-Z0-9._]+)\/?(?:\?.*)?$/i;

const FACEBOOK_RE =
  /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/(?!share|sharer|groups|events|watch|photo|story)([a-zA-Z0-9.]+)\/?(?:\?.*)?$/i;

const FACEBOOK_ID_RE =
  /(?:https?:\/\/)?(?:www\.|m\.)?facebook\.com\/profile\.php\?id=(\d+)/i;

export function parseProfileUrl(input: string): ParsedProfileUrl | null {
  const raw = input.trim();
  if (!raw) return null;

  let url = raw;
  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  try {
    const parsed = new URL(url);
    const href = parsed.href;

    const igMatch = href.match(INSTAGRAM_RE);
    if (igMatch) {
      const username = igMatch[1].toLowerCase();
      if (["p", "reel", "reels", "stories", "explore"].includes(username)) return null;
      return {
        platform: "instagram",
        username,
        profileUrl: `https://www.instagram.com/${username}/`,
      };
    }

    const fbIdMatch = href.match(FACEBOOK_ID_RE);
    if (fbIdMatch) {
      return {
        platform: "facebook",
        username: fbIdMatch[1],
        profileUrl: `https://www.facebook.com/profile.php?id=${fbIdMatch[1]}`,
      };
    }

    const fbMatch = href.match(FACEBOOK_RE);
    if (fbMatch) {
      const username = fbMatch[1].toLowerCase();
      if (["pages", "people", "login", "help"].includes(username)) return null;
      return {
        platform: "facebook",
        username,
        profileUrl: `https://www.facebook.com/${username}`,
      };
    }
  } catch {
    return null;
  }

  return null;
}

export function isValidProfileUrl(input: string): boolean {
  return parseProfileUrl(input) !== null;
}
