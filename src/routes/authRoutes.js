const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: User
 *   description: 사용자 인증 및 프로필 관리
 */

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
 *               - nick
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
 *                 example: "kakao"
 *               socialToken:
 *                 type: string
 *                 example: "social_token_example"
 *               refreshToken:
 *                 type: string
 *                 example: "refresh_token_example"
 *               socialTokenExpiredAt:
 *                 type: string
 *                 format: date-time
 *                 example: "2024-08-08 02:44:07"
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
 *                     groups:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [NO_GROUP, HAS_GROUPS]
 *                         needsOnboarding:
 *                           type: boolean
 *                         groups:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               groupId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                                 enum: [VIP, MEMBER]
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
 *                     nick:
 *                       type: string
 *                     authProvider:
 *                       type: string
 *                       enum: [kakao, apple]
 *                     groups:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           enum: [NO_GROUP, HAS_GROUPS]
 *                         needsOnboarding:
 *                           type: boolean
 *                         groups:
 *                           type: array
 *                           items:
 *                             type: object
 *                             properties:
 *                               groupId:
 *                                 type: integer
 *                               name:
 *                                 type: string
 *                               role:
 *                                 type: string
 *                                 enum: [VIP, MEMBER]
 */
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

module.exports = router;