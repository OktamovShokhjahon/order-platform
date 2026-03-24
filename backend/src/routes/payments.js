const router = require('express').Router();
const { processPayment, getByOrder } = require('../controllers/paymentController');
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * /api/payments:
 *   post:
 *     tags: [Payments]
 *     summary: Process mock payment
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [orderId]
 *             properties:
 *               orderId: { type: string }
 *               method: { type: string, default: mock }
 *     responses:
 *       201: { description: Payment processed }
 */
router.post('/', optionalAuthMiddleware, processPayment);

/**
 * @swagger
 * /api/payments/{orderId}:
 *   get:
 *     tags: [Payments]
 *     summary: Get payment status by order
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Payment details }
 */
router.get('/:orderId', authMiddleware, getByOrder);

module.exports = router;
