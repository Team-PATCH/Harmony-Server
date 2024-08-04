// routes/mcRoutes.js
const express = require('express');
const mcController = require('../controllers/mcController');
const router = express.Router();

// 모든 메모리 카드 조회
router.get('/', mcController.getMemoryCards);

// 특정 메모리 카드 조회
router.get('/:memorycardId', mcController.getMemoryCardById);

// 메모리 카드 생성
router.post('/', mcController.upload.single('image'), mcController.createMemoryCard);



module.exports = router;