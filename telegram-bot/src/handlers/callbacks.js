const { getCategories, getFoods } = require('../services/api');

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    bot.answerCallbackQuery(query.id);

    if (data === 'support') {
      bot.sendMessage(
        chatId,
        '📞 *Aloqa markazi*\n\n' +
        '📱 Telefon: +998 90 123 45 67\n' +
        '📧 Email: support@foodorder.uz\n' +
        '⏰ Ish vaqti: 9:00 - 23:00',
        { parse_mode: 'Markdown' }
      );
    }

    if (data === 'categories') {
      try {
        const res = await getCategories();
        const categories = res.data;

        if (categories.length === 0) {
          bot.sendMessage(chatId, 'Hozircha kategoriyalar mavjud emas.');
          return;
        }

        const buttons = categories.map((cat) => [
          { text: cat.name.uz || cat.name.en, callback_data: `cat_${cat._id}` },
        ]);

        bot.sendMessage(chatId, '📋 *Taom kategoriyalari:*', {
          parse_mode: 'Markdown',
          reply_markup: { inline_keyboard: buttons },
        });
      } catch (err) {
        bot.sendMessage(chatId, '❌ Kategoriyalarni yuklab bo\'lmadi. Iltimos, qayta urinib ko\'ring.');
      }
    }

    if (data?.startsWith('cat_')) {
      const categoryId = data.replace('cat_', '');
      try {
        const res = await getFoods({ category: categoryId, limit: '10' });
        const foods = res.data.foods;

        if (foods.length === 0) {
          bot.sendMessage(chatId, 'Bu kategoriyada taomlar topilmadi.');
          return;
        }

        let text = '🍽️ *Kategoriyadagi taomlar:*\n\n';
        foods.forEach((food, i) => {
          const foodName = food.name?.uz || food.name?.en || 'Taom';
          text += `${i + 1}. *${foodName}*\n`;
          text += `   💰 ${food.price.toLocaleString()} so'm\n\n`;
        });
        text += '_Buyurtma berish uchun veb ilovani oching!_';

        bot.sendMessage(chatId, text, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [
              [{ text: '🍽️ Hozir buyurtma berish', web_app: { url: process.env.WEBAPP_URL } }],
              [{ text: '◀️ Kategoriyalarga qaytish', callback_data: 'categories' }],
            ],
          },
        });
      } catch (err) {
        bot.sendMessage(chatId, '❌ Taomlarni yuklab bo\'lmadi. Iltimos, qayta urinib ko\'ring.');
      }
    }
  });
};
