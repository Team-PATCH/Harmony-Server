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
 *     summary: 새로운 그룹 생성
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
 *               name:
 *                 type: string
 *               alias:
 *                 type: string
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
 *                 vipInviteUrl:
 *                   type: string
 */
router.post('/', groupController.createGroup);

/**
 * @swagger
 * /group/join:
 *   post:
 *     summary: 그룹 가입
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
 *                   enum: [v, m]
 */
router.post('/join', groupController.joinGroup);

/**
 * @swagger
 * /group/{groupId}:
 *   get:
 *     summary: 그룹 정보 조회
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: 그룹 정보 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Group'
 */
router.get('/:groupId', groupController.getGroupInfo);

/**
 * @swagger
 * /group/{groupId}/members:
 *   get:
 *     summary: 그룹 멤버 목록 조회
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 멤버 목록을 조회할 그룹의 ID
 *     responses:
 *       200:
 *         description: 그룹 멤버 목록 조회 성공
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   ugId:
 *                     type: integer
 *                   userId:
 *                     type: string
 *                   permissionId:
 *                     type: string
 *                   groupId:
 *                     type: integer
 *                   alias:
 *                     type: string
 *                   User:
 *                     $ref: '#/components/schemas/User'
 *       404:
 *         description: 그룹을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.get('/:groupId/members', groupController.getGroupMembers);

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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [regular, vip]
 *                 description: 재생성할 초대 코드의 유형 (일반 또는 VIP)
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
 *       400:
 *         description: 잘못된 요청 (유효하지 않은 초대 코드 타입)
 *       404:
 *         description: 그룹을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
router.post('/:groupId/regenerate-invite', groupController.regenerateInviteCode);

/**
 * @swagger
 * /group/{groupId}/onboarding:
 *   post:
 *     summary: 사용자 온보딩 정보 업데이트
 *     tags: [Group]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               alias:
 *                 type: string
 *               deviceToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: 온보딩 정보 업데이트 성공
 */
router.post('/:groupId/onboarding', groupController.updateOnboardingInfo);

module.exports = router;

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
 *         vipInviteUrl:
 *           type: string
 *         vipId:
 *           type: string
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
 *         groupId:
 *           type: integer
 *         alias:
 *           type: string
 *         deviceToken:
 *           type: string
 *         User:
 *           $ref: '#/components/schemas/User'
 */