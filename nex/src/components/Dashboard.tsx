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

const DEFAULT_LOCATION = { lat: 40.7128, lng: -74.006 };

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("social");
  const [sites, setSites] = useState<GeneratedSite[]>([]);

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [mapsLoading, setMapsLoading] = useState(false);
  const [mapsSource, setMapsSource] = useState<"google" | "demo" | null>(null);
  const [userLocation, setUserLocation] = useState(DEFAULT_LOCATION);

  const [selectedSocial, setSelectedSocial] = useState<SocialPage | null>(null);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    setSites(loadSites());
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => {},
        { timeout: 5000 },
      );
    }
  }, []);

  const searchMaps = useCallback(async () => {
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
    <div className="flex min-h-[100dvh] flex-col bg-gray-50">
      <header className="shrink-0 border-b border-gray-200 bg-white px-4 py-3 safe-top">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600">
            <Zap className="h-5 w-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Nex</h1>
            <p className="text-xs text-gray-500">Find leads. Build sites.</p>
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col overflow-hidden px-4 py-4 pb-24">
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
            generating={generating}
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
              <p className="text-sm text-gray-500">Your landing pages</p>
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

      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white safe-bottom">
        <div className="grid grid-cols-4">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`relative flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition active:scale-95 ${
                tab === id ? "text-indigo-600" : "text-gray-500"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {id === "sites" && sites.length > 0 && (
                <span className="absolute top-1 ml-8 rounded-full bg-indigo-600 px-1.5 text-[10px] text-white">
                  {sites.length}
                </span>
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
