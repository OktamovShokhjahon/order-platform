const router = require('express').Router();
const { getDeliveringOrders, updateDeliveringStatus } = require('../controllers/driverController');
const { authMiddleware, driverOrAdminMiddleware } = require('../middleware/auth');

router.get('/orders', authMiddleware, driverOrAdminMiddleware, getDeliveringOrders);
router.put('/orders/:id/status', authMiddleware, driverOrAdminMiddleware, updateDeliveringStatus);

module.exports = router;
