const Routine = require("../models/routine");
const DailyRoutine = require("../models/dailyRoutine");
const RoutineReaction = require("../models/routionReaction")
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { Op } = require("sequelize");
const multer = require("multer");
const path = require("path");

// 플러그인 사용 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// multer 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // 파일 저장 경로
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage });

// 오늘 날짜의 데일리 일과 조회
const getTodayDailyRoutines = async (req, res) => {
    try {
        const today = dayjs().tz("Asia/Seoul").startOf('day').toDate();
        const tomorrow = dayjs().tz("Asia/Seoul").add(1, 'day').startOf('day').toDate();

        const dailyRoutines = await DailyRoutine.findAll({
            where: {
                time: {
                    [Op.gte]: today,
                    [Op.lt]: tomorrow
                }
            },
            include: [Routine]
        });

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
            message: "Daily routines for today retrieved successfully"
        });
    } catch (error) {
        console.error("Error in getTodayDailyRoutines:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

// 오늘의 요일에 해당하는 데일리 일과 생성 함수
const createDailyRoutines = async () => {
    try {
        console.log("Let's create Daily Routines")
        const today = dayjs().tz("Asia/Seoul");
        const weekday = (today.day() + 6) % 7; // 0: 월요일, 1: 화요일, ..., 6: 일요일

        // 오늘 날짜의 요일에 해당하는 루틴 조회
        const routines = await Routine.findAll();
        console.log("routines:" + routines)
        const todayRoutines = routines.filter(routine => (routine.days & (1 << (6 - weekday))) !== 0);
        console.log("today's routines:" + todayRoutines)

        for (const routine of todayRoutines) {
            await DailyRoutine.create({
                routineId: routine.routineId,
                groupId: routine.groupId,
                time: today.toDate(),
                completedPhoto: null,
                completedTime: null
            });
        }

        console.log("Daily routines for today created successfully.");
    } catch (error) {
        console.error("Error in createDailyRoutines:", error);
    }
};

// 데일리 일과 인증
const provingDailyRoutine = async (req, res) => {
    try {
        const { dailyId } = req.params;
        const dailyRoutine = await DailyRoutine.findByPk(dailyId);
        if (!dailyRoutine) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Daily routine not found"
            });
        }

        const completedPhoto = req.file ? req.file.path : null;
        dailyRoutine.completedPhoto = completedPhoto;
        dailyRoutine.completedTime = dayjs().tz("Asia/Seoul").toDate();

        await dailyRoutine.save();
        console.log("Proved daily routine:", dailyRoutine);

        res.json({
            status: true,
            data: dailyRoutine,
            message: "Daily routine proved successfully"
        });
    } catch (error) {
        console.error("Error in provingDailyRoutine:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};

// 리액션 추가
const addReaction = async (req, res) => {
    try {
        const { dailyId } = req.params;
        const { routineId, groupId, authorId, photo, comment } = req.body;

        const dailyRoutine = await DailyRoutine.findByPk(dailyId);
        if (!dailyRoutine) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Daily routine not found"
            });
        }

        const reaction = await RoutineReaction.create({
            dailyId,
            routineId,
            groupId,
            authorId,
            photo,
            comment
        });

        res.json({
            status: true,
            data: reaction,
            message: "Reaction added successfully"
        });
    } catch (error) {
        console.error("Error in addReaction:", error);
        res.status(500).json({
            status: false,
            data: [],
            message: error.message
        });
    }
};



module.exports = {
    createDailyRoutines,
    getTodayDailyRoutines,
    provingDailyRoutine,
    addReaction,
    upload
};