"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, Globe, MessageCircle, Zap } from "lucide-react";
import { SocialTabIcon } from "@/components/PlatformIcon";
import BusinessFinder from "@/components/BusinessFinder";
import SocialFinder from "@/components/SocialFinder";
import SiteGallery from "@/components/SiteGallery";
import ChatPanel from "@/components/ChatPanel";
import { loadSites, addSite, removeSite } from "@/lib/storage";
import type { Business, SocialPage, GeneratedSite, Tab } from "@/lib/types";

const TABS: { id: Tab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "maps", label: "Maps", icon: MapPin },
  { id: "social", label: "Social", icon: SocialTabIcon },
  { id: "sites", label: "Sites", icon: Globe },
  { id: "chat", label: "Chat", icon: MessageCircle },
];

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("maps");
  const [sites, setSites] = useState<GeneratedSite[]>([]);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsSource, setMapsSource] = useState<"google" | "demo" | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [selectedSocial, setSelectedSocial] = useState<SocialPage | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setSites(loadSites());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => setUserLocation({ lat: 40.7128, lng: -74.006 }),
      );
    } else {
      setUserLocation({ lat: 40.7128, lng: -74.006 });
    }
  }, []);

  const searchMaps = useCallback(async () => {
    if (!userLocation) return;
    setMapsLoading(true);
    try {
      const res = await fetch("/api/places/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userLocation),
      });
      const data = await res.json();
      setBusinesses(data.businesses ?? []);
      setMapsSource(data.source ?? null);
    } catch {
      setBusinesses([]);
    } finally {
      setMapsLoading(false);
    }
  }, [userLocation]);

  async function generateBusinessSite(business: Business) {
    setGenerating(true);
    try {
      const res = await fetch("/api/sites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "business", data: business }),
      });
      const data = await res.json();
      if (data.slug) {
        const site: GeneratedSite = {
          slug: data.slug,
          type: "business",
          title: data.title,
          business: data.business,
          html: data.html,
          createdAt: data.createdAt,
        };
        setSites(addSite(site));
        setTab("sites");
      }
    } finally {
      setGenerating(false);
    }
  }

  async function generateSocialSite(page: SocialPage) {
    setGenerating(true);
    try {
      const res = await fetch("/api/sites/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "social", data: page }),
      });
      const data = await res.json();
      if (data.slug) {
        const site: GeneratedSite = {
          slug: data.slug,
          type: "social",
          title: data.title,
          social: data.social,
          html: data.html,
          createdAt: data.createdAt,
        };
        setSites(addSite(site));
        setTab("sites");
      }
    } finally {
      setGenerating(false);
    }
  }

  function handleDeleteSite(slug: string) {
    setSites(removeSite(slug));
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      <header className="border-b border-gray-200 bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">Nex</h1>
              <p className="text-xs text-gray-500">Find leads. Build sites. Close deals.</p>
            </div>
          </div>
          <nav className="flex gap-1 rounded-xl bg-gray-100 p-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setTab(id)}
                className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition ${
                  tab === id
                    ? "bg-white text-indigo-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{label}</span>
                {id === "sites" && sites.length > 0 && (
                  <span className="rounded-full bg-indigo-100 px-1.5 text-xs text-indigo-700">
                    {sites.length}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col overflow-hidden p-4 sm:p-6">
        {tab === "maps" && (
          <BusinessFinder
            businesses={businesses}
            selected={selectedBusiness}
            onSelect={setSelectedBusiness}
            onGenerate={generateBusinessSite}
            onSearch={searchMaps}
            loading={mapsLoading}
            source={mapsSource}
            userLocation={userLocation}
          />
        )}
        {tab === "social" && (
          <SocialFinder
            selected={selectedSocial}
            onSelect={setSelectedSocial}
            onGenerate={generateSocialSite}
            generating={generating}
          />
        )}
        {tab === "sites" && (
          <div className="flex h-full flex-col gap-4 overflow-y-auto">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generated Sites</h2>
              <p className="text-sm text-gray-500">
                Landing pages built from map businesses and social page assets
              </p>
            </div>
            <SiteGallery sites={sites} onDelete={handleDeleteSite} />
          </div>
        )}
        {tab === "chat" && (
          <ChatPanel
            selectedBusinesses={selectedBusiness ? [selectedBusiness] : []}
            selectedSocialPages={selectedSocial ? [selectedSocial] : []}
          />
        )}
      </main>
    </div>
  );
}
