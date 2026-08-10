import { sectors } from './config.js';

function normalize(text) {
  return (text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function matchesCategory(record, categoryKey) {
  if (record.category === categoryKey) return true;

  const keywords = sectors[categoryKey]?.keywords ?? [];
  const haystack = normalize(
    [record.title, record.summary, record.type, ...(record.sectors || [])].join(' ')
  );

  return keywords.some((kw) => haystack.includes(normalize(kw)));
}

export function filterOpportunities(records) {
  return records.filter(
    (record) => matchesCategory(record, 'it') || matchesCategory(record, 'textile')
  );
}

export function categoryLabel(record) {
  const labels = [];
  if (matchesCategory(record, 'it')) labels.push(sectors.it.label);
  if (matchesCategory(record, 'textile')) labels.push(sectors.textile.label);
  return labels.join(' · ') || 'Autre';
}
