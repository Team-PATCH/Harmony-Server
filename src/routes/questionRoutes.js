const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');

router.get('/providequestion', questionController.getProvideQuestion);
router.get('/questions/:groupId', questionController.getQuestions);
router.get('/allquestions/:groupId', questionController.getAllQuestions);
router.get('/question/:questionId', questionController.getQuestionDetail);
router.post('/answer/:questionId', questionController.postAnswer);
router.get('/comments/:questionId', questionController.getComments);
router.post('/comment', questionController.postComment);
router.get('/currentquestion/:groupId', questionController.getCurrentQuestion); // 추가

module.exports = router;