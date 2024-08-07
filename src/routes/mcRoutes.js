// routes/mcRoutes.js
const express = require('express');
const mcController = require('../controllers/mcController');
const router = express.Router();
const multer = require('multer');
const { uploadAudio } = require('../utils/uploadAudio');

// Multer 설정
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 10 * 1024 * 1024 } // 10MB 제한
});

// 모든 메모리 카드 조회
router.get('/', mcController.getMemoryCards);

// 특정 메모리 카드 조회
router.get('/:memorycardId', mcController.getMemoryCardById);

// 메모리 카드 생성
router.post('/', mcController.uploadImage.single('image'), mcController.createMemoryCard);

// 대화 기록과 오디오 파일 저장
router.post('/:mcId/chat', upload.array('audio'), mcController.saveChatHistory);

// 대화 기록 업데이트
router.patch('/:mcId/chat', upload.array('audio'), mcController.updateChatHistory);

// 대화 기록 조회
router.get('/:mcId/chat', mcController.getChatHistory);

// 대화 요약 조회
router.get('/:mcId/summary', mcController.getSummary);

// 초기 프롬프트 조회
router.get('/:mcId/initial-prompt', mcController.getInitialPrompt);

module.exports = router;