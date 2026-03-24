const router = require('express').Router();
const { getAdminList, getAdminById, create, update, remove } = require('../controllers/newsController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../config/upload');

router.get('/', authMiddleware, adminMiddleware, getAdminList);
router.get('/:id', authMiddleware, adminMiddleware, getAdminById);
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
router.delete('/:id', authMiddleware, adminMiddleware, remove);

module.exports = router;
