const Routine = require("../models/routine");
const DailyRoutine = require("../models/dailyRoutine");
const RoutineReaction = require("../models/routionReaction");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

// 플러그인 사용 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 일과 목록을 가져오는 함수
const getRoutines = async (req, res) => {
    console.log(dayjs().tz().format());
    try {
        const routines = await Routine.findAll({
            order: [["routineId", "ASC"]],
        });
        // console.log("Retrieved routines:", routines);

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
        const { title, description, startDate, endDate, days, time } = req.body;
        const newRoutine = await Routine.create({ title, description, startDate, endDate, days, time });
        console.log("Created routine:", newRoutine);

        // 현재 날짜에 맞는 DailyRoutine 생성
        const startDay = dayjs(startDate);
        const endDay = dayjs(endDate);

        for (let date = startDay; date.isBefore(endDay); date = date.add(1, 'day')) {
            const weekday = date.day(); // 0: 일요일, 1: 월요일, ..., 6: 토요일
            if ((days & (1 << (6 - weekday))) !== 0) { // 요일에 해당하는 비트가 1이면
                await DailyRoutine.create({
                    date: date.toDate(),
                    routineId: newRoutine.routineId,
                    groupId: newRoutine.groupId,
                    time: newRoutine.time,
                    completedPhoto: null,
                    completedTime: null
                });
            }
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

// 특정 요일에 해당하는 DailyRoutine 목록을 가져오는 함수
const getDailyRoutines = async (req, res) => {
    try {
        const today = dayjs().tz("Asia/Seoul");
        const weekday = (today.day() + 6) % 7; // 0: 월요일, 1: 화요일, ..., 6: 일요일

        // 오늘 날짜의 요일에 해당하는 루틴 조회
        const routines = await Routine.findAll();
        const todayRoutines = routines.filter(routine => (routine.day & (1 << (6 - weekday))) !== 0);

        // DailyRoutine 생성
        const dailyRoutines = await Promise.all(todayRoutines.map(async routine => {
            const dailyRoutine = await DailyRoutine.create({
                routineId: routine.routineId,
                groupId: routine.groupId,
                time: today.toDate(),
                completedPhoto: null,
                completedTime: null
            });
            return dailyRoutine;
        }));

        if (!dailyRoutines || dailyRoutines.length === 0) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "No daily routines found for today"
            });
        }

        res.json({
            status: true,
            data: dailyRoutines,
            message: "Daily routines retrieved successfully"
        });
    } catch (error) {
        console.error("Error in getDailyRoutines:", error);
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
    getDailyRoutines
};
