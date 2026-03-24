const mongoose = require('mongoose');

const localizedStringSchema = new mongoose.Schema(
  {
    uz: { type: String, default: '' },
    ru: { type: String, default: '' },
    en: { type: String, default: '' },
  },
  { _id: false }
);

const newsSchema = new mongoose.Schema(
  {
    title: {
      uz: { type: String, required: true },
      ru: { type: String, required: true },
      en: { type: String, required: true },
    },
    summary: localizedStringSchema,
    content: localizedStringSchema,
    category: { type: String, default: '' },
    images: [{ type: String }],
    isPublished: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

newsSchema.index({
  'title.uz': 'text',
  'title.ru': 'text',
  'title.en': 'text',
  'summary.uz': 'text',
  'summary.ru': 'text',
  'summary.en': 'text',
});

module.exports = mongoose.model('News', newsSchema);
