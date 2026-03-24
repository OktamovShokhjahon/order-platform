const Order = require('../models/Order');

exports.getDeliveringOrders = async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query;
    const filter = { status: 'delivering' };
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('items.foodId', 'name image price')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Order.countDocuments(filter),
    ]);

    res.json({
      orders,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateDeliveringStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['delivered', 'cancelled'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Driver can only set delivered or cancelled status' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    if (order.status !== 'delivering') {
      return res.status(400).json({ error: 'Only delivering orders can be updated by driver' });
    }

    order.status = status;
    await order.save();

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
