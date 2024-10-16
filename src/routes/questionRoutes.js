const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

/**
 * @swagger
 * /qc/providequestion:
 *   get:
 *     summary: 제공된 질문 조회
 *     tags: [Question]
 *     responses:
 *       200:
 *         description: 성공적으로 질문을 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 질문이 성공적으로 조회되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     pqid:
 *                       type: integer
 *                     question:
 *                       type: string
 *       404:
 *         description: 질문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//제공된 질문 조회
router.get('/providequestion', questionController.getProvideQuestion);

/**
 * @swagger
 * /qc/currentquestion/{groupId}:
 *   get:
 *     summary: 질문메인뷰에서 오늘의 질문 조회
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 오늘의 질문을 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 오늘의 질문이 성공적으로 조회되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     groupId:
 *                       type: integer
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: 질문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//질문메인뷰에서 오늘의 질문 조회
router.get('/currentquestion/:groupId', questionController.getCurrentQuestion);

/**
 * @swagger
 * /qc/questions/{groupId}:
 *   get:
 *     summary: 질문메인뷰에서 최근질문 세개 조회
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 최근 질문 세 개를 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 최근 질문 3개가 성공적으로 조회되었습니다
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionId:
 *                         type: integer
 *                       groupId:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                         nullable: true
 *       500:
 *         description: 서버 오류
 */
//질문메인뷰에서 최근질문 세개 조회
router.get('/questions/:groupId', questionController.getQuestions);

/**
 * @swagger
 * /qc/allquestions/{groupId}:
 *   get:
 *     summary: 전체 질문목록 조회
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 그룹 ID
 *     responses:
 *       200:
 *         description: 성공적으로 모든 질문을 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 모든 질문이 성공적으로 조회되었습니다
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       questionId:
 *                         type: integer
 *                       groupId:
 *                         type: integer
 *                       question:
 *                         type: string
 *                       answer:
 *                         type: string
 *                         nullable: true
 *       500:
 *         description: 서버 오류
 */
//전체 질문목록 조회
router.get('/allquestions/:groupId', questionController.getAllQuestions);

/**
 * @swagger
 * /qc/question/{questionId}:
 *   get:
 *     summary: 질문카드 상세정보 조회
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 질문 ID
 *     responses:
 *       200:
 *         description: 성공적으로 질문 상세정보를 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 질문 상세 정보가 성공적으로 조회되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     groupId:
 *                       type: integer
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                       nullable: true
 *       404:
 *         description: 질문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//질문카드 상세정보 조회
router.get('/question/:questionId', questionController.getQuestionDetail);

/**
 * @swagger
 * /qc/comments/{questionId}:
 *   get:
 *     summary: 질문카드 코멘트 조회
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 질문 ID
 *     responses:
 *       200:
 *         description: 성공적으로 코멘트를 조회함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 댓글이 성공적으로 조회되었습니다
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       commentId:
 *                         type: integer
 *                       questionId:
 *                         type: integer
 *                       authorId:
 *                         type: integer
 *                       content:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       500:
 *         description: 서버 오류
 */
//질문카드 코멘트 조회
router.get('/comments/:questionId', questionController.getComments);

/**
 * @swagger
 * /qc/answer/{questionId}:
 *   post:
 *     summary: 질문카드 답변 저장
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 질문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 description: 질문에 대한 답변
 *     responses:
 *       200:
 *         description: 성공적으로 답변을 저장함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 답변이 성공적으로 저장되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     answer:
 *                       type: string
 *       404:
 *         description: 질문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//질문카드 답변 저장
router.post('/answer/:questionId', questionController.postAnswer);

/**
 * @swagger
 * /qc/updateanswer/{questionId}:
 *   post:
 *     summary: 질문카드 답변 수정
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: questionId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 질문 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               answer:
 *                 type: string
 *                 description: 수정된 답변
 *     responses:
 *       200:
 *         description: 성공적으로 답변을 수정함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 답변이 성공적으로 수정되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     questionId:
 *                       type: integer
 *                     answer:
 *                       type: string
 *       404:
 *         description: 질문을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//질문카드 답변 수정
router.post('/updateanswer/:questionId', questionController.updateAnswer);

/**
 * @swagger
 * /qc/comment:
 *   post:
 *     summary: 질문카드 코멘트 저장
 *     tags: [Question]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               questionId:
 *                 type: integer
 *                 description: 질문 ID
 *               groupId:
 *                 type: integer
 *                 description: 그룹 ID
 *               authorId:
 *                 type: integer
 *                 description: 작성자 ID
 *               content:
 *                 type: string
 *                 description: 코멘트 내용
 *     responses:
 *       201:
 *         description: 성공적으로 코멘트를 저장함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 댓글이 성공적으로 생성되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: integer
 *                     questionId:
 *                       type: integer
 *                     authorId:
 *                       type: integer
 *                     content:
 *                       type: string
 *       500:
 *         description: 서버 오류
 */
//질문카드 코멘트 저장
router.post('/comment', questionController.postComment);

/**
 * @swagger
 * /qc/comment/{commentId}:
 *   put:
 *     summary: 댓글 수정
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 수정할 댓글 ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *                 description: 수정된 댓글 내용
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 수정함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 댓글이 성공적으로 업데이트되었습니다
 *                 data:
 *                   type: object
 *                   properties:
 *                     commentId:
 *                       type: integer
 *                     content:
 *                       type: string
 *       404:
 *         description: 댓글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
//댓글 수정 라우트
router.put('/comment/:commentId', questionController.updateComment);

/**
 * @swagger
 * /qc/comment/{commentId}:
 *   delete:
 *     summary: 댓글 삭제
 *     tags: [Question]
 *     parameters:
 *       - in: path
 *         name: commentId
 *         required: true
 *         schema:
 *           type: integer
 *         description: 삭제할 댓글 ID
 *     responses:
 *       200:
 *         description: 성공적으로 댓글을 삭제함
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: 댓글이 성공적으로 삭제되었습니다
 *       404:
 *         description: 삭제할 댓글을 찾을 수 없음
 *       500:
 *         description: 서버 오류
 */
// 댓글 삭제 라우트
router.delete('/comment/:commentId', questionController.deleteComment);

module.exports = router;