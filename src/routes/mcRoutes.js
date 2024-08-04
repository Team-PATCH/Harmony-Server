// routes/mcRoutes.js
const express = require('express');
const mcController = require('../controllers/mcController');
const router = express.Router();
const upload = require('../utils/uploadAudio');

// 모든 메모리 카드 조회
router.get('/', mcController.getMemoryCards);

// 특정 메모리 카드 조회
router.get('/:memorycardId', mcController.getMemoryCardById);

// 메모리 카드 생성
router.post('/', mcController.uploadImage.single('image'), mcController.createMemoryCard);


// 대화 기록 저장
router.post('/:mcId/chat', upload.single('audio'), mcController.saveChatHistory);

// 대화 기록 조회
router.get('/:mcId/chat', mcController.getChatHistory);

// 초기 프롬프트 조회
router.get('/:mcId/initial-prompt', mcController.getInitialPrompt);

module.exports = router;