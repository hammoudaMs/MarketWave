"use client";

import { ExternalLink, Trash2, Globe, MapPin } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import type { GeneratedSite } from "@/lib/types";

type Props = {
  sites: GeneratedSite[];
  onDelete: (slug: string) => void;
};

export default function SiteGallery({ sites, onDelete }: Props) {
  if (sites.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 p-12 text-center">
        <Globe className="mb-3 h-12 w-12 text-gray-300" />
        <h3 className="text-lg font-medium text-gray-700">No sites yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Discover a business or social page and generate a landing page
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {sites.map((site) => (
        <div
          key={site.slug}
          className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
        >
          <div
            className="px-4 py-6 text-white"
            style={{
              background:
                site.type === "social" && site.social?.assets.brandColor
                  ? `linear-gradient(135deg, ${site.social.assets.brandColor}, ${site.social.assets.brandColor}cc)`
                  : "linear-gradient(135deg, #667eea, #764ba2)",
            }}
          >
            <div className="flex items-center gap-2">
              {site.type === "social" && site.social ? (
                <PlatformIcon platform={site.social.platform} className="h-4 w-4" />
              ) : (
                <MapPin className="h-4 w-4" />
              )}
              <span className="text-xs font-medium uppercase opacity-80">
                {site.type === "social" ? site.social?.platform : "Maps"}
              </span>
            </div>
            <h3 className="mt-1 text-lg font-semibold">{site.title}</h3>
          </div>
          <div className="p-4">
            <p className="text-sm text-gray-600">
              {site.type === "social"
                ? `@${site.social?.username} · ${site.social?.followers.toLocaleString()} followers`
                : site.business?.address}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Created {new Date(site.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4 flex gap-2">
              <a
                href={`/sites/${site.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                <ExternalLink className="h-4 w-4" />
                Preview
              </a>
              <button
                type="button"
                onClick={() => onDelete(site.slug)}
                className="rounded-lg border border-gray-200 px-3 py-2 text-gray-500 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
