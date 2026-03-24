const router = require('express').Router();
const { getAll, getById, create, update, remove } = require('../controllers/categoryController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

/**
 * @swagger
 * /api/categories:
 *   get:
 *     tags: [Categories]
 *     summary: Get all categories
 *     responses:
 *       200: { description: List of categories }
 */
router.get('/', getAll);

/**
 * @swagger
 * /api/categories/{id}:
 *   get:
 *     tags: [Categories]
 *     summary: Get category by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category details }
 *       404: { description: Not found }
 */
router.get('/:id', getById);

/**
 * @swagger
 * /api/categories:
 *   post:
 *     tags: [Categories]
 *     summary: Create category (admin)
 *     security: [{ bearerAuth: [] }]
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               image: { type: string, format: binary }
 *     responses:
 *       201: { description: Category created }
 */
router.post('/', authMiddleware, adminMiddleware, upload.single('image'), create);

/**
 * @swagger
 * /api/categories/{id}:
 *   put:
 *     tags: [Categories]
 *     summary: Update category (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category updated }
 */
router.put('/:id', authMiddleware, adminMiddleware, upload.single('image'), update);

/**
 * @swagger
 * /api/categories/{id}:
 *   delete:
 *     tags: [Categories]
 *     summary: Delete category (admin)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200: { description: Category deleted }
 */
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
