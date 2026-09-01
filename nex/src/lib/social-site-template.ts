import type { SocialPage } from "./types";

export function buildSocialSiteHtml(page: SocialPage): string {
  const { assets } = page;
  const brand = assets.brandColor ?? (page.platform === "instagram" ? "#e1306c" : "#1877f2");
  const cover = assets.coverImage ?? "";
  const profile = assets.profileImage ?? "";
  const bio = assets.bio ?? `Follow us on ${page.platform === "instagram" ? "Instagram" : "Facebook"} for updates!`;
  const gallery = assets.postImages.slice(0, 6);

  const galleryHtml = gallery.length
    ? `<section class="gallery">
        <h2>Gallery</h2>
        <div class="grid">${gallery.map((img) => `<img src="${img}" alt="${escapeHtml(page.name)}" loading="lazy" />`).join("")}</div>
      </section>`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: system-ui, -apple-system, sans-serif; color: #1a1a2e; line-height: 1.6; }
    .hero {
      position: relative;
      height: 280px;
      background: ${cover ? `url('${cover}') center/cover` : `linear-gradient(135deg, ${brand}, ${brand}cc)`};
    }
    .hero::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.6));
    }
    .profile-wrap {
      position: relative;
      max-width: 800px;
      margin: -60px auto 0;
      padding: 0 1.5rem;
      z-index: 1;
    }
    .profile-img {
      width: 120px;
      height: 120px;
      border-radius: 50%;
      border: 4px solid white;
      object-fit: cover;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      background: ${brand};
    }
    .profile-img.placeholder {
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 2.5rem;
      font-weight: 700;
    }
    h1 { font-size: 2rem; margin-top: 1rem; }
    .meta { color: #666; font-size: 0.95rem; margin-top: 0.25rem; }
    .followers { color: ${brand}; font-weight: 700; }
    .badge {
      display: inline-block;
      background: ${brand}20;
      color: ${brand};
      padding: 0.25rem 0.75rem;
      border-radius: 999px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 0.5rem;
      text-transform: capitalize;
    }
    main { max-width: 800px; margin: 2rem auto; padding: 0 1.5rem 3rem; }
    .about {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 2rem;
    }
    .about h2 { font-size: 1.1rem; color: ${brand}; margin-bottom: 0.5rem; }
    .gallery h2 { font-size: 1.1rem; color: ${brand}; margin-bottom: 1rem; }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
      gap: 0.75rem;
    }
    .grid img {
      width: 100%;
      aspect-ratio: 1;
      object-fit: cover;
      border-radius: 8px;
    }
    .cta {
      text-align: center;
      margin-top: 2rem;
    }
    .btn {
      display: inline-block;
      background: ${brand};
      color: white;
      padding: 1rem 2.5rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.05rem;
    }
    .btn:hover { opacity: 0.9; }
    footer {
      text-align: center;
      padding: 2rem;
      color: #888;
      font-size: 0.875rem;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="hero"></div>
  <div class="profile-wrap">
    ${profile
      ? `<img class="profile-img" src="${profile}" alt="${escapeHtml(page.name)}" />`
      : `<div class="profile-img placeholder">${escapeHtml(page.name.charAt(0))}</div>`}
    <h1>${escapeHtml(page.name)}</h1>
    <p class="meta">@${escapeHtml(page.username)} · ${escapeHtml(page.category ?? "Creator")}</p>
    <p class="followers">${formatFollowers(page.followers)} followers</p>
    <span class="badge">${page.platform}</span>
  </div>
  <main>
    <div class="about">
      <h2>About</h2>
      <p>${escapeHtml(bio)}</p>
    </div>
    ${galleryHtml}
    <div class="cta">
      <a class="btn" href="${page.profileUrl}" target="_blank" rel="noopener">
        Follow on ${page.platform === "instagram" ? "Instagram" : "Facebook"}
      </a>
    </div>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(page.name)}</p>
  </footer>
</body>
</html>`;
}

function formatFollowers(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
