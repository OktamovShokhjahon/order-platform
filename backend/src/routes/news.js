const router = require('express').Router();
const { getPublic, getPublicById } = require('../controllers/newsController');

router.get('/', getPublic);
router.get('/:id', getPublicById);

module.exports = router;
