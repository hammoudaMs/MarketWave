import type { Business } from "./types";

export function buildSiteHtml(business: Business): string {
  const phone = business.phone ?? "";
  const category = business.category ?? "Local Business";
  const mapsLink = business.mapsUrl ?? `https://www.google.com/maps/search/?api=1&query=${business.lat},${business.lng}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(business.name)}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      color: #1a1a2e;
      line-height: 1.6;
    }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 4rem 1.5rem;
      text-align: center;
    }
    header h1 { font-size: 2.5rem; margin-bottom: 0.5rem; }
    header p { opacity: 0.9; font-size: 1.1rem; }
    main { max-width: 720px; margin: 0 auto; padding: 3rem 1.5rem; }
    .card {
      background: #f8f9fa;
      border-radius: 12px;
      padding: 2rem;
      margin-bottom: 1.5rem;
    }
    .card h2 { font-size: 1.25rem; margin-bottom: 0.75rem; color: #667eea; }
    .btn {
      display: inline-block;
      background: #667eea;
      color: white;
      padding: 0.875rem 2rem;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      margin-top: 1rem;
    }
    .btn:hover { background: #5a6fd6; }
    footer {
      text-align: center;
      padding: 2rem;
      color: #888;
      font-size: 0.875rem;
    }
    .rating { color: #f59e0b; font-weight: 600; }
  </style>
</head>
<body>
  <header>
    <h1>${escapeHtml(business.name)}</h1>
    <p>${escapeHtml(category)}</p>
  </header>
  <main>
    <div class="card">
      <h2>About Us</h2>
      <p>Welcome to ${escapeHtml(business.name)}! We are a trusted local business serving our community with quality service and care.</p>
      ${business.rating ? `<p class="rating">★ ${business.rating.toFixed(1)}${business.reviewCount ? ` (${business.reviewCount} reviews)` : ""}</p>` : ""}
    </div>
    <div class="card">
      <h2>Visit Us</h2>
      <p>${escapeHtml(business.address)}</p>
      ${phone ? `<p><a href="tel:${phone.replace(/\s/g, "")}">${escapeHtml(phone)}</a></p>` : ""}
      <a class="btn" href="${mapsLink}" target="_blank" rel="noopener">Get Directions</a>
    </div>
    <div class="card">
      <h2>Contact</h2>
      <p>We would love to hear from you. Reach out today!</p>
      ${phone ? `<a class="btn" href="tel:${phone.replace(/\s/g, "")}">Call Now</a>` : ""}
    </div>
  </main>
  <footer>
    <p>&copy; ${new Date().getFullYear()} ${escapeHtml(business.name)}. All rights reserved.</p>
  </footer>
</body>
</html>`;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
