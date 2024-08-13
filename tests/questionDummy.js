const { sequelize } = require("../src/models");
const ProvideQuestion = require("../src/models/provideQuestion");
const Question = require("../src/models/question");
const Comment = require("../src/models/comment");
const Group = require("../src/models/group");
const User = require("../src/models/user");

async function questionDummy() {
  let transaction;

  try {
    transaction = await sequelize.transaction();

    console.log("Starting database operations...");

    // 외래 키 제약 조건 비활성화
    console.log("Disabling foreign key checks...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0", { transaction });

    // Comment 테이블 비우기
    console.log("Deleting all comments...");
    await sequelize.query("DELETE FROM comment", { transaction });

    // ProvideQuestion과 Question 테이블 초기화
    console.log("Truncating ProvideQuestion table...");
    await sequelize.query("TRUNCATE TABLE providequestion", { transaction });
    console.log("ProvideQuestion table truncated successfully.");

    console.log("Truncating Question table...");
    await sequelize.query("TRUNCATE TABLE question", { transaction });
    console.log("Question table truncated successfully.");
    
    // 외래 키 제약 조건 다시 활성화
    console.log("Re-enabling foreign key checks...");
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1", { transaction });

    // Auto-increment 리셋
    console.log("Resetting auto-increment for ProvideQuestion...");
    await sequelize.query("ALTER TABLE providequestion AUTO_INCREMENT = 1", { transaction });
    console.log("Auto-increment reset for ProvideQuestion.");

    console.log("Resetting auto-increment for Question...");
    await sequelize.query("ALTER TABLE question AUTO_INCREMENT = 1", { transaction });
    console.log("Auto-increment reset for Question.");

    // ProvideQuestion 데이터 생성
    const provideQuestions = [
      { question: "가족끼리 가고싶은 여행지는 어디인가요?" },
      { question: "어린 시절 가족과 함께 보낸 가장 행복한 기억은 무엇인가요?" },
      { question: "당신이 자녀에게 가장 자주 했던 조언은 무엇인가요?" },
      { question: "부모님께 가장 감사했던 순간은 언제였나요?" },
      { question: "가족 여행 중 가장 기억에 남는 장소는 어디였나요?" },
      { question: "자녀가 성장하면서 가장 자랑스러웠던 순간은 언제였나요?" },
      { question: "가족 구성원 중에서 특별히 닮고 싶은 사람은 누구였나요?" },
      { question: "가족 간의 중요한 전통이나 가족만의 문화가 있나요?" },
      { question: "가장 좋아했던 명절 음식은 무엇이었나요?" },
      { question: "형제자매와 함께 보낸 특별한 추억이 있다면 무엇인가요?" },
      { question: "부모님으로부터 배운 가장 중요한 교훈은 무엇인가요?" },
      { question: "어린 시절의 꿈은 무엇이었나요? 그 꿈을 이루었나요?" },
      { question: "평생 기억에 남는 친구는 누구였나요? 그와의 특별한 일화가 있나요?" },
      { question: "삶에서 가장 큰 도전은 무엇이었나요? 어떻게 극복했나요?" },
      { question: "스스로에게 가장 자랑스러웠던 순간은 언제였나요?" },
      { question: "가장 좋아했던 학교 과목은 무엇이었나요? 왜 그 과목을 좋아했나요?" },
      { question: "지금까지의 인생에서 가장 행복했던 시기는 언제였나요?" },
      { question: "살아오면서 가장 중요한 결정은 무엇이었나요?" },
      { question: "인생의 후반기에 가장 중요한 목표는 무엇인가요?" },
      { question: "스스로를 한 단어로 표현한다면, 어떤 단어를 선택하겠나요?" },
      { question: "가장 좋아하는 영화나 드라마는 무엇인가요? 이유는 무엇인가요?" },
      { question: "좋아하는 음악 장르나 가수가 있나요? 그 음악을 들으면 어떤 기분이 드나요?" },
      { question: "가장 즐겨 읽은 책은 무엇인가요? 그 책이 특별한 이유는 무엇인가요?" },
      { question: "평생 먹어본 음식 중에서 가장 맛있었던 음식은 언제, 어디서 먹은 무엇인가요?" },
      { question: "좋아하는 취미나 여가 활동이 있나요? 그 취미를 어떻게 시작하게 되었나요?" },
      { question: "좋아하는 계절과 그 이유는 무엇인가요?" },
      { question: "여행하고 싶은 곳이 있다면 어디인가요? 왜 그곳에 가고 싶으신가요?" },
      { question: "특별히 선호하는 색깔이 있나요? 그 색깔을 좋아하는 이유는 무엇인가요?" },
      { question: "평소 자주 사용하는 물건 중 가장 아끼는 물건은 무엇인가요?" },
      { question: "가장 기억에 남는 콘서트나 공연이 있나요?" },
    ];

    console.log("Creating ProvideQuestions...");
    for (const pq of provideQuestions) {
      await ProvideQuestion.create(pq, { transaction });
    }
    console.log("ProvideQuestions created successfully.");

    // 기존 Group과 User 데이터 가져오기
    console.log("Fetching existing Group and User data...");
    const group = await Group.findOne({ transaction });
    const users = await User.findAll({ transaction });
    console.log("Existing data fetched successfully.");

    // Question 데이터 생성 (모두 답변된 상태)
    const questions = [
      {
        groupId: group.groupId,
        question: "오늘 가장 기억에 남는 일은 무엇인가요?",
        answer: "손자와 함께 공원에서 산책한게 기억에 남지~! 아장아장 한창 귀여울때라 ^^",
        askedAt: new Date(Date.now() - 86400000 * 3), // 3일 전
        answeredAt: new Date(Date.now() - 86400000 * 2), // 2일 전
      },
      {
        groupId: group.groupId,
        question: "최근에 간 콘서트 중 인상 깊었던 것은?",
        answer: "우리딸이 고군분투해서 끊어준 임영웅 콘서트!!! 그건 평생 못잊지~!",
        askedAt: new Date(Date.now() - 86400000 * 2), // 2일 전
        answeredAt: new Date(Date.now() - 86400000), // 1일 전
      },
      {
        groupId: group.groupId,
        question: "가장 그리운 사람은 누구인가요?",
        answer: "돌아가신 부모님이 가장 그립지~ 엄마도 엄마아빠가 늘 보고싶어~",
        askedAt: new Date(Date.now() - 86400000), // 1일 전
        answeredAt: new Date(), // 오늘
      }
    ];

    console.log("Creating Questions...");
    for (const q of questions) {
      await Question.create(q, { transaction });
    }
    console.log("Questions created successfully.");

    // 트랜잭션 커밋
    await transaction.commit();
    console.log("Transaction committed successfully.");

    // 생성된 데이터 확인
    console.log("Fetching all ProvideQuestions...");
    const allProvideQuestions = await ProvideQuestion.findAll();
    console.log("All ProvideQuestions:", JSON.stringify(allProvideQuestions, null, 2));

    console.log("Fetching all Questions...");
    const allQuestions = await Question.findAll({
      include: [Group, Comment],
    });
    console.log("All Questions:", JSON.stringify(allQuestions, null, 2));

  } catch (error) {
    if (transaction) await transaction.rollback();
    console.error("Error resetting and creating dummy data:", error);
  } finally {
    await sequelize.close();
    console.log("Database connection closed.");
  }
}

questionDummy();
