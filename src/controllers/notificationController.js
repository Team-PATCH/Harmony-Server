const apnsController = require('../utils/apn');
const { UserGroup, Question } = require('../models');
const { Op } = require('sequelize');

// 그룹 내 사용자에게 알림을 보내는 함수
async function sendGroupNotification(groupId, permissionId, alert, payload) {
  try {
    // 해당 그룹의 사용자 조회 (permissionId가 null이면 모든 사용자)
    const whereClause = {
      groupId,
      deviceToken: { [Op.ne]: null } // deviceToken이 null이 아닌 경우만
    };
    if (permissionId) {
      whereClause.permissionId = permissionId;
    }
    
    const users = await UserGroup.findAll({ where: whereClause });

    console.log(`Attempting to send notifications to ${users.length} users in group ${groupId}`);

    // 각 사용자에게 알림 전송
    const results = await Promise.allSettled(users.map(user => 
      apnsController.sendNotification(alert, payload, user.deviceToken)
    ));

    // 결과 로깅
    let successCount = 0;
    let failureCount = 0;
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`Notification sent successfully to user ${users[index].userId}`);
        successCount++;
      } else {
        console.error(`Failed to send notification to user ${users[index].userId}:`, result.reason);
        failureCount++;
      }
    });

    console.log(`Notification sending completed. Success: ${successCount}, Failure: ${failureCount}`);
    return { successCount, failureCount };
  } catch (error) {
    console.error('Error in sendGroupNotification:', error);
    throw error;
  }
}

// 새 질문 생성 시 VIP에게 알림 보내기
async function notifyNewQuestion(question) {
  console.log(`Notifying VIP users about new question: ${question.questionId}`);
  const alert = "새로운 질문이 도착했습니다!";
  const payload = {
    questionId: question.questionId,
    question: question.question
  };
  return await sendGroupNotification(question.groupId, 'v', alert, payload);
}

// 새 답변 등록 시 일반 멤버에게 알림 보내기
async function notifyNewAnswer(question) {
  console.log(`Notifying regular members about new answer for question: ${question.questionId}`);
  const alert = "새로운 답변이 등록되었습니다!";
  const payload = {
    questionId: question.questionId,
    question: question.question,
    answer: question.answer
  };
  return await sendGroupNotification(question.groupId, 'm', alert, payload);
}

// 답변 수정 시 일반 멤버에게 알림 보내기
async function notifyAnswerUpdate(question) {
  console.log(`Notifying all members about updated answer for question: ${question.questionId}`);
  const alert = "답변이 수정되었습니다!";
  const payload = {
    questionId: question.questionId,
    question: question.question,
    answer: question.answer
  };
  return await sendGroupNotification(question.groupId, "m", alert, payload);
}

// 새 댓글 등록 시 그룹 전체에 알림 보내기
async function notifyNewComment(comment, question) {
  console.log(`Notifying all members about new comment for question: ${question.questionId}`);
  const alert = "새로운 댓글이 달렸습니다!";
  const payload = {
    questionId: question.questionId,
    question: question.question,
    commentId: comment.id,
    commentContent: comment.content
  };
  return await sendGroupNotification(comment.groupId, null, alert, payload);
}

module.exports = {
  notifyNewQuestion,
  notifyNewAnswer,
  notifyNewComment,
  notifyAnswerUpdate
};