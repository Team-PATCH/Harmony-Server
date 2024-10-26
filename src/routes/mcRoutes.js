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


/**
 * @swagger
 * tags:
 *   name: MemoryCard
 *   description: 추억카드 관리 및 대화 관련 API
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MemoryCard:
 *       type: object
 *       properties:
 *         memorycardId:
 *           type: integer
 *         title:
 *           type: string
 *         dateTime:
 *           type: string
 *           format: date-time
 *         image:
 *           type: string
 *         tags:
 *           type: array
 *           items:
 *             type: string
 */

/**
 * @swagger
 * /mc:
 *   get:
 *     security:
 *       - bearerAuth: []
 *     summary: 모든 메모리 카드 조회
 *     tags: [MemoryCard]
 *     responses:
 *       200:
 *         description: 추억카드 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       memorycardId:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       dateTime:
 *                         type: string
 *                         format: date-time
 *                       image:
 *                         type: string
 *                       tags:
 *                         type: array
 *                         items:
 *                           type: string
 *       404:
 *         description: 추억카드를 찾을 수 없음
 *       500:
 *         description: 서버 오류
 * 
 *   post:
 *     summary: 메모리 카드 생성
 *     description: 새로운 추억카드를 생성합니다.
 *     tags: [MemoryCard]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - groupId
 *               - title
 *               - year
 *               - image
 *             properties:
 *               groupId:
 *                 type: integer
 *               title:
 *                 type: string
 *               year:
 *                 type: string
 *                 format: date
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: 추억카드 생성 성공
 */
// 모든 메모리 카드 조회
router.get('/', mcController.getMemoryCards);

// 메모리 카드 생성
router.post('/', mcController.uploadImage.single('image'), mcController.createMemoryCard);

/**
 * @swagger
 * /mc/{memorycardId}:
 *   get:
 *     summary: 특정 메모리 카드 조회
 *     description: ID를 이용하여 특정 추억카드를 조회합니다.
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: memorycardId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 추억카드 조회 성공
 *       404:
 *         description: 추억카드를 찾을 수 없음
 */
// 특정 메모리 카드 조회
router.get('/:memorycardId', mcController.getMemoryCardById);

/**
 * @swagger
 * /mc/{mcId}/chat:
 *   get:
 *     summary: 대화 기록 조회
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: mcId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 대화 기록 조회 성공
 *   
 *   post:
 *     summary: 대화 기록과 오디오 파일 저장
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: mcId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *               audio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 대화 기록 저장 성공
 *
 *   patch:
 *     summary: 대화 기록 업데이트
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: mcId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               data:
 *                 type: string
 *               audio:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *     responses:
 *       200:
 *         description: 대화 기록 업데이트 성공
 */
// 대화 기록 조회
router.get('/:mcId/chat', mcController.getChatHistory);

// 대화 기록과 오디오 파일 저장
router.post('/:mcId/chat', upload.array('audio'), mcController.saveChatHistory);

// 대화 기록 업데이트
router.patch('/:mcId/chat', upload.array('audio'), mcController.updateChatHistory);

/**
 * @swagger
 * /mc/{mcId}/summary:
 *   get:
 *     summary: 대화 요약 조회
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: mcId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 대화 요약 조회 성공
 */
// 대화 요약 조회
router.get('/:mcId/summary', mcController.getSummary);

/**
 * @swagger
 * /mc/{mcId}/initial-prompt:
 *   get:
 *     summary: 초기 프롬프트 조회
 *     tags: [MemoryCard]
 *     parameters:
 *       - in: path
 *         name: mcId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 초기 프롬프트 조회 성공
 */
// 초기 프롬프트 조회
router.get('/:mcId/initial-prompt', mcController.getInitialPrompt);

module.exports = router;