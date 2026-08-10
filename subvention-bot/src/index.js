import TelegramBot from 'node-telegram-bot-api';
import cron from 'node-cron';
import { config } from './config.js';
import { getLastRun, countOpportunities, setSetting, getSetting, getRunCount } from './db.js';
import { runSearch } from './search.js';
import { sendDigest } from './notifier.js';

let bot;
let searchRunning = false;

function getChatId() {
  return config.chatId || getSetting('chat_id');
}

function rememberChatId(chatId) {
  setSetting('chat_id', String(chatId));
  config.chatId = String(chatId);
}

export function createBot() {
  if (!config.telegramToken) {
    throw new Error('TELEGRAM_BOT_TOKEN is required. Copy .env.example to .env and set your token.');
  }

  bot = new TelegramBot(config.telegramToken, { polling: true });
  registerCommands();
  return bot;
}

function registerCommands() {
  bot.onText(/\/start/, async (msg) => {
    rememberChatId(msg.chat.id);
    await bot.sendMessage(
      msg.chat.id,
      [
        '👋 <b>Bot Subventions Tunisie</b>',
        '',
        'Je surveille chaque jour les opportunités de financement pour :',
        '• <b>Projets IT / numérique / startup</b>',
        '• <b>Textile / broderie / artisanat</b>',
        '',
        '<b>Commandes</b>',
        '/search — lancer une recherche maintenant',
        '/status — dernière exécution',
        '/help — aide',
        '',
        `Recherche automatique : tous les jours à 08:00 (${config.timezone}).`,
      ].join('\n'),
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/help/, async (msg) => {
    await bot.sendMessage(
      msg.chat.id,
      [
        '<b>Sources surveillées</b>',
        '• financini.org.tn (TIC, Innovation, Artisanat, Industrie)',
        '• startup.gov.tn (AIR, AIR², DEAL…)',
        '• openculture.gov.tn (données subventions)',
        '',
        'Le bot compare avec la base locale et n\'envoie que les nouveautés.',
        'Première exécution : tout est marqué comme connu (pas de spam).',
      ].join('\n'),
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/status/, async (msg) => {
    const last = getLastRun();
    const total = countOpportunities();
    const chatId = getChatId();

    if (!last) {
      await bot.sendMessage(msg.chat.id, 'Aucune recherche effectuée pour l\'instant. Envoyez /search.');
      return;
    }

    await bot.sendMessage(
      msg.chat.id,
      [
        '<b>Statut</b>',
        `Dernière recherche : ${new Date(last.ran_at).toLocaleString('fr-TN', { timeZone: config.timezone })}`,
        `Trouvées : ${last.total_found}`,
        `Nouvelles : ${last.new_count}`,
        `Mises à jour : ${last.updated_count}`,
        `Durée : ${(last.duration_ms / 1000).toFixed(1)}s`,
        `Total en base : ${total}`,
        `Chat configuré : ${chatId ? 'oui' : 'non'}`,
      ].join('\n'),
      { parse_mode: 'HTML' }
    );
  });

  bot.onText(/\/search/, async (msg) => {
    rememberChatId(msg.chat.id);
    await executeSearch(msg.chat.id, { notifyAlways: false, triggeredBy: 'manual' });
  });

  bot.on('message', (msg) => {
    if (msg.text?.startsWith('/')) return;
    rememberChatId(msg.chat.id);
  });
}

export async function executeSearch(chatId, { notifyAlways = false, triggeredBy = 'cron' } = {}) {
  if (searchRunning) {
    if (chatId) {
      await bot.sendMessage(chatId, '⏳ Recherche déjà en cours…');
    }
    return null;
  }

  searchRunning = true;

  if (chatId && triggeredBy === 'manual') {
    await bot.sendMessage(chatId, '🔍 Recherche en cours (IT + Textile/Broderie)…');
  }

  try {
    const result = await runSearch({ verbose: true });
    const hasChanges = result.new.length > 0 || result.updated.length > 0;
    const isFirstRun = getRunCount() <= 1;

    if (chatId && triggeredBy === 'manual') {
      if (isFirstRun && result.new.length > 0) {
        await bot.sendMessage(
          chatId,
          [
            `✅ <b>Baseline enregistrée</b>`,
            `${result.totalFound} opportunités suivies (IT + Textile/Broderie).`,
            `Vous recevrez une notification uniquement pour les nouveautés.`,
            '',
            `Envoyez /search à nouveau pour forcer un résumé complet.`,
          ].join('\n'),
          { parse_mode: 'HTML' }
        );
      } else {
        await sendDigest(bot, chatId, result);
      }
    } else if (chatId && triggeredBy === 'cron' && hasChanges && !isFirstRun) {
      await sendDigest(bot, chatId, result);
    } else if (chatId && triggeredBy === 'cron' && !hasChanges) {
      console.log(`[${new Date().toISOString()}] No changes (${result.totalFound} tracked).`);
    }

    return result;
  } catch (error) {
    console.error('Search failed:', error);
    if (chatId) {
      await bot.sendMessage(chatId, `❌ Erreur: ${error.message}`);
    }
    return null;
  } finally {
    searchRunning = false;
  }
}

export function scheduleDailySearch() {
  if (!cron.validate(config.cronSchedule)) {
    throw new Error(`Invalid CRON_SCHEDULE: ${config.cronSchedule}`);
  }

  cron.schedule(
    config.cronSchedule,
    async () => {
      const chatId = getChatId();
      if (!chatId) {
        console.warn('Skipping scheduled search: no TELEGRAM_CHAT_ID. Send /start to the bot first.');
        return;
      }
      await executeSearch(chatId, { triggeredBy: 'cron' });
    },
    { timezone: config.timezone }
  );

  console.log(`Scheduled daily search: "${config.cronSchedule}" (${config.timezone})`);
}

export function getBot() {
  return bot;
}
