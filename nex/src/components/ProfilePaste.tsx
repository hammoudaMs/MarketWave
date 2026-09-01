"use client";

import { useState } from "react";
import { Link2, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { PlatformIcon } from "@/components/PlatformIcon";
import { isValidProfileUrl } from "@/lib/url-parser";
import type { SocialPage } from "@/lib/types";

type Props = {
  onImported: (page: SocialPage) => void;
  onSiteGenerated: (data: {
    slug: string;
    title: string;
    social: SocialPage;
    html: string;
    createdAt: string;
  }) => void;
  onGenerate: (page: SocialPage) => Promise<void>;
  generating: boolean;
};

export default function ProfilePaste({
  onImported,
  onSiteGenerated,
  onGenerate,
  generating,
}: Props) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imported, setImported] = useState<SocialPage | null>(null);
  const [source, setSource] = useState<string | null>(null);

  const valid = isValidProfileUrl(url);

  async function handleImport(generate = false) {
    if (!valid) {
      setError("Paste a valid Instagram or Facebook profile link");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/social/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, generate }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Import failed");
        return;
      }

      const page = data.page as SocialPage;
      setImported(page);
      setSource(data.source);
      onImported(page);

      if (generate && data.slug) {
        onSiteGenerated({
          slug: data.slug,
          title: page.name,
          social: page,
          html: data.html,
          createdAt: data.createdAt,
        });
      }
    } catch {
      setError("Could not import profile. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handlePaste() {
    navigator.clipboard?.readText().then((text) => {
      if (text) setUrl(text.trim());
    });
  }

  return (
    <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Link2 className="h-5 w-5 text-indigo-600" />
        <h3 className="font-semibold text-gray-900">Paste Profile Link</h3>
      </div>
      <p className="mb-3 text-sm text-gray-600">
        Paste an Instagram or Facebook profile URL to pull assets and build a landing page
      </p>

      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          type="url"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
            setImported(null);
          }}
          placeholder="https://instagram.com/username"
          className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={handlePaste}
          className="rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm font-medium text-gray-700 active:scale-[0.98] sm:hidden"
        >
          Paste
        </button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={() => handleImport(false)}
          disabled={!valid || loading}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-indigo-300 bg-white px-4 py-3 text-sm font-medium text-indigo-700 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link2 className="h-4 w-4" />}
          Import Assets
        </button>
        <button
          type="button"
          onClick={() => handleImport(true)}
          disabled={!valid || loading || generating}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white active:scale-[0.98] disabled:opacity-50"
        >
          {loading || generating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Import &amp; Generate
        </button>
      </div>

      {imported && (
        <div className="mt-4 flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-3">
          {imported.assets.profileImage ? (
            <img
              src={imported.assets.profileImage}
              alt=""
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-500 text-lg font-bold text-white">
              {imported.name.charAt(0)}
            </div>
          )}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate font-medium text-gray-900">{imported.name}</p>
              <PlatformIcon platform={imported.platform} className="h-4 w-4 shrink-0" />
            </div>
            <p className="text-xs text-gray-600">@{imported.username}</p>
            <div className="mt-1 flex items-center gap-1 text-xs text-green-700">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Assets imported{source ? ` via ${source}` : ""}
              {imported.assets.postImages.length > 0 &&
                ` · ${imported.assets.postImages.length} images`}
            </div>
          </div>
          <button
            type="button"
            onClick={() => onGenerate(imported)}
            disabled={generating}
            className="shrink-0 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-medium text-white active:scale-[0.98] disabled:opacity-50"
          >
            Generate
          </button>
        </div>
      )}
    </div>
  );
}
