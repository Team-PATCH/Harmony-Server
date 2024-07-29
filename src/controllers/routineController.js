const Routine = require("../models/routine");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

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
        const { groupId, title, days, time } = req.body;
        const newRoutine = await Routine.create({ groupId, title, days, time });
        console.log("Created routine:", newRoutine);

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
        const todayRoutines = routines.filter(routine => (routine.days & (1 << (6 - weekday))) !== 0);

        if (!todayRoutines || todayRoutines.length === 0) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "No daily routines found for today"
            });
        }

        res.json({
            status: true,
            data: todayRoutines,
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