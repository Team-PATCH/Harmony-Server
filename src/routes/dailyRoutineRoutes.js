const express = require('express');
const router = express.Router();
const dailyRoutineController = require('../controllers/dailyRoutineController');

// 오늘 날짜의 데일리 일과 조회
router.get('/today', dailyRoutineController.getTodayDailyRoutines);
// 데일리 일과 인증
router.post('/proving/:dailyId', dailyRoutineController.upload.single('completedPhoto'), dailyRoutineController.provingDailyRoutine);
// 리액션 추가
router.post('/reaction/:dailyId', dailyRoutineController.upload.single('photo'), dailyRoutineController.addReaction);
// 리액션 조회
router.get('/reaction/:dailyId', dailyRoutineController.getReactions);

module.exports = router;