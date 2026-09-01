import type { SocialPage, SocialPlatform } from "./types";

const MOCK_SOCIAL_PAGES: SocialPage[] = [
  {
    id: "ig-1",
    name: "FitFuel Kitchen",
    username: "fitfuelkitchen",
    platform: "instagram",
    followers: 48200,
    category: "Health & Wellness",
    profileUrl: "https://instagram.com/fitfuelkitchen",
    isActive: true,
    lastPostDaysAgo: 1,
    assets: {
      profileImage: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=200&h=200&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=1200&h=400&fit=crop",
      bio: "Meal prep & healthy recipes. Fuel your body right. DM for catering.",
      postImages: [
        "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1498837167922-ddd27525d352?w=600&h=600&fit=crop",
      ],
      brandColor: "#10b981",
    },
  },
  {
    id: "fb-1",
    name: "Downtown Barbers",
    username: "downtownbarbers",
    platform: "facebook",
    followers: 12800,
    category: "Barber Shop",
    profileUrl: "https://facebook.com/downtownbarbers",
    isActive: true,
    lastPostDaysAgo: 3,
    assets: {
      profileImage: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=200&h=200&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1585747860715-2ba37e788b70?w=1200&h=400&fit=crop",
      bio: "Premium cuts since 2015. Walk-ins welcome. Book via Messenger.",
      postImages: [
        "https://images.unsplash.com/photo-1622286342621-4bd786c2447c?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=600&h=600&fit=crop",
      ],
      brandColor: "#1e40af",
    },
  },
  {
    id: "ig-2",
    name: "Bloom & Petal",
    username: "bloomandpetal",
    platform: "instagram",
    followers: 31500,
    category: "Florist",
    profileUrl: "https://instagram.com/bloomandpetal",
    isActive: true,
    lastPostDaysAgo: 2,
    assets: {
      profileImage: "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=200&h=200&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=1200&h=400&fit=crop",
      bio: "Custom bouquets & event florals. Same-day delivery available.",
      postImages: [
        "https://images.unsplash.com/photo-1561181286-d3fee7d17060?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1455659817273-f96807779a8a?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&h=600&fit=crop",
      ],
      brandColor: "#ec4899",
    },
  },
  {
    id: "fb-2",
    name: "Taco Loco Truck",
    username: "tacolocotruck",
    platform: "facebook",
    followers: 22100,
    category: "Food Truck",
    profileUrl: "https://facebook.com/tacolocotruck",
    isActive: true,
    lastPostDaysAgo: 0,
    assets: {
      profileImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=200&h=200&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=1200&h=400&fit=crop",
      bio: "Authentic street tacos. Find our location daily on Stories!",
      postImages: [
        "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1599974579688-8dbddb0a2114?w=600&h=600&fit=crop",
      ],
      brandColor: "#f59e0b",
    },
  },
  {
    id: "ig-3",
    name: "Zen Yoga Studio",
    username: "zenyogastudio",
    platform: "instagram",
    followers: 15600,
    category: "Yoga Studio",
    profileUrl: "https://instagram.com/zenyogastudio",
    isActive: true,
    lastPostDaysAgo: 1,
    assets: {
      profileImage: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=200&fit=crop",
      coverImage: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=1200&h=400&fit=crop",
      bio: "Mindful movement for every body. Classes daily. Free trial class!",
      postImages: [
        "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&h=600&fit=crop",
        "https://images.unsplash.com/photo-1599901860904-17e06ed7083a?w=600&h=600&fit=crop",
      ],
      brandColor: "#8b5cf6",
    },
  },
];

type SearchParams = {
  query: string;
  platform?: SocialPlatform | "all";
  minFollowers?: number;
  location?: string;
};

export async function searchSocialPages(
  params: SearchParams,
): Promise<{ pages: SocialPage[]; source: "meta" | "demo" }> {
  const token = process.env.META_ACCESS_TOKEN;
  const minFollowers = params.minFollowers ?? 5000;

  if (!token) {
    return {
      pages: filterMockPages(params, minFollowers),
      source: "demo",
    };
  }

  try {
    const pages = await searchViaMetaApi(token, params, minFollowers);
    if (pages.length > 0) {
      return { pages, source: "meta" };
    }
  } catch {
    // fall through to demo
  }

  return {
    pages: filterMockPages(params, minFollowers),
    source: "demo",
  };
}

async function searchViaMetaApi(
  token: string,
  params: SearchParams,
  minFollowers: number,
): Promise<SocialPage[]> {
  const query = encodeURIComponent(params.query);
  const url = `https://graph.facebook.com/v21.0/pages/search?q=${query}&fields=id,name,username,fan_count,link,category,picture{url},cover{source},about,website&access_token=${token}`;

  const response = await fetch(url);
  if (!response.ok) return [];

  const data = await response.json();
  const results = data.data ?? [];

  return results
    .filter(
      (page: { fan_count?: number; website?: string }) =>
        (page.fan_count ?? 0) >= minFollowers && !page.website,
    )
    .map(
      (page: {
        id: string;
        name: string;
        username?: string;
        fan_count?: number;
        link?: string;
        category?: string;
        picture?: { data?: { url?: string } };
        cover?: { source?: string };
        about?: string;
      }): SocialPage => ({
        id: page.id,
        name: page.name,
        username: page.username ?? page.name.toLowerCase().replace(/\s+/g, ""),
        platform: "facebook" as SocialPlatform,
        followers: page.fan_count ?? 0,
        category: page.category,
        profileUrl: page.link ?? `https://facebook.com/${page.username ?? page.id}`,
        isActive: true,
        assets: {
          profileImage: page.picture?.data?.url,
          coverImage: page.cover?.source,
          bio: page.about,
          postImages: [],
          brandColor: "#1877f2",
        },
      }),
    );
}

function filterMockPages(params: SearchParams, minFollowers: number): SocialPage[] {
  const q = params.query.toLowerCase().trim();
  const skipQueryFilter = !q || q === "local business";

  return MOCK_SOCIAL_PAGES.filter((page) => {
    if (page.followers < minFollowers) return false;
    if (!page.isActive) return false;
    if (page.website) return false;
    if (params.platform && params.platform !== "all" && page.platform !== params.platform) {
      return false;
    }
    if (
      !skipQueryFilter &&
      !page.name.toLowerCase().includes(q) &&
      !page.category?.toLowerCase().includes(q) &&
      !page.username.toLowerCase().includes(q)
    ) {
      return false;
    }
    return true;
  });
}

export function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}
