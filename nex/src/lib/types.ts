export type Business = {
  id: string;
  name: string;
  address: string;
  phone?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  lat: number;
  lng: number;
  mapsUrl?: string;
};

export type SocialPlatform = "facebook" | "instagram";

export type SocialAssets = {
  profileImage?: string;
  coverImage?: string;
  bio?: string;
  postImages: string[];
  brandColor?: string;
};

export type SocialPage = {
  id: string;
  name: string;
  username: string;
  platform: SocialPlatform;
  followers: number;
  category?: string;
  website?: string;
  profileUrl: string;
  isActive: boolean;
  lastPostDaysAgo?: number;
  assets: SocialAssets;
};

export type GeneratedSite = {
  slug: string;
  type: "business" | "social";
  title: string;
  html: string;
  createdAt: string;
  business?: Business;
  social?: SocialPage;
};

export type Tab = "maps" | "social" | "sites" | "chat";
