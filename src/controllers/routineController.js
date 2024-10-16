const Routine = require("../models/routine");
const DailyRoutine = require("../models/dailyRoutine");
const UserGroup = require("../models/userGroup");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { notifyNewRoutine, notifyRoutineUpdate } = require('./notificationController');

// 플러그인 사용 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 일과 목록을 가져오는 함수
const getRoutines = async (req, res) => {
    console.log("get routines");
    try {
        const routines = await Routine.findAll({
            order: [["routineId", "ASC"]],
        });
        console.log("Retrieved routines:", routines);

        if (!routines || routines.length === 0) {
            console.log("No routines found in the database");
            return res.status(404).json({
                status: false,
                data: [],
                message: "No routines found"
            });
        }
        res.json({
            status: true,
            data: routines,
            message: "Routines retrieved successfully"
        });
    } catch (error) {
        console.error("Error in getRoutines:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

// 일과를 생성하는 함수
const createRoutine = async (req, res) => {
    try {
        const { routineId, groupId, title, days, time } = req.body;

        // 이미 존재하는 routineId 체크
        const existingRoutine = await Routine.findByPk(routineId);
        if (existingRoutine) {
            return res.status(400).json({
                status: false,
                data: [],
                message: "Routine ID already exists"
            });
        }

        const newRoutine = await Routine.create({ routineId, groupId, title, days, time });

        // 새 일과 형성 알림 보내기
        await notifyNewRoutine(newRoutine);

        // 현재 날짜와 요일을 가져옴
        const today = dayjs().tz("Asia/Seoul");
        const weekday = (today.day() + 6) % 7;

        // 새로운 루틴이 오늘 요일에 해당하는 경우 DailyRoutine 생성
        if ((days & (1 << (6 - weekday))) !== 0) {
            const routineTime = dayjs(today.format('YYYY-MM-DD') + ' ' + time).tz("Asia/Seoul").toDate();
            
            const newDailyRoutine = await DailyRoutine.create({
                routineId: newRoutine.routineId,
                groupId: newRoutine.groupId,
                time: routineTime,
                completedPhoto: null,
                completedTime: null
            });
            console.log("Created daily routine:", newDailyRoutine);
        }

        res.status(201).json({
            status: true,
            data: newRoutine,
            message: "Routine created successfully"
        });
    } catch (error) {
        console.error("Error in createRoutine:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

// 일과를 수정하는 함수
const updateRoutine = async (req, res) => {
    try {
        const { routineId } = req.params;
        const { title, groupId, days, time } = req.body;

        const routine = await Routine.findByPk(routineId);
        if (!routine) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Routine not found"
            });
        }

        routine.title = title || routine.title;
        routine.groupId = groupId || routine.groupId;
        routine.days = days || routine.days;
        routine.time = time || routine.time;

        await routine.save();
        console.log("Updated routine:", routine);

        // 알림 보내기
        await notifyRoutineUpdate(routine);

        // 현재 날짜와 요일을 가져옴
        const today = dayjs().tz("Asia/Seoul");
        const weekday = (today.day() + 6) % 7;

        // 기존 데일리 루틴 삭제 후, 새로운 설정에 맞는 데일리 루틴 생성
        if ((days & (1 << (6 - weekday))) !== 0) {
            await DailyRoutine.destroy({ where: { routineId, time: { [Op.gte]: today.startOf('day').toDate(), [Op.lt]: today.endOf('day').toDate() } } });
            
            const routineTime = dayjs(today.format('YYYY-MM-DD') + ' ' + time).tz("Asia/Seoul").toDate();

            const newDailyRoutine = await DailyRoutine.create({
                routineId: routine.routineId,
                groupId: routine.groupId,
                time: routineTime,
                completedPhoto: null,
                completedTime: null
            });
            console.log("Updated daily routine:", newDailyRoutine);
        }

        res.json({
            status: true,
            data: routine,
            message: "Routine updated successfully"
        });
    } catch (error) {
        console.error("Error in updateRoutine:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

// 일과를 삭제하는 함수
const deleteRoutine = async (req, res) => {
    try {
        const { routineId } = req.params;

        const routine = await Routine.findByPk(routineId);
        if (!routine) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Routine not found"
            });
        }

        await routine.destroy();
        console.log("Deleted routine:", routine);

        // 해당 루틴과 관련된 데일리 루틴도 삭제
        await DailyRoutine.destroy({ where: { routineId } });
        console.log("Deleted related daily routines");

        res.json({
            status: true,
            data: routine,
            message: "Routine deleted successfully"
        });
    } catch (error) {
        console.error("Error in deleteRoutine:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

module.exports = {
    getRoutines,
    createRoutine,
    updateRoutine,
    deleteRoutine,
};