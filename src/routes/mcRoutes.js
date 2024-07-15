// routes/mcRoutes.js
const express = require('express');
const mcController = require('../controllers/mcController');
const router = express.Router();

router.get('/', mcController.getMemoryCards);

module.exports = router;