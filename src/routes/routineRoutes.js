const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

// 전체 루틴 조회
router.get('/', routineController.getRoutines);
// 특정 루틴의 DailyRoutine 목록 조회
router.get('/dailyroutines', routineController.getDailyRoutines);
// 루틴 생성
router.post('/', routineController.createRoutine);

module.exports = router;