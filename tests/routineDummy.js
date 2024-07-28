const { sequelize } = require('../src/models');
const Routine = require('../src/models/routine');
const DailyRoutine = require('../src/models/dailyRoutine');
const Group = require('../src/models/group');
const dayjs = require('dayjs');

async function routineDummy() {
  try {
    // 데이터베이스 동기화
    // await sequelize.sync({ force: true }); // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.

    // 기존 Group 데이터 가져오기
    const group = await Group.findOne();

    if (!group) {
      throw new Error('Group이 존재하지 않습니다. 먼저 Group 데이터를 생성하세요.');
    }

    // Routine 데이터 생성
    const routines = [
      { groupId: group.groupId, title: "하율이 등원 시키기", photo: "https://example.com/photo2.jpg", day: 0b1111100, time: new Date() },
      { groupId: group.groupId, title: "공원 산책가서 비둘기 사진 찍기", photo: "https://example.com/photo2.jpg", day: 0b1100000, time: new Date() },
      { groupId: group.groupId, title: "문화센터 서예 교실 가기", photo: "https://example.com/photo2.jpg", day: 0b0000011, time: new Date() },
      { groupId: group.groupId, title: "요리하기", photo: "https://example.com/photo3.jpg", day: 0b1000000, time: new Date() }
    ];

    for (const routine of routines) {
      const createdRoutine = await Routine.create(routine);

      // DailyRoutine 생성
      const startDate = dayjs();
      const endDate = dayjs().add(1, 'month'); // 한 달 동안의 루틴 생성

      for (let date = startDate; date.isBefore(endDate); date = date.add(1, 'day')) {
        const weekday = date.day(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
        if ((routine.days & (1 << (6 - weekday))) !== 0) { // 요일에 해당하는 비트가 1이면
          await DailyRoutine.create({
            routineId: createdRoutine.routineId,
            groupId: routine.groupId,
            time: date.toDate()
          });
        }
      }
    }

    console.log('Routines and DailyRoutines created successfully.');

    // 생성된 데이터 확인
    const allRoutines = await Routine.findAll({ include: [DailyRoutine] });
    console.log('All Routines:', JSON.stringify(allRoutines, null, 2));

  } catch (error) {
    console.error('Error creating dummy data:', error);
  } finally {
    await sequelize.close();
  }
}

routineDummy();
