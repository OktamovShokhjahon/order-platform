const Food = require('../models/Food');

const normalizeFood = (foodDoc) => {
  const food = typeof foodDoc.toObject === 'function' ? foodDoc.toObject() : foodDoc;
  const images = Array.isArray(food.images) ? food.images.filter(Boolean) : [];
  const normalizedImages = images.length > 0 ? images : food.image ? [food.image] : [];

  return {
    ...food,
    image: food.image || normalizedImages[0] || '',
    images: normalizedImages,
  };
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

exports.getAll = async (req, res) => {
  try {
    const { category, search, popular, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (category) filter.categoryId = category;
    if (popular === 'true') filter.isPopular = true;
    if (search) {
      filter.$or = [
        { 'name.uz': { $regex: search, $options: 'i' } },
        { 'name.ru': { $regex: search, $options: 'i' } },
        { 'name.en': { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [foods, total] = await Promise.all([
      Food.find(filter).populate('categoryId', 'name').sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Food.countDocuments(filter),
    ]);

    res.json({
      foods: foods.map(normalizeFood),
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id).populate('categoryId', 'name');
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(normalizeFood(food));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, price, categoryId, ingredients, isPopular } = req.body;
    const uploadedImages = getUploadedImages(req);
    const food = await Food.create({
      name: typeof name === 'string' ? JSON.parse(name) : name,
      description: typeof description === 'string' ? JSON.parse(description) : description,
      price: parseFloat(price),
      categoryId,
      ingredients: typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients || [],
      isPopular: isPopular === 'true' || isPopular === true,
      image: uploadedImages[0] || '',
      images: uploadedImages,
    });
    res.status(201).json(normalizeFood(food));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { name, description, price, categoryId, ingredients, isPopular } = req.body;
    const updateData = {};
    const uploadedImages = getUploadedImages(req);

    if (name) updateData.name = typeof name === 'string' ? JSON.parse(name) : name;
    if (description) updateData.description = typeof description === 'string' ? JSON.parse(description) : description;
    if (price) updateData.price = parseFloat(price);
    if (categoryId) updateData.categoryId = categoryId;
    if (ingredients) updateData.ingredients = typeof ingredients === 'string' ? JSON.parse(ingredients) : ingredients;
    if (isPopular !== undefined) updateData.isPopular = isPopular === 'true' || isPopular === true;
    if (uploadedImages.length > 0) {
      updateData.image = uploadedImages[0];
      updateData.images = uploadedImages;
    }

    const food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json(normalizeFood(food));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) return res.status(404).json({ error: 'Food not found' });
    res.json({ message: 'Food deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
