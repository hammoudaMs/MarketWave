import crypto from 'crypto';
import axios from 'axios';
import { config } from './config.js';

export function createHttpClient() {
  return axios.create({
    timeout: config.requestTimeoutMs,
    headers: {
      'User-Agent': config.userAgent,
      Accept: 'text/html,application/json',
    },
    maxRedirects: 5,
    validateStatus: (status) => status >= 200 && status < 400,
  });
}

export function stableId(...parts) {
  const raw = parts.filter(Boolean).join('|');
  return crypto.createHash('sha256').update(raw).digest('hex').slice(0, 16);
}

export function contentHash(record) {
  const payload = [
    record.title,
    record.url,
    record.summary,
    record.amount_min,
    record.amount_max,
    record.deadline,
    record.status,
    record.type,
  ].join('|');
  return crypto.createHash('sha256').update(payload).digest('hex');
}

export function parseAmountRange(text) {
  if (!text) return { min: null, max: null };
  const numbers = [...text.replace(/\s/g, '').matchAll(/(\d[\d.,]*)/g)].map((m) =>
    parseFloat(m[1].replace(/\./g, '').replace(',', '.'))
  );
  if (numbers.length === 0) return { min: null, max: null };
  if (numbers.length === 1) return { min: numbers[0], max: numbers[0] };
  return { min: Math.min(...numbers), max: Math.max(...numbers) };
}

export function truncate(text, max = 280) {
  if (!text) return '';
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}

export function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
