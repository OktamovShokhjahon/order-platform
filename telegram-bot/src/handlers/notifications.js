const ADMIN_CHAT_ID = process.env.ADMIN_CHAT_ID;

const notifyAdminNewOrder = (bot, order) => {
  if (!ADMIN_CHAT_ID) return;

  const itemsList = order.items
    .map((item, i) => `  ${i + 1}. x${item.quantity} - ${item.price.toLocaleString()} so'm`)
    .join('\n');

  const message =
    `🆕 *Yangi buyurtma!*\n\n` +
    `📝 Buyurtma ID: \`${order._id}\`\n` +
    `👤 Mijoz: ${order.customerName}\n` +
    `📱 Telefon: ${order.customerPhone}\n` +
    `📍 Manzil: ${order.deliveryAddress}\n\n` +
    `🛒 *Taomlar:*\n${itemsList}\n\n` +
    `💰 *Jami: ${order.totalPrice.toLocaleString()} so'm*`;

  bot.sendMessage(ADMIN_CHAT_ID, message, { parse_mode: 'Markdown' });
};

const notifyUserOrderStatus = (bot, chatId, order) => {
  const statusEmoji = {
    pending: '⏳',
    preparing: '👨‍🍳',
    delivering: '🚗',
    delivered: '✅',
    cancelled: '❌',
  };

  const emoji = statusEmoji[order.status] || '📦';
  const statusText = {
    pending: 'QABUL QILINDI',
    preparing: 'TAYYORLANMOQDA',
    delivering: 'YETKAZILMOQDA',
    delivered: 'YETKAZILDI',
    cancelled: 'BEKOR QILINDI',
  };

  const message =
    `${emoji} *Buyurtma holati yangilandi*\n\n` +
    `Buyurtma \`${order._id.slice(-6)}\` holati: *${statusText[order.status] || order.status.toUpperCase()}*`;

  bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
};

module.exports = { notifyAdminNewOrder, notifyUserOrderStatus };
