const News = require('../models/News');

const parseLocalized = (value, fallback = { uz: '', ru: '', en: '' }) => {
  if (!value) return fallback;
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return fallback;
    }
  }
  return value;
};

const parseBoolean = (value, defaultValue = false) => {
  if (value === undefined) return defaultValue;
  return value === true || value === 'true';
};

const getUploadedImages = (req) => {
  if (Array.isArray(req.files)) {
    return req.files.map((file) => `/uploads/${file.filename}`);
  }
  if (req.files && Array.isArray(req.files.images)) {
    return req.files.images.map((file) => `/uploads/${file.filename}`);
  }
  if (req.files && Array.isArray(req.files.image)) {
    return req.files.image.map((file) => `/uploads/${file.filename}`);
  }
  if (req.file) {
    return [`/uploads/${req.file.filename}`];
  }
  return [];
};

const buildListFilter = ({ search, category, featured, published, from, to }, publicOnly = false) => {
  const filter = {};

  if (publicOnly) {
    filter.isPublished = true;
  } else if (published !== undefined && published !== '') {
    filter.isPublished = parseBoolean(published);
  }

  if (category) {
    filter.category = category;
  }

  if (featured !== undefined && featured !== '') {
    filter.isFeatured = parseBoolean(featured);
  }

  if (search) {
    const searchRegex = new RegExp(search, 'i');
    filter.$or = [
      { 'title.uz': searchRegex },
      { 'title.ru': searchRegex },
      { 'title.en': searchRegex },
      { 'summary.uz': searchRegex },
      { 'summary.ru': searchRegex },
      { 'summary.en': searchRegex },
    ];
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) {
      const toDate = new Date(to);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  return filter;
};

exports.getPublic = async (req, res) => {
  try {
    const { page = 1, limit = 12 } = req.query;
    const filter = buildListFilter(req.query, true);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(filter)
        .sort({ isFeatured: -1, publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      News.countDocuments(filter),
    ]);

    res.json({ news, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPublicById = async (req, res) => {
  try {
    const article = await News.findOne({ _id: req.params.id, isPublished: true });
    if (!article) return res.status(404).json({ error: 'News not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminList = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const filter = buildListFilter(req.query, false);
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [news, total] = await Promise.all([
      News.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      News.countDocuments(filter),
    ]);

    res.json({ news, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAdminById = async (req, res) => {
  try {
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'News not found' });
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { title, summary, content, category, isPublished, isFeatured } = req.body;
    const images = getUploadedImages(req);
    const publishState = parseBoolean(isPublished, true);

    const article = await News.create({
      title: parseLocalized(title),
      summary: parseLocalized(summary),
      content: parseLocalized(content),
      category: category || '',
      images,
      isPublished: publishState,
      isFeatured: parseBoolean(isFeatured),
      publishedAt: publishState ? new Date() : null,
    });

    res.status(201).json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { title, summary, content, category, isPublished, isFeatured } = req.body;
    const article = await News.findById(req.params.id);
    if (!article) return res.status(404).json({ error: 'News not found' });

    if (title !== undefined) article.title = parseLocalized(title, article.title);
    if (summary !== undefined) article.summary = parseLocalized(summary, article.summary);
    if (content !== undefined) article.content = parseLocalized(content, article.content);
    if (category !== undefined) article.category = category;
    if (isFeatured !== undefined) article.isFeatured = parseBoolean(isFeatured, article.isFeatured);
    if (isPublished !== undefined) {
      const nextPublished = parseBoolean(isPublished, article.isPublished);
      article.isPublished = nextPublished;
      article.publishedAt = nextPublished ? article.publishedAt || new Date() : null;
    }

    const uploadedImages = getUploadedImages(req);
    if (uploadedImages.length > 0) {
      article.images = uploadedImages;
    }

    await article.save();
    res.json(article);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const article = await News.findByIdAndDelete(req.params.id);
    if (!article) return res.status(404).json({ error: 'News not found' });
    res.json({ message: 'News deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
