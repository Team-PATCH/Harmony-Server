const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

/**
 * @swagger
 * tags:
 *   name: Routine
 *   description: 루틴 관리
 */

/**
 * @swagger
 * /routine:
 *   get:
 *     summary: 전체 루틴 조회
 *     tags: [Routine]
 *     responses:
 *       200:
 *         description: 성공적으로 루틴 목록을 조회함
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
 *                     $ref: '#/components/schemas/Routine'
 *                 message:
 *                   type: string
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 전체 루틴 조회
router.get('/', routineController.getRoutines);

/**
 * @swagger
 * /routine:
 *   post:
 *     summary: 루틴 생성
 *     tags: [Routine]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoutineInput'
 *     responses:
 *       201:
 *         description: 루틴이 성공적으로 생성됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Routine'
 *                 message:
 *                   type: string
 *       400:
 *         description: 잘못된 요청
 *       500:
 *         description: 서버 오류
 */
// 루틴 생성
router.post('/', routineController.createRoutine);

/**
 * @swagger
 * /routine/update/{routineId}:
 *   post:
 *     summary: 루틴 수정
 *     tags: [Routine]
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 루틴의 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RoutineInput'
 *     responses:
 *       200:
 *         description: 루틴이 성공적으로 수정됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Routine'
 *                 message:
 *                   type: string
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 루틴 수정
router.post('/update/:routineId', routineController.updateRoutine);

/**
 * @swagger
 * /routine/{routineId}:
 *   delete:
 *     summary: 루틴 삭제
 *     tags: [Routine]
 *     parameters:
 *       - in: path
 *         name: routineId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 루틴의 ID
 *     responses:
 *       200:
 *         description: 루틴이 성공적으로 삭제됨
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Routine'
 *                 message:
 *                   type: string
 *       404:
 *         description: 루틴을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 루틴 삭제
router.delete('/:routineId', routineController.deleteRoutine);

module.exports = router;

/**
 * @swagger
 * components:
 *   schemas:
 *     Routine:
 *       type: object
 *       properties:
 *         routineId:
 *           type: integer
 *           description: 루틴의 고유 ID
 *         groupId:
 *           type: integer
 *           description: 루틴이 속한 그룹의 ID
 *         title:
 *           type: string
 *           description: 루틴의 제목 (최대 20자)
 *         days:
 *           type: integer
 *           description: 루틴 실행 요일 (비트마스크)
 *         time:
 *           type: string
 *           format: time
 *           description: 루틴 실행 시간
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 루틴 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 루틴 수정 시간
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: 루틴 삭제 시간 (soft delete)
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
 *           description: 일일 루틴 실행 시간
 *         completedPhoto:
 *           type: string
 *           description: 완료 인증 사진 URL (최대 200자)
 *         completedTime:
 *           type: string
 *           format: date-time
 *           description: 완료 시간
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 일일 루틴 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 일일 루틴 수정 시간
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: 일일 루틴 삭제 시간 (soft delete)
 *     RoutineReaction:
 *       type: object
 *       properties:
 *         rrId:
 *           type: integer
 *           description: 루틴 리액션의 고유 ID
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
 *           description: 리액션 작성자의 ID (최대 50자)
 *         photo:
 *           type: string
 *           description: 리액션 사진 URL (최대 200자)
 *         comment:
 *           type: string
 *           description: 리액션 코멘트 (최대 200자)
 *         createdAt:
 *           type: string
 *           format: date-time
 *           description: 리액션 생성 시간
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           description: 리액션 수정 시간
 *         deletedAt:
 *           type: string
 *           format: date-time
 *           description: 리액션 삭제 시간 (soft delete)
 *     RoutineInput:
 *       type: object
 *       required:
 *         - groupId
 *         - title
 *         - days
 *         - time
 *       properties:
 *         groupId:
 *           type: integer
 *           description: 루틴이 속할 그룹의 ID
 *         title:
 *           type: string
 *           description: 루틴의 제목 (최대 20자)
 *         days:
 *           type: integer
 *           description: 루틴 실행 요일 (비트마스크)
 *         time:
 *           type: string
 *           format: time
 *           description: 루틴 실행 시간
 */