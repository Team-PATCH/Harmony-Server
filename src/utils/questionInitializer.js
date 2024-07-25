const { ProvideQuestion } = require('../models');

// 질문 목록
const questions = [
  '오늘 가장 감사했던 순간은 언제인가요?',
  '최근에 새로 배운 것이 있다면 무엇인가요?',
  '올해의 목표는 무엇인가요?',
  '어제 먹은 음식 중 가장 맛있었던 것은',
  '최근에 본 영화 중 추천하고 싶은 작품이 있나요?',
  '가장 좋아하는 계절은 언제인가요?',
  '어린 시절의 꿈은 무엇이었나요?',
  '스트레스를 해소하는 나만의 방법이 있나요?',
  '최근에 읽은 책 중 인상 깊었던 구절이 있다면?',
  '자신의 장점은 무엇이라고 생각하나요?',
];

// 질문 초기화 함수
const initializeQuestions = async () => {
  try {
    const count = await ProvideQuestion.count();
    console.log(`Current question count: ${count}`);
    if (count === 0) {
      for (let question of questions) {
        const createdQuestion = await ProvideQuestion.create({ question });
        console.log(`Created question: ${createdQuestion.question}`);
      }
      console.log('Questions initialized successfully');
    } else {
      console.log('Questions already exist, skipping initialization');
    }
  } catch (error) {
    console.error('Error initializing questions:', error);
  }
};

// 질문 검증 함수
const verifyQuestions = async () => {
  try {
    const questions = await ProvideQuestion.findAll();
    console.log('Questions in the database:', questions);
  } catch (error) {
    console.error('Error verifying questions:', error);
  }
};

module.exports = {
  initializeQuestions,
  verifyQuestions
};