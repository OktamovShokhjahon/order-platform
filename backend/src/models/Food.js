const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema(
  {
    name: {
      uz: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    description: {
      uz: { type: String, default: '' },
      ru: { type: String, default: '' },
      en: { type: String, default: '' },
    },
    price: { type: Number, required: true },
    categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    image: { type: String, default: '' },
    images: [{ type: String }],
    ingredients: [{ type: String }],
    isPopular: { type: Boolean, default: false },
  },
  { timestamps: true }
);

foodSchema.index({ 'name.uz': 'text', 'name.ru': 'text', 'name.en': 'text' });

module.exports = mongoose.model('Food', foodSchema);
