const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/foodController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @swagger
 * /api/foods:
 *   get:
 *     tags: [Foods]
 *     summary: Get all foods (with filters)
 *     parameters:
 *       - in: query
 *         name: category
 *         schema: { type: string }
 *         description: Filter by category ID
 *       - in: query
 *         name: search
 *         schema: { type: string }
 *         description: Search by name
 *       - in: query
 *         name: popular
 *         schema: { type: string }
 *         description: Filter popular items
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 20 }
 *     responses:
 *       200: { description: Paginated list of foods }
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/foods/{id}:
 *   get:
 *     tags: [Foods]
 *     summary: Get food by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Food details }
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/foods:
 *   post:
 *     tags: [Foods]
 *     summary: Create food item (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       201: { description: Food created }
 */
router.post(
  '/',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 1 },
  ]),
  create
);

/**
 * @swagger
 * /api/foods/{id}:
 *   put:
 *     tags: [Foods]
 *     summary: Update food item (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Food updated }
 */
router.put(
  '/:id',
  authMiddleware,
  adminMiddleware,
  upload.fields([
    { name: 'images', maxCount: 10 },
    { name: 'image', maxCount: 1 },
  ]),
  update
);

/**
 * @swagger
 * /api/foods/{id}:
 *   delete:
 *     tags: [Foods]
 *     summary: Delete food item (admin)
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Food deleted }
 */
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
