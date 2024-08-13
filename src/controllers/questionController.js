const cron = require("node-cron");
const moment = require("moment");
const { Op } = require("sequelize");
const ProvideQuestion = require("../models/provideQuestion");
const Question = require("../models/question");
const Comment = require("../models/comment");
const UserGroup = require("../models/userGroup");
const Group = require("../models/group");
const {
  notifyNewQuestion,
  notifyNewAnswer,
  notifyAnswerUpdate,
  notifyNewComment
} = require("./notificationController");
const apnsController = require("../utils/apn");
const { Sequelize } = require("sequelize");

// createDailyQuestion: 매일 새 질문 생성 및 VIP에게 알림 발송 (cron job에서 호출)
async function createDailyQuestion() {
  try {
    const newQuestion = await ProvideQuestion.findOne({
      order: [["pqid", "ASC"]],
    });

    if (newQuestion) {
      const groups = await Group.findAll();
      for (const group of groups) {
        const createdQuestion = await Question.create({
          groupId: group.groupId,
          question: newQuestion.question,
          createdAt: new Date(),
        });

        await notifyNewQuestion(createdQuestion);
      }

      await newQuestion.destroy();
    }
  } catch (error) {
    console.error("createDailyQuestion 오류:", error);
  }
}

// postAnswer: VIP의 답변 저장 및 멤버에게 알림 발송
async function postAnswer(req, res) {
  try {
    const question = await Question.findByPk(req.params.questionId);

    if (!question) {
      return res.status(404).json({ 
        status: "error",
        message: "질문을 찾을 수 없습니다" 
      });
    }

    if (question.answer) {
      return res.status(400).json({ 
        status: "error",
        message: "이 질문에는 이미 답변이 있습니다" 
      });
    }

    question.answer = req.body.answer;
    question.answeredAt = new Date();
    await question.save();

    console.log("답변이 저장되었습니다. 알림을 보내는 중...");

    try {
      const notificationResult = await notifyNewAnswer(question);
      console.log("알림 결과:", notificationResult);
    } catch (notificationError) {
      console.error("알림 전송 실패:", notificationError);
    }

    res.status(200).json({
      status: "success",
      message: "답변이 성공적으로 저장되었습니다",
      data: question
    });
  } catch (error) {
    console.error("postAnswer 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
}

// updateAnswer: VIP의 답변 수정 저장 및 멤버에게 알림 발송
const updateAnswer = async (req, res) => {
  try {
    const questionId = req.params.questionId;
    const { answer } = req.body;

    if (!answer) {
      return res.status(400).json({ 
        status: "error",
        message: "답변 내용이 필요합니다" 
      });
    }

    const question = await Question.findByPk(questionId);

    if (!question) {
      return res.status(404).json({ 
        status: "error",
        message: "질문을 찾을 수 없습니다" 
      });
    }

    question.answer = answer;
    question.answeredAt = new Date();
    await question.save();

    console.log("답변이 업데이트되었습니다. 알림을 보내는 중...");

    try {
      const notificationResult = await notifyAnswerUpdate(question);
      console.log("알림 결과:", notificationResult);
    } catch (notificationError) {
      console.error("알림 전송 실패:", notificationError);
    }

    res.status(200).json({
      status: "success",
      message: "답변이 성공적으로 업데이트되었습니다",
      data: question
    });
  } catch (error) {
    console.error("updateAnswer 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// postComment: 코멘트 저장 및 그룹의 모두에게 알림 발송
async function postComment(req, res) {
  try {
    const { questionId, groupId, authorId, content } = req.body;
    if (!questionId || !groupId || !authorId || !content) {
      return res.status(400).json({ 
        status: "error",
        message: "필수 필드가 누락되었습니다" 
      });
    }

    const comment = await Comment.create({
      questionId,
      groupId,
      authorId,
      content,
    });

    const question = await Question.findByPk(questionId);

    console.log("댓글이 생성되었습니다. 알림을 보내는 중...");

    try {
      const notificationResult = await notifyNewComment(comment, question);
      console.log("알림 결과:", notificationResult);
    } catch (notificationError) {
      console.error("알림 전송 실패:", notificationError);
    }

    res.status(201).json({
      status: "success",
      message: "댓글이 성공적으로 생성되었습니다",
      data: comment
    });
  } catch (error) {
    console.error("postComment 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
}

// 댓글 수정
async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        status: "error",
        message: "댓글을 찾을 수 없습니다",
        data: null
      });
    }
    
    comment.content = content;
    await comment.save();
    
    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 업데이트되었습니다",
      data: comment
    });
  } catch (error) {
    console.error("updateComment 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다",
      data: null
    });
  }
}

// 댓글 삭제
async function deleteComment(req, res) {
  try {
    const { commentId } = req.params;
    
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ 
        status: "error",
        message: "삭제할 댓글을 찾을 수 없습니다",
        data: null
      });
    }
    
    await comment.destroy();
    
    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 삭제되었습니다",
      data: null
    });
  } catch (error) {
    console.error("deleteComment 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다",
      data: null
    });
  }
}

