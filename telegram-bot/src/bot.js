require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const token = process.env.BOT_TOKEN;

if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
  console.log('⚠️  Please set your BOT_TOKEN in telegram-bot/.env');
  console.log('   Get a token from @BotFather on Telegram');
  process.exit(0);
}

const bot = new TelegramBot(token, { polling: true });

console.log('🤖 Telegram bot is running...');

require('./handlers/start')(bot);
require('./handlers/callbacks')(bot);

bot.on('polling_error', (error) => {
  console.error('Polling error:', error.code);
});

module.exports = bot;
