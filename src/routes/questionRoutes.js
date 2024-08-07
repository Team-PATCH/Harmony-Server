const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

//제공된 질문 조회
router.get('/providequestion', questionController.getProvideQuestion);
//질문메인뷰에서 오늘의 질문 조회
router.get('/currentquestion/:groupId', questionController.getCurrentQuestion);
//질문메인뷰에서 최근질문 세개 조회
router.get('/questions/:groupId', questionController.getQuestions);
//전체 질문목록 조회
router.get('/allquestions/:groupId', questionController.getAllQuestions);
//질문카드 상세정보 조회
router.get('/question/:questionId', questionController.getQuestionDetail);
//질문카드 코멘트 조회
router.get('/comments/:questionId', questionController.getComments);
//질문카드 답변 저장
router.post('/answer/:questionId', questionController.postAnswer);
//질문카드 답변 수정
router.post('/updateanswer/:questionId', questionController.updateAnswer);
//질문카드 코멘트 저장
router.post('/comment', questionController.postComment);
//댓글 수정 라우트
router.put('/comment/:commentId', questionController.updateComment);
// 댓글 삭제 라우트
router.delete('/comment/:commentId', questionController.deleteComment);

module.exports = router;