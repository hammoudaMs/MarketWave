import { fetchFinancini } from './fetchers/financini.js';
import { fetchStartupPrograms } from './fetchers/startup.js';
import { fetchOpenCulture } from './fetchers/openculture.js';
import { filterOpportunities } from './matcher.js';
import { upsertOpportunity, logRun } from './db.js';
import { contentHash } from './utils.js';

export async function runSearch({ verbose = false } = {}) {
  const started = Date.now();

  if (verbose) console.log('Fetching Financini…');
  const financini = await fetchFinancini();

  if (verbose) console.log('Fetching Startup Tunisia programs…');
  const startup = await fetchStartupPrograms();

  if (verbose) console.log('Fetching Open Culture datasets…');
  const openCulture = await fetchOpenCulture();

  const all = filterOpportunities([...financini, ...startup, ...openCulture]);

  const changes = { new: [], updated: [], unchanged: 0 };

  for (const record of all) {
    const result = upsertOpportunity({
      ...record,
      content_hash: contentHash(record),
    });

    if (result.change === 'new') changes.new.push(result.record);
    else if (result.change === 'updated') changes.updated.push(result.record);
    else changes.unchanged += 1;
  }

  const durationMs = Date.now() - started;

  logRun({
    totalFound: all.length,
    newCount: changes.new.length,
    updatedCount: changes.updated.length,
    durationMs,
  });

  return {
    totalFound: all.length,
    durationMs,
    ...changes,
  };
}
