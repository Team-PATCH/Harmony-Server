const ProvideQuestion = require("../models/provideQuestion");
const Question = require("../models/question");
const Comment = require("../models/comment");

const { Sequelize } = require("sequelize");

// 제공된 질문을 가져오는 함수
const getProvideQuestion = async (req, res) => {
    try {
      const provideQuestion = await ProvideQuestion.findOne({
        order: [["createdAt", "ASC"]],
      });
      console.log("Retrieved question:", provideQuestion); // 추가된 로그
      if (!provideQuestion) {
        console.log("No questions found in the database"); // 추가된 로그
        return res.status(404).json({ message: "No questions found" });
      }
      res.json(provideQuestion);
    } catch (error) {
      console.error("Error in getProvideQuestion:", error);
      res.status(500).json({ message: error.message });
    }
  };

  // 현재 답변되지 않은 가장 최근 질문을 가져오는 함수
const getCurrentQuestion = async (req, res) => {
    try {
      const groupId = req.params.groupId;
  
      // 답변되지 않은 질문 찾기
      let question = await Question.findOne({
        where: {
          groupId: groupId,
          answer: null,
        },
        order: [["createdAt", "ASC"]],
      });
  
      // 답변되지 않은 질문이 없으면 새 질문 생성
      if (!question) {
        // ProvideQuestion에서 가장 오래된 질문 선택
        const provideQuestion = await ProvideQuestion.findOne({
          order: [["createdAt", "ASC"]], // 가장 오래된 질문 선택
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