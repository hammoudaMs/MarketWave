"use client";

import { useState, useEffect } from "react";
import {
  Search,
  Users,
  Image as ImageIcon,
  Loader2,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { formatFollowers } from "@/lib/social";
import type { SocialPage, SocialPlatform } from "@/lib/types";

type Props = {
  selected: SocialPage | null;
  onSelect: (page: SocialPage) => void;
  onGenerate: (page: SocialPage) => void;
  generating: boolean;
};

export default function SocialFinder({ selected, onSelect, onGenerate, generating }: Props) {
  const [query, setQuery] = useState("");
  const [platform, setPlatform] = useState<SocialPlatform | "all">("all");
  const [minFollowers, setMinFollowers] = useState(5000);
  const [pages, setPages] = useState<SocialPage[]>([]);
  const [loading, setLoading] = useState(false);
  const [source, setSource] = useState<"meta" | "demo" | null>(null);

  useEffect(() => {
    runSearch();
  }, []);

  async function runSearch() {
    setLoading(true);
    try {
      const res = await fetch("/api/social/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, platform, minFollowers }),
      });
      const data = await res.json();
      setPages(data.pages ?? []);
      setSource(data.source ?? null);
    } catch {
      setPages([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    await runSearch();
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Social Discovery</h2>
        <p className="text-sm text-gray-500">
          Find high-follower Facebook &amp; Instagram pages without websites
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search keyword (e.g. bakery, fitness)..."
            className="w-full rounded-lg border border-gray-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value as SocialPlatform | "all")}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          <option value="all">All platforms</option>
          <option value="instagram">Instagram</option>
          <option value="facebook">Facebook</option>
        </select>

        <select
          value={minFollowers}
          onChange={(e) => setMinFollowers(Number(e.target.value))}
          className="rounded-lg border border-gray-200 px-3 py-2.5 text-sm outline-none focus:border-indigo-500"
        >
          <option value={1000}>1K+ followers</option>
          <option value={5000}>5K+ followers</option>
          <option value={10000}>10K+ followers</option>
          <option value={50000}>50K+ followers</option>
        </select>

        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Search
        </button>
      </form>

      {source === "demo" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Demo mode — add <code className="rounded bg-amber-100 px-1">META_ACCESS_TOKEN</code> to{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code> for live Facebook data
        </div>
      )}

      <div className="grid flex-1 gap-4 overflow-y-auto sm:grid-cols-2 lg:grid-cols-3">
        {pages.length === 0 && !loading && (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 text-center text-gray-500">
            <Users className="mb-3 h-12 w-12 text-gray-300" />
            <p>Search for active social pages with high followers but no website</p>
          </div>
        )}

        {pages.map((page) => (
          <button
            key={page.id}
            type="button"
            onClick={() => onSelect(page)}
            className={`rounded-xl border text-left transition ${
              selected?.id === page.id
                ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                : "border-gray-200 bg-white hover:border-gray-300"
            }`}
          >
            <div
              className="h-24 rounded-t-xl bg-cover bg-center"
              style={{
                backgroundImage: page.assets.coverImage
                  ? `url(${page.assets.coverImage})`
                  : `linear-gradient(135deg, ${page.assets.brandColor ?? "#6366f1"}, #a855f7)`,
              }}
            />
            <div className="relative px-4 pb-4">
              <div className="absolute -top-8 left-4">
                {page.assets.profileImage ? (
                  <img
                    src={page.assets.profileImage}
                    alt={page.name}
                    className="h-16 w-16 rounded-full border-4 border-white object-cover shadow"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-indigo-500 text-xl font-bold text-white shadow">
                    {page.name.charAt(0)}
                  </div>
                )}
              </div>
              <div className="pt-10">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900">{page.name}</h3>
                    <p className="text-sm text-gray-500">@{page.username}</p>
                  </div>
                  <PlatformIcon
                    platform={page.platform}
                    className={`h-5 w-5 ${page.platform === "instagram" ? "text-pink-500" : "text-blue-600"}`}
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
                    {formatFollowers(page.followers)} followers
                  </span>
                  {page.lastPostDaysAgo != null && page.lastPostDaysAgo <= 7 && (
                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                      Active
                    </span>
                  )}
                  <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                    No website
                  </span>
                </div>
                {page.assets.bio && (
                  <p className="mt-2 line-clamp-2 text-xs text-gray-600">{page.assets.bio}</p>
                )}
                {page.assets.postImages.length > 0 && (
                  <div className="mt-2 flex items-center gap-1 text-xs text-gray-400">
                    <ImageIcon className="h-3.5 w-3.5" />
                    {page.assets.postImages.length} post images available
                  </div>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            {selected.assets.profileImage && (
              <img
                src={selected.assets.profileImage}
                alt=""
                className="h-10 w-10 rounded-full object-cover"
              />
            )}
            <div>
              <p className="font-medium text-indigo-900">
                {selected.name} · {formatFollowers(selected.followers)} followers
              </p>
              <p className="text-sm text-indigo-700">
                Assets ready: profile, cover, bio
                {selected.assets.postImages.length > 0 &&
                  `, ${selected.assets.postImages.length} post images`}
              </p>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <a
              href={selected.profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-lg border border-indigo-200 px-3 py-3 text-sm text-indigo-700 hover:bg-white active:scale-[0.98]"
            >
              <ExternalLink className="h-4 w-4" />
              View
            </a>
            <button
              type="button"
              onClick={() => onGenerate(selected)}
              disabled={generating}
              className="flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate Landing
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
