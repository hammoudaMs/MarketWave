import { startupPrograms } from '../config.js';
import { stableId } from '../utils.js';

export async function fetchStartupPrograms() {
  return startupPrograms.map((program) => ({
    id: stableId('startup', program.url),
    title: program.title,
    url: program.url,
    source: 'startup.gov.tn',
    category: program.category,
    type: program.type,
    summary: program.summary,
    amount_min: null,
    amount_max: null,
    currency: 'TND',
    deadline: null,
    status: program.status,
  }));
}
