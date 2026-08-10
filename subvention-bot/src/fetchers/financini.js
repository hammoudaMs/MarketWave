import * as cheerio from 'cheerio';
import { financiniSectors } from '../config.js';
import { createHttpClient, stableId, parseAmountRange, truncate, delay } from '../utils.js';

const BASE = 'https://www.financini.org.tn';

export async function fetchFinancini() {
  const http = createHttpClient();
  const results = [];

  for (const sector of financiniSectors) {
    const listUrl = `${BASE}/mecanismList.php?idActivitySector=${sector.id}`;
    let html;

    try {
      const { data } = await http.get(listUrl);
      html = data;
    } catch (error) {
      console.error(`Financini sector ${sector.id} failed:`, error.message);
      continue;
    }

    const $ = cheerio.load(html);
    const links = [];

    $('h3 a[href*="mecanisme-de-financement"]').each((_, el) => {
      const href = $(el).attr('href');
      const title = $(el).text().trim();
      if (href && title) {
        links.push({ href, title });
      }
    });

    for (const link of links) {
      const url = link.href.startsWith('http') ? link.href : `${BASE}/${link.href}`;
      let summary = '';
      let amountMin = null;
      let amountMax = null;
      let fundingType = null;
      let sectors = [];

      try {
        await delay(400);
        const { data: detailHtml } = await http.get(url);
        const detail = cheerio.load(detailHtml);

        summary = truncate(
          detail('.section-title p').first().text() ||
            detail('.vendor-content-wrapper p').first().text()
        );

        detail('.count-name').each((_, el) => {
          const label = detail(el).text().trim().toLowerCase();
          const value = detail(el).prev('.count-numbers').text().trim();
          if (label.includes('minimum')) {
            amountMin = parseAmountRange(value).min;
          }
          if (label.includes('maximum')) {
            amountMax = parseAmountRange(value).max;
          }
        });

        detail('.heading-btm-line').each((_, el) => {
          const heading = detail(el).text().trim().toLowerCase();
          const row = detail(el).closest('.row');
          const tags = row
            .find('.widget-tags a')
            .map((__, tag) => detail(tag).text().trim())
            .get();

          if (heading.includes('mode de financement') && tags.length) {
            fundingType = tags.join(', ');
          }
          if (heading.includes("secteurs d'activité") && tags.length) {
            sectors = tags;
          }
        });
      } catch (error) {
        console.error(`Financini detail ${url} failed:`, error.message);
      }

      results.push({
        id: stableId('financini', url),
        title: link.title,
        url,
        source: `financini (${sector.label})`,
        category: sector.category,
        type: fundingType || 'financement',
        summary: summary || `Mécanisme de financement — secteur ${sector.label}`,
        amount_min: amountMin,
        amount_max: amountMax,
        currency: 'TND',
        deadline: null,
        status: 'open',
        sectors,
      });
    }
  }

  return results;
}
