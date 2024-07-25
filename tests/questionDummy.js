const { sequelize } = require('../src/models');
const Question = require('../src/models/question');
const ProvideQuestion = require('../src/models/provideQuestion');
const Comment = require('../src/models/comment');
const Group = require('../src/models/group');
const User = require('../src/models/user');

async function questionDummy() {
  try {
    // await sequelize.sync({ force: true }); // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.

    // ProvideQuestion 데이터 생성
    const provideQuestions = [
      { question: "오늘 가장 행복했던 순간은?" },
      { question: "내일 꼭 하고 싶은 일은?" },
      { question: "최근에 본 영화 중 가장 좋았던 것은?" },
      { question: "어렸을 때 가장 좋아했던 장난감은?" },
      { question: "지금 가장 하고 싶은 여행지는 어디인가요?" }
    ];

    for (const pq of provideQuestions) {
      await ProvideQuestion.create(pq);
    }

    console.log('ProvideQuestions created successfully.');

    // 기존 Group과 User 데이터 가져오기
    const group = await Group.findOne();
    const users = await User.findAll();

    // Question 데이터 생성 (답변된 질문과 답변되지 않은 질문 모두 포함)
    const questions = [
      {
        groupId: group.groupId,
        question: "오늘 가장 기억에 남는 일은 무엇인가요?",
        answer: "손자와 함께 공원에서 산책한 것입니다.",
        askedAt: new Date(Date.now() - 86400000), // 어제
        answeredAt: new Date(Date.now() - 82800000) // 어제 + 1시간
      },
      {
        groupId: group.groupId,
        question: "내일 하고 싶은 일이 있나요?",
        answer: null,
        askedAt: new Date(),
        answeredAt: null
      },
      {
        groupId: group.groupId,
        question: "요즘 가장 즐겁게 보고 있는 TV 프로그램은 무엇인가요?",
        answer: "요즘 '윤식당'을 재미있게 보고 있어요.",
        askedAt: new Date(Date.now() - 172800000), // 2일 전
        answeredAt: new Date(Date.now() - 169200000) // 2일 전 + 1시간
      }
    ];

    for (const q of questions) {
      await Question.create(q);
    }

    console.log('Questions created successfully.');

    // 생성된 Question 가져오기
    const createdQuestions = await Question.findAll();

    // Comment 데이터 생성
    const comments = [
      {
        questionId: createdQuestions[0].questionId,
        groupId: group.groupId,
        authorId: users[0].userId,
        content: "정말 좋은 시간 보내셨겠어요!"
      },
      {
        questionId: createdQuestions[0].questionId,
        groupId: group.groupId,
        authorId: users[1].userId,
        content: "다음에는 저도 함께 가고 싶어요."
      },
      {
        questionId: createdQuestions[1].questionId,
        groupId: group.groupId,
        authorId: users[0].userId,
        content: "무엇을 하고 싶으세요?"
      }
    ];

    for (const comment of comments) {
      await Comment.create(comment);
    }

    console.log('Comments created successfully.');

    // 생성된 데이터 확인
    const allProvideQuestions = await ProvideQuestion.findAll();
    const allQuestions = await Question.findAll({
      include: [Group, Comment]
    });
    const allComments = await Comment.findAll({
      include: [Question]
    });

    console.log('All ProvideQuestions:', JSON.stringify(allProvideQuestions, null, 2));
    console.log('All Questions:', JSON.stringify(allQuestions, null, 2));
    console.log('All Comments:', JSON.stringify(allComments, null, 2));

  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    await sequelize.close();
  }
}

questionDummy();