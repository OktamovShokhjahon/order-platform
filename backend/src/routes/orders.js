const router = require('express').Router();
const { create, getAll, getById, updateStatus } = require('../controllers/orderController');
const { authMiddleware, optionalAuthMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * /api/orders:
 *   post:
 *     tags: [Orders]
 *     summary: Create a new order
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [items, totalPrice, deliveryAddress, customerName, customerPhone]
 *             properties:
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     foodId: { type: string }
 *                     quantity: { type: integer }
 *                     price: { type: number }
 *               totalPrice: { type: number }
 *               deliveryAddress: { type: string }
 *               customerName: { type: string }
 *               customerPhone: { type: string }
 *     responses:
 *       201: { description: Order created }
 */
router.post('/', optionalAuthMiddleware, create);

/**
 * @swagger
 * /api/orders:
 *   get:
 *     tags: [Orders]
 *     summary: Get orders (admin sees all, user sees own)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of orders }
 */
router.get('/', authMiddleware, getAll);

/**
 * @swagger
 * /api/orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get order details
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order details }
 */
router.get('/:id', authMiddleware, getById);

/**
 * @swagger
 * /api/orders/{id}/status:
 *   put:
 *     tags: [Orders]
 *     summary: Update order status (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Order status updated }
 */
router.put('/:id/status', authMiddleware, adminMiddleware, updateStatus);

module.exports = router;
