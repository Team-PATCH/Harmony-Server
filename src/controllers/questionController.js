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