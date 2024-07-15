// routes/mcRoutes.js
const express = require('express');
const mcController = require('../controllers/mcController');
const router = express.Router();

router.get('/', mcController.getMemoryCards);
router.get('/:memorycardId', mcController.getMemoryCardById);


module.exports = router;