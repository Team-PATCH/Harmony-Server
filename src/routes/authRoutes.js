const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const upload = require('../utils/uploadImage');  // 경로는 실제 구조에 맞게 수정해주세요

router.patch('/profile', 
  authMiddleware.verifyToken, 
  upload.single('profileImage'),
  authController.updateProfile
);

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

/**
 * @swagger
 * /user/profile:
 *   patch:
 *     summary: 사용자 프로필 수정
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               nick:
 *                 type: string
 *                 example: "새로운닉네임"
 *               profileImage:
 *                 type: string
 *                 format: binary
 *                 description: "프로필 이미지 파일 (10MB 이하, jpg/jpeg/png)"
 *     responses:
 *       200:
 *         description: 프로필 수정 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "프로필이 업데이트되었습니다."
 *                 user:
 *                   type: object
 *                   properties:
 *                     userId:
 *                       type: string
 *                     nick:
 *                       type: string
 *                     profileImage:
 *                       type: string
 *                       description: "Azure Blob Storage URL"
 *                     authProvider:
 *                       type: string
 *                     groupId:
 *                       type: integer
 *                     permissionId:
 *                       type: string
 */
router.patch('/profile', 
    authMiddleware.verifyToken, 
    (req, res, next) => {
      profileUpload(req, res, (err) => {
        if (err) {
          return res.status(400).json({ 
            message: '파일 업로드 중 오류가 발생했습니다.',
            error: err.message 
          });
        }
        next();
      });
    },
    authController.updateProfile
  );
  
  /**
   * @swagger
   * /user/logout:
   *   post:
   *     summary: 로그아웃
   *     tags: [User]
   *     security:
   *       - bearerAuth: []
   *     responses:
   *       200:
   *         description: 로그아웃 성공
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 message:
   *                   type: string
   *                   example: "로그아웃되었습니다."
   */
  router.post('/logout', authMiddleware.verifyToken, authController.logout);

module.exports = router;