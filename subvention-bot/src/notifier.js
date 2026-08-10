import { categoryLabel } from './matcher.js';

function escapeHtml(text) {
  return (text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function formatAmount(record) {
  if (record.amount_min && record.amount_max && record.amount_min !== record.amount_max) {
    return `${record.amount_min.toLocaleString('fr-TN')} – ${record.amount_max.toLocaleString('fr-TN')} ${record.currency || 'TND'}`;
  }
  if (record.amount_max) {
    return `jusqu'à ${record.amount_max.toLocaleString('fr-TN')} ${record.currency || 'TND'}`;
  }
  if (record.amount_min) {
    return `à partir de ${record.amount_min.toLocaleString('fr-TN')} ${record.currency || 'TND'}`;
  }
  return null;
}

export function formatOpportunity(record) {
  const lines = [
    `<b>${escapeHtml(record.title)}</b>`,
    `🏷 ${escapeHtml(categoryLabel(record))}`,
    `📌 ${escapeHtml(record.source)}`,
  ];

  const amount = formatAmount(record);
  if (amount) lines.push(`💰 ${escapeHtml(amount)}`);

  if (record.type) lines.push(`📋 ${escapeHtml(record.type)}`);

  if (record.summary) lines.push(`\n${escapeHtml(record.summary)}`);

  lines.push(`\n<a href="${record.url}">Voir les détails</a>`);

  return lines.join('\n');
}

export function formatDigest({ newItems, updatedItems, totalFound, durationMs }) {
  const parts = [];

  if (newItems.length === 0 && updatedItems.length === 0) {
    parts.push('✅ <b>Aucune nouveauté</b> depuis la dernière recherche.');
    parts.push(`\n${totalFound} opportunités suivies (IT + Textile/Broderie).`);
    parts.push(`Durée: ${(durationMs / 1000).toFixed(1)}s`);
    return parts.join('\n');
  }

  parts.push(`🔔 <b>Mise à jour subventions Tunisie</b>`);
  parts.push(`${newItems.length} nouvelle(s) · ${updatedItems.length} mise(s) à jour\n`);

  for (const item of newItems.slice(0, 8)) {
    parts.push(formatOpportunity(item));
    parts.push('');
  }

  if (newItems.length > 8) {
    parts.push(`… et ${newItems.length - 8} autre(s). Envoyez /search pour tout revoir.`);
  }

  for (const item of updatedItems.slice(0, 3)) {
    parts.push('♻️ <b>Mis à jour:</b>');
    parts.push(formatOpportunity(item));
    parts.push('');
  }

  return parts.join('\n').trim();
}

export async function sendDigest(bot, chatId, result) {
  const message = formatDigest({
    newItems: result.new,
    updatedItems: result.updated,
    totalFound: result.totalFound,
    durationMs: result.durationMs,
  });

  const chunks = splitMessage(message, 4000);

  for (const chunk of chunks) {
    await bot.sendMessage(chatId, chunk, {
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    });
  }
}

function splitMessage(text, maxLen) {
  if (text.length <= maxLen) return [text];

  const chunks = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      chunks.push(remaining);
      break;
    }

    let splitAt = remaining.lastIndexOf('\n\n', maxLen);
    if (splitAt < maxLen * 0.5) splitAt = maxLen;
    chunks.push(remaining.slice(0, splitAt));
    remaining = remaining.slice(splitAt).trimStart();
  }

  return chunks;
}
