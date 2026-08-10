import { createHttpClient, stableId, truncate } from '../utils.js';

const API = 'http://www.openculture.gov.tn/api/3/action/package_search';

const QUERIES = [
  { q: 'subvention informatique OR tic OR digital OR innovation', category: 'it' },
  { q: 'subvention artisanat OR textile OR broderie OR artisanat', category: 'textile' },
  { q: 'subvention arts plastiques OR patrimoine', category: 'textile' },
];

export async function fetchOpenCulture() {
  const http = createHttpClient();
  const results = [];
  const seen = new Set();

  for (const query of QUERIES) {
    try {
      const { data } = await http.get(API, {
        params: { q: query.q, rows: 20, sort: 'metadata_modified desc' },
      });

      const packages = data?.result?.results ?? [];

      for (const pkg of packages) {
        const url =
          pkg.extras?.find((e) => e.key === 'URL')?.value ||
          `http://www.openculture.gov.tn/fr/dataset/${pkg.name}`;

        const id = stableId('openculture', pkg.id || pkg.name);
        if (seen.has(id)) continue;
        seen.add(id);

        results.push({
          id,
          title: pkg.title || pkg.name,
          url,
          source: 'openculture.gov.tn',
          category: query.category,
          type: 'données ouvertes',
          summary: truncate(pkg.notes?.replace(/<[^>]+>/g, ' ') || ''),
          amount_min: null,
          amount_max: null,
          currency: 'TND',
          deadline: null,
          status: 'reference',
        });
      }
    } catch (error) {
      console.error(`OpenCulture query "${query.q}" failed:`, error.message);
    }
  }

  return results;
}
