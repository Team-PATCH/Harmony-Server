const express = require('express');
const router = express.Router();
const dailyRoutineController = require('../controllers/dailyRoutineController');

/**
 * @swagger
 * tags:
 *   name: DailyRoutine
 *   description: 일일 루틴 관리
 */

/**
 * @swagger
 * /dailyroutine/today:
 *   get:
 *     summary: 오늘의 일일 루틴 조회
 *     description: 오늘 날짜에 해당하는 모든 일일 루틴을 조회합니다.
 *     tags: [DailyRoutine]
 *     responses:
 *       200:
 *         description: 성공적으로 조회됨
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
 *                     $ref: '#/components/schemas/DailyRoutine'
 *                 message:
 *                   type: string
 *       404:
 *         description: 오늘의 일일 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 오늘 날짜의 데일리 일과 조회
router.get('/today', dailyRoutineController.getTodayDailyRoutines);

/**
 * @swagger
 * /dailyroutine/prove/{dailyId}:
 *   post:
 *     summary: 일일 루틴 완료 인증
 *     description: 특정 일일 루틴의 완료를 인증하고 사진을 업로드합니다.
 *     tags: [DailyRoutine]
 *     parameters:
 *       - in: path
 *         name: dailyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 인증할 일일 루틴의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: 인증 사진 파일
 *     responses:
 *       200:
 *         description: 일일 루틴 인증 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DailyRoutineResponse'
 *       404:
 *         description: 일일 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 데일리 일과 인증
router.post('/proving/:dailyId', dailyRoutineController.upload.single('completedPhoto'), dailyRoutineController.provingDailyRoutine);

/**
 * @swagger
 * /dailyroutine/reaction/{dailyId}:
 *   post:
 *     summary: 일일 루틴에 리액션 추가
 *     description: 특정 일일 루틴에 대한 리액션(코멘트와 사진)을 추가합니다.
 *     tags: [DailyRoutine]
 *     parameters:
 *       - in: path
 *         name: dailyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리액션을 추가할 일일 루틴의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               routineId:
 *                 type: integer
 *                 description: 관련 루틴의 ID
 *               groupId:
 *                 type: integer
 *                 description: 그룹 ID
 *               authorId:
 *                 type: string
 *                 description: 리액션 작성자의 ID
 *               comment:
 *                 type: string
 *                 description: 리액션 코멘트
 *               photo:
 *                 type: string
 *                 format: binary
 *                 description: 리액션 사진 파일 (선택사항)
 *     responses:
 *       200:
 *         description: 리액션 추가 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RoutineReactionResponse'
 *       404:
 *         description: 일일 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 리액션 추가
router.post('/reaction/:dailyId', dailyRoutineController.upload.single('photo'), dailyRoutineController.addReaction);

/**
 * @swagger
 * /dailyroutine/reactions/{dailyId}:
 *   get:
 *     summary: 일일 루틴의 리액션 조회
 *     description: 특정 일일 루틴에 대한 모든 리액션을 조회합니다.
 *     tags: [DailyRoutine]
 *     parameters:
 *       - in: path
 *         name: dailyId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 리액션을 조회할 일일 루틴의 ID
 *     responses:
 *       200:
 *         description: 리액션 조회 성공
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
 *                     $ref: '#/components/schemas/RoutineReaction'
 *                 message:
 *                   type: string
 *       404:
 *         description: 리액션을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 리액션 조회
router.get('/reaction/:dailyId', dailyRoutineController.getReactions);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     DailyRoutine:
 *       type: object
 *       properties:
 *         dailyId:
 *           type: integer
 *           description: 일일 루틴의 고유 ID
 *         routineId:
 *           type: integer
 *           description: 연결된 루틴의 ID
 *         groupId:
 *           type: integer
 *           description: 그룹 ID
 *         time:
 *           type: string
 *           format: date-time
 *           description: 일일 루틴 수행 시간
 *         completedPhoto:
 *           type: string
 *           description: 완료 인증 사진 URL
 *         completedTime:
 *           type: string
 *           format: date-time
 *           description: 완료 시간
 *     DailyRoutineResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: 요청 처리 성공 여부
 *         data:
 *           $ref: '#/components/schemas/DailyRoutine'
 *         message:
 *           type: string
 *           description: 응답 메시지
 *     RoutineReaction:
 *       type: object
 *       properties:
 *         rrId:
 *           type: integer
 *           description: 리액션의 고유 ID
 *         dailyId:
 *           type: integer
 *           description: 연결된 일일 루틴의 ID
 *         routineId:
 *           type: integer
 *           description: 연결된 루틴의 ID
 *         groupId:
 *           type: integer
 *           description: 그룹 ID
 *         authorId:
 *           type: string
 *           description: 리액션 작성자의 ID
 *         photo:
 *           type: string
 *           description: 리액션 사진 URL
 *         comment:
 *           type: string
 *           description: 리액션 코멘트
 *     RoutineReactionResponse:
 *       type: object
 *       properties:
 *         status:
 *           type: boolean
 *           description: 요청 처리 성공 여부
 *         data:
 *           $ref: '#/components/schemas/RoutineReaction'
 *         message:
 *           type: string
 *           description: 응답 메시지
 */