// getProvideQuestion: 제공된 질문을 가져오는 함수
const getProvideQuestion = async (req, res) => {
  try {
    const provideQuestion = await ProvideQuestion.findOne({
      order: [["pqid", "ASC"]],
    });
    console.log("검색된 질문:", provideQuestion);
    if (!provideQuestion) {
      console.log("데이터베이스에서 질문을 찾을 수 없습니다");
      return res.status(404).json({ 
        status: "error",
        message: "질문을 찾을 수 없습니다" 
      });
    }
    res.status(200).json({
      status: "success",
      message: "질문이 성공적으로 검색되었습니다",
      data: provideQuestion
    });
  } catch (error) {
    console.error("getProvideQuestion 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getCurrentQuestion: 현재 답변되지 않은 질문을 가져오는 함수
const getCurrentQuestion = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const today = moment().startOf("day");

    console.log(`Fetching current question for groupId: ${groupId}`);
    console.log(`Today's date: ${today.format()}`);

    // 1. 가장 최근의 답변되지 않은 질문 찾기
    let question = await Question.findOne({
      where: {
        groupId: groupId,
        answer: null
      },
      order: [["createdAt", "DESC"]],
    });

    console.log("Step 1 - Most recent unanswered question:", question ? JSON.stringify(question) : "None");

    // 2. 답변되지 않은 질문이 없으면 새 질문 생성
    if (!question) {
      console.log("No unanswered question, creating a new one...");
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["pqid", "ASC"]],
      });

      console.log("ProvideQuestion found:", provideQuestion ? JSON.stringify(provideQuestion) : "None");

      if (provideQuestion) {
        question = await Question.create({
          groupId: groupId,
          question: provideQuestion.question,
          createdAt: new Date(),
        });

        await provideQuestion.destroy();
        console.log("New question created:", JSON.stringify(question));
      } else {
        console.log("No provide question available for creating a new question.");
      }
    }

    console.log("Final current question:", question ? JSON.stringify(question) : "No question available");

    if (question) {
      res.status(200).json({
        status: "success",
        message: "현재 질문이 성공적으로 검색되었습니다",
        data: question
      });
    } else {
      res.status(404).json({ 
        status: "error",
        message: "사용 가능한 질문이 없습니다" 
      });
    }
  } catch (error) {
    console.error("getCurrentQuestion 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getQuestions: 가장 최근 질문 세개를 가져오는 함수
const getQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { groupId: req.params.groupId },
      order: [["questionId", "DESC"]],
      limit: 5,
    });
    res.status(200).json({
      status: "success",
      message: "최근 질문 3개가 성공적으로 검색되었습니다",
      data: questions
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getAllQuestions: 모든 질문목록을 가져오는 함수
const getAllQuestions = async (req, res) => {
  try {
    const questions = await Question.findAll({
      where: { groupId: req.params.groupId },
      order: [["questionId", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      message: "모든 질문이 성공적으로 검색되었습니다",
      data: questions
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getQuestionDetail: 질문카드 상세정보를 가져오는 함수
const getQuestionDetail = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.questionId);
    if (question) {
      res.status(200).json({
        status: "success",
        message: "질문 상세 정보가 성공적으로 검색되었습니다",
        data: question
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "질문을 찾을 수 없습니다"
      });
    }
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getComments: 질문카드 코멘트를 가져오는 함수
const getComments = async (req, res) => {
  try {
    const comments = await Comment.findAll({
      where: { questionId: req.params.questionId },
      order: [["createdAt", "DESC"]],
    });
    res.status(200).json({
      status: "success",
      message: "댓글이 성공적으로 검색되었습니다",
      data: comments
    });
  } catch (error) {
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// getNextQuestion: 다음 질문을 가져오는 함수
const getNextQuestion = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const currentQuestionId = req.params.currentQuestionId;

    const currentQuestion = await Question.findByPk(currentQuestionId);

    if (!currentQuestion) {
      return res.status(404).json({ 
        status: "error",
        message: "현재 질문을 찾을 수 없습니다" 
      });
    }

    if (!currentQuestion.answer) {
      return res.status(200).json({
        status: "success",
        message: "현재 질문이 아직 답변되지 않았습니다",
        data: currentQuestion
      });
    }

    let nextQuestion = await Question.findOne({
      where: {
        groupId: groupId,
        answer: null,
        pqid: { [Sequelize.Op.gt]: currentQuestion.pqid },
      },
      order: [["pqid", "ASC"]],
    });

    if (!nextQuestion) {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["pqid", "ASC"]],
      });

      if (provideQuestion) {
        nextQuestion = await Question.create({
          groupId: groupId,
          question: provideQuestion.question,
          createdAt: new Date(),
        });

        await provideQuestion.destroy();
      }
    }

    if (nextQuestion) {
      res.status(200).json({
        status: "success",
        message: "다음 질문이 성공적으로 검색되었습니다",
        data: nextQuestion
      });
    } else {
      res.status(404).json({
        status: "error",
        message: "더 이상 사용 가능한 질문이 없습니다"
      });
    }
  } catch (error) {
    console.error("getNextQuestion 오류:", error);
    res.status(500).json({ 
      status: "error",
      message: "서버 오류가 발생했습니다" 
    });
  }
};

// cron 작업 설정 - 매일 8:00에 새 질문 생성
function setupCronJobs() {
  cron.schedule("48 11 * * *", createDailyQuestion);
}

module.exports = {
  setupCronJobs,
  createDailyQuestion,
  getProvideQuestion,
  getCurrentQuestion,
  getQuestions,
  getAllQuestions,
  getQuestionDetail,
  getComments,
  postAnswer,
  updateAnswer,
  postComment,
  updateComment,
  deleteComment,
  getNextQuestion,
};
