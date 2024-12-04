const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

/**
 * @swagger
 * tags:
 *   name: Group
 *   description: 그룹 관리
 */

/**
 * @swagger
 * /group:
 *   post:
 *     summary: VIP가 새로운 그룹 생성
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - name
 *             properties:
 *               userId:
 *                 type: string
 *                 description: VIP 사용자의 ID
 *               name:
 *                 type: string
 *                 description: 그룹 이름
 *               deviceToken:
 *                 type: string
 *     responses:
 *       201:
 *         description: 그룹 생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 groupId:
 *                   type: integer
 *                 groupName:
 *                   type: string
 *                 inviteUrl:
 *                   type: string
 */
router.post('/', groupController.createGroup);

/**
 * @swagger
 * /group/join:
 *   post:
 *     summary: 그룹 가입 (일반 멤버)
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - inviteCode
 *             properties:
 *               userId:
 *                 type: string
 *               inviteCode:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 그룹 가입 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 group:
 *                   $ref: '#/components/schemas/Group'
 *                 permission:
 *                   type: string
 *                   enum: [m]
 *                   description: 항상 일반 멤버로 가입
 */
router.post('/join', groupController.joinGroup);

/**
 * @swagger
 * /group/{groupId}/regenerate-invite:
 *   post:
 *     summary: 그룹 초대 코드 재생성
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 초대 코드를 재생성할 그룹의 ID
 *     responses:
 *       200:
 *         description: 초대 코드 재생성 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: 초대 코드가 재생성되었습니다
 *                 newInviteCode:
 *                   type: string
 *                   example: abc12
 */
router.post('/:groupId/regenerate-invite', groupController.regenerateInviteCode);

// 기존 라우트들은 유지
router.get('/:groupId', groupController.getGroupInfo);
router.get('/:groupId/members', groupController.getGroupMembers);
router.post('/:groupId/onboarding', groupController.updateOnboardingInfo);

/**
 * @swagger
 * components:
 *   schemas:
 *     Group:
 *       type: object
 *       properties:
 *         groupId:
 *           type: integer
 *         name:
 *           type: string
 *         inviteUrl:
 *           type: string
 *         vipId:
 *           type: string
 *           description: 그룹을 생성한 VIP의 userId
 *         UserGroups:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/UserGroup'
 *     UserGroup:
 *       type: object
 *       properties:
 *         ugId:
 *           type: integer
 *         userId:
 *           type: string
 *         permissionId:
 *           type: string
 *           enum: [v, m]
 *           description: v-VIP, m-일반멤버
 *         groupId:
 *           type: integer
 *         alias:
 *           type: string
 *         deviceToken:
 *           type: string
 *         User:
 *           $ref: '#/components/schemas/User'
 */

module.exports = router;