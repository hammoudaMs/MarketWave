"use client";

import dynamic from "next/dynamic";
import { MapPin, Phone, Star, Globe, Loader2 } from "lucide-react";
import type { Business } from "@/lib/types";

const BusinessMap = dynamic(() => import("./BusinessMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full items-center justify-center bg-gray-100 rounded-xl">
      <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
    </div>
  ),
});

type Props = {
  businesses: Business[];
  selected: Business | null;
  onSelect: (business: Business) => void;
  onGenerate: (business: Business) => void;
  onSearch: () => void;
  loading: boolean;
  source: "google" | "demo" | null;
  userLocation: { lat: number; lng: number };
  generating?: boolean;
};

export default function BusinessFinder({
  businesses,
  selected,
  onSelect,
  onGenerate,
  onSearch,
  loading,
  source,
  userLocation,
  generating = false,
}: Props) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Discover Nearby</h2>
          <p className="text-sm text-gray-500">
            Find active local businesses without a website
          </p>
        </div>
        <button
          type="button"
          onClick={onSearch}
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
          {loading ? "Searching..." : "Search Near Me"}
        </button>
      </div>

      {source === "demo" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
          Demo mode — add <code className="rounded bg-amber-100 px-1">GOOGLE_PLACES_API_KEY</code> to{" "}
          <code className="rounded bg-amber-100 px-1">.env.local</code> for real results
        </div>
      )}

      <div className="grid flex-1 gap-4 lg:grid-cols-2 min-h-0">
        <div className="h-[250px] sm:h-[400px] lg:h-full overflow-hidden rounded-xl border border-gray-200">
          <BusinessMap
            center={userLocation}
            businesses={businesses}
            selectedId={selected?.id}
            onSelect={onSelect}
          />
        </div>

        <div className="flex flex-col gap-2 overflow-y-auto">
          {businesses.length === 0 && !loading && (
            <div className="flex flex-1 items-center justify-center rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
              <div>
                <Globe className="mx-auto mb-2 h-10 w-10 text-gray-300" />
                <p>Click &quot;Search Near Me&quot; to find businesses without websites</p>
              </div>
            </div>
          )}

          {businesses.map((biz) => (
            <button
              key={biz.id}
              type="button"
              onClick={() => onSelect(biz)}
              className={`rounded-xl border p-4 text-left transition ${
                selected?.id === biz.id
                  ? "border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{biz.name}</h3>
                  <p className="text-sm text-gray-500">{biz.category}</p>
                </div>
                {biz.rating && (
                  <span className="flex items-center gap-1 text-sm text-amber-600">
                    <Star className="h-3.5 w-3.5 fill-current" />
                    {biz.rating.toFixed(1)}
                  </span>
                )}
              </div>
              <p className="mt-1 flex items-center gap-1 text-sm text-gray-600">
                <MapPin className="h-3.5 w-3.5" />
                {biz.address}
              </p>
              {biz.phone && (
                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-600">
                  <Phone className="h-3.5 w-3.5" />
                  {biz.phone}
                </p>
              )}
              <span className="mt-2 inline-block rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                No website
              </span>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="flex flex-col gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-medium text-indigo-900">Selected: {selected.name}</p>
            <p className="text-sm text-indigo-700">Ready to generate a simple website</p>
          </div>
          <button
            type="button"
            onClick={() => onGenerate(selected)}
            disabled={generating}
            className="w-full rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white hover:bg-indigo-700 active:scale-[0.98] disabled:opacity-50 sm:w-auto"
          >
            Generate Site
          </button>
        </div>
      )}
    </div>
  );
}
