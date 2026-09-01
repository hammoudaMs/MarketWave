import type { Business, SocialPage } from "./types";

export function buildOutreachMessage(business: Business): string {
  return `Hi ${business.name} team,

I noticed your business on Google Maps and wanted to reach out. I help local businesses get online with a simple, professional website.

I'd love to create a free preview site for ${business.name} so you can see how it would look — no obligation.

Would you be open to a quick chat?

Best regards`;
}

export function buildSocialOutreachMessage(page: SocialPage): string {
  const platform = page.platform === "instagram" ? "Instagram" : "Facebook";
  return `Hi ${page.name} team,

I came across your ${platform} page (@${page.username}) and love your content! With ${formatFollowers(page.followers)} followers, you've built an amazing audience.

I noticed you don't have a dedicated website yet. I'd love to create a free landing page using your existing brand assets — profile, posts, and bio — so your followers have a central hub to find you.

No obligation — just a preview to show what's possible.

Would you be interested?

Best regards`;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

type ChatContext = {
  businesses: Business[];
  socialPages: SocialPage[];
};

export function getTemplateResponse(message: string, ctx: ChatContext): string {
  const lower = message.toLowerCase();

  if (lower.includes("outreach") || lower.includes("message") || lower.includes("email")) {
    if (ctx.socialPages.length > 0) {
      const page = ctx.socialPages[0];
      return `Here's a draft outreach message for **${page.name}** (@${page.username}):\n\n${buildSocialOutreachMessage(page)}`;
    }
    if (ctx.businesses.length > 0) {
      const biz = ctx.businesses[0];
      return `Here's a draft outreach message for **${biz.name}**:\n\n${buildOutreachMessage(biz)}`;
    }
    return "Select a business or social page first, then I can draft an outreach message for you.";
  }

  if (lower.includes("social") || lower.includes("instagram") || lower.includes("facebook")) {
    return `**Social Discovery:**

1. Go to the **Social** tab
2. Search by keyword, platform, and minimum followers
3. We find active pages with high engagement but no website
4. Click **Generate Landing** — we pull their profile photo, cover, bio, and post images into a ready-made site`;
  }

  if (lower.includes("how") && (lower.includes("work") || lower.includes("use"))) {
    return `**How Nex works:**

1. **Maps** — Find active local businesses near you without a website
2. **Social** — Discover high-follower Facebook & Instagram pages without websites
3. **Sites** — View all generated landing pages
4. **Chat** — Draft outreach messages and get help pitching

Add API keys in \`.env.local\` for live data, or use demo mode to try it out.`;
  }

  if (lower.includes("website") || lower.includes("site") || lower.includes("landing")) {
    return "Pick a business from **Maps** or a page from **Social**, then click **Generate Site** or **Generate Landing**. We use their existing assets to build a preview you can share.";
  }

  if (lower.includes("hello") || lower.includes("hi")) {
    return "Hello! I'm your Nex assistant. I help you find businesses and social pages without websites, generate landing pages from their assets, and draft outreach messages. What would you like to do?";
  }

  return "I can help you with:\n- Finding map businesses without websites\n- Finding high-follower social pages\n- Generating landing pages from their assets\n- Drafting outreach messages\n\nTry: \"How does this work?\" or \"Write an outreach message\"";
}
