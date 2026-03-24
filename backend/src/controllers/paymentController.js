const Payment = require('../models/Payment');
const Order = require('../models/Order');

exports.processPayment = async (req, res) => {
  try {
    const { orderId, method = 'mock' } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });

    // Mock payment: always succeeds after a brief delay
    const payment = await Payment.create({
      orderId,
      method,
      amount: order.totalPrice,
      status: 'success',
    });

    await Order.findByIdAndUpdate(orderId, { paymentStatus: 'paid' });

    res.status(201).json({ payment, message: 'Payment processed successfully (mock)' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getByOrder = async (req, res) => {
  try {
    const payment = await Payment.findOne({ orderId: req.params.orderId });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });
    res.json(payment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
