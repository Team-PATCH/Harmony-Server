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


//QUESTION PART

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
// 새 메모리 카드 생성 알림 보내기
async function notifyNewMemoryCard(memoryCard) {
  console.log(`Notifying group members about new memory card: ${memoryCard.mcId}`);
  const alert = "새로운 추억 카드가 생성되었습니다!";
  const payload = {
    mcId: memoryCard.mcId,
    title: memoryCard.title
  };
  return await sendGroupNotification(memoryCard.groupId, null, alert, payload);
}

// 새 채팅 메시지 알림 보내기
async function notifyChatMessage(chatSession) {
  console.log(`Notifying group members about new chat message in session: ${chatSession.chatId}`);
  const alert = "VIP가 새로운 추억카드를 공유하였습니다!";
  const payload = {
    chatId: chatSession.chatId,
    mcId: chatSession.mcId
  };
  return await sendGroupNotification(chatSession.groupId, null, alert, payload);
}

//ROUTINE PART

async function notifyNewRoutine(routine) {
  const alert = "새로운 일과가 등록되었습니다!";
  const payload = {
    routineId: routine.routineId,
    title: routine.title,
    days: routine.days,
    time: routine.time
  };
  console.log("Notification payload:", payload);
  try {
    const result = await sendGroupNotification(routine.groupId, 'm', alert, payload);
    console.log("Notification result:", result);
    return result;
  } catch (error) {
    console.error("Error in notifyNewRoutine:", error);
    throw error;
  }
}

// 일과 수정 시 알림 보내기
async function notifyRoutineUpdate(routine) {
  console.log(`Notifying all members about updated routine: ${routine.routineId}`);
  const alert = "일과가 수정되었습니다!";
  const payload = {
    routineId: routine.routineId,
    title: routine.title,
    days: routine.days,
    time: routine.time
  };
  return await sendGroupNotification(routine.groupId, null, alert, payload);
}

// VIP 일과 달성 시 멤버들에게 알림 보내기
async function notifyVIPRoutineCompletion(dailyRoutine) {
  console.log(`Notifying members about VIP routine completion: ${dailyRoutine.dailyId}`);
  const alert = "VIP가 일과를 달성했습니다!";
  const payload = {
    dailyId: dailyRoutine.dailyId,
    routineId: dailyRoutine.routineId,
    title: dailyRoutine.title
  };
  return await sendGroupNotification(dailyRoutine.groupId, 'm', alert, payload);
}

// 새 루틴 리액션 알림 함수
async function notifyNewRoutineReaction(reaction, dailyRoutine) {
  console.log(`일상 루틴 ${dailyRoutine.dailyId}에 대한 새로운 리액션 알림`);
  const alert = "새로운 리액션이 달렸습니다!";
  const payload = {
    dailyId: dailyRoutine.dailyId,
    routineId: reaction.routineId,
    reactionId: reaction.id,
    authorId: reaction.authorId,
    comment: reaction.comment
  };
  return await sendGroupNotification(reaction.groupId, null, alert, payload);
}

module.exports = {
  notifyNewQuestion,
  notifyNewAnswer,
  notifyNewComment,
  notifyAnswerUpdate,
  notifyNewMemoryCard,
  notifyChatMessage,
  notifyNewRoutine,
  notifyRoutineUpdate,
  notifyVIPRoutineCompletion,
  notifyNewRoutineReaction
};