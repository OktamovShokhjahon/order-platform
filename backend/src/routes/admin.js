const router = require('express').Router();
const {
  getDashboard,
  getStatistics,
  getUsers,
  updateUserRole,
  getUserDetails,
} = require('../controllers/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

/**
 * @swagger
 * /api/admin/dashboard:
 *   get:
 *     tags: [Admin]
 *     summary: Get admin dashboard statistics
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: Dashboard statistics }
 */
router.get('/dashboard', authMiddleware, adminMiddleware, getDashboard);

/**
 * @swagger
 * /api/admin/statistics:
 *   get:
 *     tags: [Admin]
 *     summary: Sales statistics (time range, food breakdown, chart series)
 *     security: [{ bearerAuth: [] }]
 *     parameters:
 *       - in: query
 *         name: period
 *         schema: { type: string, enum: [daily, weekly, monthly, range] }
 *       - in: query
 *         name: from
 *         schema: { type: string }
 *       - in: query
 *         name: to
 *         schema: { type: string }
 *       - in: query
 *         name: locale
 *         schema: { type: string, enum: [en, ru, uz] }
 *     responses:
 *       200: { description: Statistics payload }
 */
router.get('/statistics', authMiddleware, adminMiddleware, getStatistics);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     tags: [Admin]
 *     summary: Get all users
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: List of users }
 */
router.get('/users', authMiddleware, adminMiddleware, getUsers);

/**
 * @swagger
 * /api/admin/users/{id}/role:
 *   put:
 *     tags: [Admin]
 *     summary: Update user role
 *     security: [{ bearerAuth: [] }]
 *     responses:
 *       200: { description: User role updated }
 */
router.put('/users/:id/role', authMiddleware, adminMiddleware, updateUserRole);
router.get('/users/:id', authMiddleware, adminMiddleware, getUserDetails);

module.exports = router;
