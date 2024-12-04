const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * /user/signup:
 *   post:
 *     summary: 회원가입/로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - authProvider
 *             properties:
 *               userId:
 *                 type: string
 *                 example: "yeojeong@naver.com"
 *               nick:
 *                 type: string
 *                 example: "윤여정"
 *               authProvider:
 *                 type: string
 *                 enum: [kakao, apple]
 *               socialToken:
 *                 type: string
 *               refreshToken:
 *                 type: string
 *               socialTokenExpiredAt:
 *                 type: string
 *                 format: date-time
 *     responses:
 *       200:
 *         description: 로그인/회원가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "사용자 정보가 업데이트되었습니다."
 *                 user:
 *                   type: object
 *                   properties:
 *                     nick:
 *                       type: string
 *                     authProvider:
 *                       type: string
 *                       enum: [kakao, apple]
 *                     groupId:
 *                       type: integer
 *                       description: "-1: 그룹 없음(온보딩 필요)"
 *                     permissionId:
 *                       type: string
 *                       enum: [v, m]
 *                       description: "v: VIP, m: 일반멤버, 그룹 없는 경우 null"
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /user/profile:
 *   get:
 *     summary: 사용자 프로필 조회
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 프로필 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                       example: "yeojeong@naver.com"
 *                     nick:
 *                       type: string
 *                       example: "윤여정"
 *                     authProvider:
 *                       type: string
 *                       enum: [kakao, apple]
 *                     groupId:
 *                       type: integer
 *                       description: 그룹이 없는 경우 -1
 *                     permissionId:
 *                       type: string
 *                       enum: [v, m]
 *                       description: v-VIP, m-일반멤버, 그룹이 없는 경우 null
 */
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;