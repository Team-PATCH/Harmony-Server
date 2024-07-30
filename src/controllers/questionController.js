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

        // VIP 사용자에게 푸시 알림 발송
        await notifyNewQuestion(createdQuestion);
      }

      await newQuestion.destroy();
    }
  } catch (error) {
    console.error("Error in createDailyQuestion:", error);
  }
}

// postAnswer: VIP의 답변 저장 및 멤버에게 알림 발송
async function postAnswer(req, res) {
  try {
    const question = await Question.findByPk(req.params.questionId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // 이미 답변이 있는 경우 거부
    if (question.answer) {
      return res
        .status(400)
        .json({ message: "This question has already been answered" });
    }

    question.answer = req.body.answer;
    question.answeredAt = new Date();
    await question.save();

    console.log("Answer saved. Attempting to send notifications.");

    // 일반 멤버에게 알림 발송
    try {
      const notificationResult = await notifyNewAnswer(question);
      console.log("Notification result:", notificationResult);
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // 알림 실패를 로그로 남기지만, 전체 프로세스는 계속 진행
    }

    res.json(question);
  } catch (error) {
    console.error("Error in postAnswer:", error);
    res.status(500).json({ message: error.message });
  }
}

// updateAnswer: VIP의 답변 수정 저장 및 멤버에게 알림 발송
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

    console.log("Answer updated. Attempting to send notifications.");

    // 일반 멤버에게 알림 발송
    try {
      const notificationResult = await notifyAnswerUpdate(question);
      console.log("Notification result:", notificationResult);
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // 알림 실패를 로그로 남기지만, 전체 프로세스는 계속 진행
    }

    res.json(question);
  } catch (error) {
    console.error("Error in updateAnswer:", error);
    res.status(500).json({ message: error.message });
  }
};

// postComment: 코멘트 저장 및 그룹의 모두에게 알림 발송
async function postComment(req, res) {
  try {
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

    const question = await Question.findByPk(questionId);

    console.log("Comment created. Attempting to send notifications.");

    // 그룹의 모든 멤버에게 알림 발송
    try {
      const notificationResult = await notifyNewComment(comment, question);
      console.log("Notification result:", notificationResult);
    } catch (notificationError) {
      console.error("Failed to send notifications:", notificationError);
      // 알림 실패를 로그로 남기지만, 전체 프로세스는 계속 진행
    }

    res.status(201).json(comment);
  } catch (error) {
    console.error("Error in postComment:", error);
    res.status(500).json({ message: error.message });
  }
}

// updateComment: 댓글 수정 
async function updateComment(req, res) {
  try {
    const { commentId } = req.params;
    const { content } = req.body;
    
    // Find the comment
    const comment = await Comment.findByPk(commentId);
    
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    
    // Update the comment
    comment.content = content;
    await comment.save();
    
    // Optionally, send notifications about the updated comment
    
    res.json(comment);
  } catch (error) {
    console.error("Error in updateComment:", error);
    res.status(500).json({ message: error.message });
  }
}

// getProvideQuestion: 제공된 질문을 가져오는 함수
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

// getCurrentQuestion: 현재 답변되지 않은 질문을 가져오는 함수
const getCurrentQuestion = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const today = moment().startOf("day");

    // 오늘 생성된 가장 최근 질문 찾기
    let question = await Question.findOne({
      where: {
        groupId: groupId,
        createdAt: {
          [Op.gte]: today.toDate(),
          [Op.lt]: moment(today).endOf("day").toDate(),
        },
      },
      order: [["createdAt", "DESC"]],
    });

    // 오늘 생성된 질문이 없으면 새 질문 생성
    if (!question) {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["pqid", "ASC"]],
      });

      if (provideQuestion) {
        question = await Question.create({
          groupId: groupId,
          question: provideQuestion.question,
          createdAt: new Date(),
        });

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

// getQuestions: 가장 최근 질문 세개를 가져오는 함수
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

// getAllQuestions: 모든 질문목록을 가져오는 함수
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

// getQuestionDetail: 질문카드 상세정보를 가져오는 함수
const getQuestionDetail = async (req, res) => {
  try {
    const question = await Question.findByPk(req.params.questionId);
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// getComments: 질문카드 코멘트를 가져오는 함수
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

// // updateAnswer: 답변 수정 함수
// const updateAnswer = async (req, res) => {
//   try {
//     const questionId = req.params.questionId;
//     const { answer } = req.body;

//     if (!answer) {
//       return res.status(400).json({ message: "Answer is required" });
//     }

//     const question = await Question.findByPk(questionId);

//     if (!question) {
//       return res.status(404).json({ message: "Question not found" });
//     }

//     question.answer = answer;
//     question.answeredAt = new Date(); // 답변 시간 업데이트
//     await question.save();

//     res.json(question);
//   } catch (error) {
//     console.error("Error in updateAnswer:", error);
//     res.status(500).json({ message: error.message });
//   }
// };

// getNextQuestion: 다음 질문을 가져오는 함수
const getNextQuestion = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const currentQuestionId = req.params.currentQuestionId;

    // 현재 질문 찾기
    const currentQuestion = await Question.findByPk(currentQuestionId);

    if (!currentQuestion) {
      return res.status(404).json({ message: "Current question not found" });
    }

    // 현재 질문에 답변이 없으면 같은 질문 반환
    if (!currentQuestion.answer) {
      return res.json(currentQuestion);
    }

    // 답변되지 않은 다음 질문 찾기
    let nextQuestion = await Question.findOne({
      where: {
        groupId: groupId,
        answer: null,
        pqid: { [Sequelize.Op.gt]: currentQuestion.pqid },
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
          createdAt: new Date(),
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

// cron 작업 설정 - 매일 8:00에 새 질문 생성
function setupCronJobs() {
  cron.schedule("00 08 * * *", createDailyQuestion);
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
  getNextQuestion,
};
