const express = require('express');
const router = express.Router();
const routineController = require('../controllers/routineController');

// 전체 루틴 조회
router.get('/', routineController.getRoutines);
// 특정 루틴의 DailyRoutine 목록 조회
router.get('/dailyroutines', routineController.getDailyRoutines);
// 루틴 생성
router.post('/', routineController.createRoutine);
// 루틴 수정
router.post('/update/:routineId', routineController.updateRoutine);
// 루틴 삭제
router.delete('/:routineId', routineController.deleteRoutine);

module.exports = router;