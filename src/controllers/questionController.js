const cron = require('node-cron');
const Question = require('../models/question');
const ProvideQuestion = require('../models/provideQuestion');
const Comment = require('../models/comment');

// 매일 아침 8시에 새 질문을 선택하고 배포하는 함수
const selectAndDistributeQuestion = async () => {
  try {
    const newQuestion = await ProvideQuestion.findOne({
      order: [Sequelize.fn('RAND')]  // 무작위로 질문 선택
    });

    if (newQuestion) {
      await Question.create({
        groupId: 1,  // 적절한 groupId 설정
        question: newQuestion.question,
        createdAt: new Date()
      });
    }
  } catch (error) {
    console.error('Error selecting and distributing question:', error);
  }
};

// Cron job 설정 (서버 시작 시 실행)
cron.schedule('0 8 * * *', selectAndDistributeQuestion);

// 현재 답변되지 않은 가장 최근 질문을 가져오는 함수
const getCurrentQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({
      where: {
        groupId: req.params.groupId,
        answer: null
      },
      order: [['createdAt', 'DESC']]
    });
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 답변 저장 함수
const postAnswer = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.questionId);
    question.answer = req.body.answer;
    question.answeredAt = new Date();
    await question.save();
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getProvideQuestion = async (req, res) => {
    try {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [['createdAt', 'DESC']]
      });
      console.log('Retrieved question:', provideQuestion);  // 추가된 로그
      if (!provideQuestion) {
        console.log('No questions found in the database');  // 추가된 로그
        return res.status(404).json({ message: "No questions found" });
      }
      res.json(provideQuestion);
    } catch (error) {
      console.error('Error in getProvideQuestion:', error);
      res.status(500).json({ message: error.message });
    }
  };

const getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { groupId: req.params.groupId },
      order: [['answeredAt', 'DESC']],
      limit: 3
    });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getQuestionDetail = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.questionId);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { questionId: req.params.questionId },
      order: [['createdAt', 'DESC']]
    });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const postComment = async (req, res) => {
  try {
    const comment = await Comment.create(req.body);
    res.json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// 모든 exports를 한 곳에 모음
module.exports = {
  selectAndDistributeQuestion,
  getCurrentQuestion,
  postAnswer,
  getProvideQuestion,
  getQuestions,
  getQuestionDetail,
  getComments,
  postComment,
};