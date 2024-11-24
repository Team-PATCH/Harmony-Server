// routes/authRoutes.js
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
 * components:
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
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
 *               profile:
 *                 type: string
 *                 example: "profile.png"
 *               authProvider:
 *                 type: string
 *                 enum: [kakao, apple]
 *                 example: "kakao"
 *               socialToken:
 *                 type: string
 *                 example: "kakao_social_token_example"
 *               refreshToken:
 *                 type: string
 *                 example: "kakao_refresh_token_example"
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
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 */
router.post('/signup', authController.signup);

/**
 * @swagger
 * /user/apple/login:
 *   post:
 *     summary: Apple 로그인
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identityToken
 *               - refreshToken
 *             properties:
 *               identityToken:
 *                 type: string
 *                 description: Apple에서 발급받은 identity token
 *                 example: "eyJraWQiOiJXNldjT0tC..."
 *               refreshToken:
 *                 type: string
 *                 description: Apple에서 발급받은 refresh token
 *                 example: "r4a.x.x.xxxxxxxx..."
 *     responses:
 *       200:
 *         description: Apple 로그인 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 user:
 *                   $ref: '#/components/schemas/User'
 *                 token:
 *                   type: string
 *                   example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *       400:
 *         description: 잘못된 요청
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Invalid identity token"
 */
router.post('/apple/login', authController.verifyAppleToken);

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
 *                   $ref: '#/components/schemas/User'
 *       401:
 *         description: 인증되지 않은 사용자
 *       404:
 *         description: 사용자를 찾을 수 없음
 */
router.get('/profile', authMiddleware.verifyToken, authController.getProfile);

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         userId:
 *           type: string
 *         nick:
 *           type: string
 *         profile:
 *           type: string
 *         authProvider:
 *           type: string
 *           enum: [kakao, apple]
 *         socialToken:
 *           type: string
 *         refreshToken:
 *           type: string
 *         socialTokenExpiredAt:
 *           type: string
 *           format: date-time
 *         lastLoginAt:
 *           type: string
 *           format: date-time
 */

module.exports = router;