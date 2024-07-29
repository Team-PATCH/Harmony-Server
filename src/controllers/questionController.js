const ProvideQuestion = require("../models/provideQuestion");
const Question = require("../models/question");
const Comment = require("../models/comment");

const { Sequelize } = require("sequelize");

// 제공된 질문을 가져오는 함수
const getProvideQuestion = async (req, res) => {
    try {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["pqid", "ASC"]],
      });
      console.log("Retrieved question:", provideQuestion);
      if (!provideQuestion) {
        console.log("No questions found in the database");
        return res.status(404).json({ message: "No questions found" });
      }
      res.json(provideQuestion);
    } catch (error) {
      console.error("Error in getProvideQuestion:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // 현재 답변되지 않은 질문을 가져오는 함수
const getCurrentQuestion = async (req, res) => {
    try {
      const groupId = req.params.groupId;
  
      // 답변되지 않은 질문 찾기
      let question = await Question.findOne({
        where: {
          groupId: groupId,
          answer: null,
        },
        order: [["questionId", "DESC"]],
      });
  
      // 답변되지 않은 질문이 없으면 새 질문 생성
      if (!question) {
        // ProvideQuestion에서 질문 가져오기
        const provideQuestion = await ProvideQuestion.findOne({
          order: [["pqid", "ASC"]],
        });
  
        if (provideQuestion) {
          // 새 질문 생성
          question = await Question.create({
            groupId: groupId,
            question: provideQuestion.question,
            askedAt: new Date(),
          });
  
          // 사용된 ProvideQuestion 삭제 (선택사항)
          await provideQuestion.destroy();
        }
      }
  
      console.log("Current question:", question);
  
      if (question) {
        res.json(question);
      } else {
        res.status(404).json({ message: "No question available" });
      }
    } catch (error) {
      console.error("Error in getCurrentQuestion:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // 가장 최근 질문 세개를 가져오는 함수
const getQuestions = async (req, res) => {
    try {
      const questions = await Question.findAll({
        where: { groupId: req.params.groupId },
        order: [["questionId", "DESC"]],
        limit: 3,
      });
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // 모든 질문목록을 가져오는 함수
const getAllQuestions = async (req, res) => {
    try {
      const questions = await Question.findAll({
        where: { groupId: req.params.groupId },
        order: [["questionId", "DESC"]],
      });
      res.json(questions);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // 질문카드 상세정보를 가져오는 함수
const getQuestionDetail = async (req, res) => {
    try {
      const question = await Question.findByPk(req.params.questionId);
      res.json(question);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  };

  // 질문카드 코멘트를 가져오는 함수
const getComments = async (req, res) => {
    try {
      const comments = await Comment.findAll({
        where: { questionId: req.params.questionId },
        order: [["createdAt", "DESC"]],
      });
      res.json(comments);
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

  // 답변 수정 함수
const updateAnswer = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const { answer } = req.body;
    
    if (!answer) {
      return res.status(400).json({ message: "Answer is required" });
    }

    const question = await Question.findByPk(questionId);
    
    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    question.answer = answer;
    question.answeredAt = new Date(); // 답변 시간 업데이트
    await question.save();

    res.json(question);
  } catch (error) {
    console.error("Error in updateAnswer:", error);
    res.status(500).json({ message: error.message });
  }
};

  // 질문카드 코멘트를 생성하는 함수
const postComment = async (req, res) => {
    try {
      console.log("Received comment data:", req.body); // 요청 데이터 로깅
  
      // 필요한 필드가 모두 있는지 확인
      const { questionId, groupId, authorId, content } = req.body;
      if (!questionId || !groupId || !authorId || !content) {
        return res.status(400).json({ message: "Missing required fields" });
      }
  
      const comment = await Comment.create({
        questionId,
        groupId,
        authorId,
        content,
      });
  
      console.log("Created comment:", comment.toJSON()); // 생성된 댓글 로깅
      res.status(201).json(comment);
    } catch (error) {
      console.error("Error in postComment:", error); // 오류 상세 로깅
      res.status(500).json({ message: error.message });
    }
  };

  // 다음 질문을 가져오는 함수
const getNextQuestion = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    
    // 답변되지 않은 다음 질문 찾기
    let nextQuestion = await Question.findOne({
      where: {
        groupId: groupId,
        answer: null,
      },
      order: [["pqid", "ASC"]],
    });

    // 답변되지 않은 질문이 없으면 새 질문 생성
    if (!nextQuestion) {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["pqid", "ASC"]],
      });

      if (provideQuestion) {
        nextQuestion = await Question.create({
          groupId: groupId,
          question: provideQuestion.question,
          askedAt: new Date(),
        });

        await provideQuestion.destroy();
      }
    }

    if (nextQuestion) {
      res.json(nextQuestion);
    } else {
      res.status(404).json({ message: "No more questions available" });
    }
  } catch (error) {
    console.error("Error in getNextQuestion:", error);
    res.status(500).json({ message: error.message });
  }
};

  module.exports = {
    getProvideQuestion,
    getCurrentQuestion,
    getQuestions,
    getAllQuestions,
    getQuestionDetail,
    getComments,
    postAnswer,
    updateAnswer,
    postComment,
    getNextQuestion,
  };