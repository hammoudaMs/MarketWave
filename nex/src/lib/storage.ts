import type { GeneratedSite } from "./types";

const STORAGE_KEY = "nex-generated-sites";

export function loadSites(): GeneratedSite[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as GeneratedSite[]) : [];
  } catch {
    return [];
  }
}

export function saveSites(sites: GeneratedSite[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sites));
}

export function addSite(site: GeneratedSite): GeneratedSite[] {
  const sites = loadSites();
  const filtered = sites.filter((s) => s.slug !== site.slug);
  const updated = [site, ...filtered];
  saveSites(updated);
  return updated;
}

export function removeSite(slug: string): GeneratedSite[] {
  const updated = loadSites().filter((s) => s.slug !== slug);
  saveSites(updated);
  return updated;
}

export function getSiteBySlug(slug: string): GeneratedSite | undefined {
  return loadSites().find((s) => s.slug === slug);
}
