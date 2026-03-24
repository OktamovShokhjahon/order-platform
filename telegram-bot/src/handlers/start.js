const WEBAPP_URL = process.env.WEBAPP_URL || 'http://localhost:3000';

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const name = msg.from.first_name || 'foydalanuvchi';

    const welcomeMessage =
      `👋 Assalomu alaykum, ${name}!\n\n` +
      `🍔 *FoodOrder* botiga xush kelibsiz!\n\n` +
      `Bu yerda menyuni ko'rishingiz, buyurtma berishingiz va yetkazib berishni kuzatishingiz mumkin.\n\n` +
      `Boshlash uchun quyidagi tugmalardan birini tanlang:`;

    bot.sendMessage(chatId, welcomeMessage, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            {
              text: '🍽️ Menyuni ochish',
              web_app: { url: WEBAPP_URL },
            },
          ],
          [
            { text: '📞 Aloqa markazi', callback_data: 'support' },
          ],
          [
            { text: '📋 Kategoriyalar', callback_data: 'categories' },
          ],
        ],
      },
    });
  });

  bot.onText(/\/menu/, (msg) => {
    bot.sendMessage(msg.chat.id, '🍽️ Menyuni ochish:', {
      reply_markup: {
        inline_keyboard: [
          [{ text: '🍽️ Menyuni ochish', web_app: { url: WEBAPP_URL } }],
        ],
      },
    });
  });

  bot.onText(/\/help/, (msg) => {
    const helpText =
      `*FoodOrder bot buyruqlari:*\n\n` +
      `/start - Asosiy menyu\n` +
      `/menu - Veb menyuni ochish\n` +
      `/help - Yordam`;

    bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
  });
};
