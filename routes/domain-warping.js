const express = require('express');
const router = express.Router();
const domainWarpingRouter = require('../controllers/domain-warping-controller');

router.get('/', domainWarpingRouter.initPage);

module.exports = router;