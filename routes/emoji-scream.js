const express = require('express');
const router = express.Router();
const emojiScreamRouter = require('../controllers/emoji-scream-controller');

router.get('/', emojiScreamRouter.initPage);

module.exports = router;