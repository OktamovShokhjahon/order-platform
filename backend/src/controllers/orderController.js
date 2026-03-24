const mongoose = require('mongoose');
const Order = require('../models/Order');

exports.create = async (req, res) => {
  try {
    const { items, totalPrice, deliveryAddress, customerName, customerPhone } = req.body;

    const order = await Order.create({
      userId: req.user ? req.user._id : null,
      items,
      totalPrice,
      deliveryAddress,
      customerName,
      customerPhone,
    });

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const { status, search, userId, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role !== 'admin') {
      filter.userId = req.user._id;
    }
    if (status) filter.status = status;
    if (req.user.role === 'admin' && userId && mongoose.Types.ObjectId.isValid(userId)) {
      filter.userId = userId;
    }
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$or = [
        { customerName: searchRegex },
        { customerPhone: searchRegex },
        { deliveryAddress: searchRegex },
      ];

      if (mongoose.Types.ObjectId.isValid(search)) {
        filter.$or.push({ _id: new mongoose.Types.ObjectId(search) });
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.foodId', 'name image price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({ orders, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('items.foodId', 'name image price')
      .populate('userId', 'name email phone');

    if (!order) return res.status(404).json({ error: 'Order not found' });

    if (req.user.role !== 'admin' && order.userId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'preparing', 'delivering', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
