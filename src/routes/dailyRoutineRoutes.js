const express = require('express');
const router = express.Router();
const dailyRoutineController = require('../controllers/dailyRoutineController');

// 오늘 날짜의 데일리 일과 조회
router.get('/today', dailyRoutineController.getTodayDailyRoutines);
// 데일리 일과 인증
router.post('/proving/:dailyId', dailyRoutineController.provingDailyRoutine);

module.exports = router;