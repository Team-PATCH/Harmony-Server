const Routine = require("../models/routine");
const DailyRoutine = require("../models/dailyRoutine");
const RoutineReaction = require("../models/routionReaction");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { Op } = require("sequelize");
const upload = require("../utils/uploadImage");
const dotenv = require('dotenv');
dotenv.config();

dayjs.extend(utc);
dayjs.extend(timezone);

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
            include: [
                {
                    model: Routine,
                    where: {
                        deletedAt: null
                    },
                    required: true
                }
            ]
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
        const today = dayjs().tz("Asia/Seoul");
        const weekday = (today.day() + 6) % 7;

        const routines = await Routine.findAll({
            where: {
                deletedAt: null
            }
        });

        const todayRoutines = routines.filter(routine => (routine.days & (1 << (6 - weekday))) !== 0);

        for (const routine of todayRoutines) {
            await DailyRoutine.create({
                routineId: routine.routineId,
                groupId: routine.groupId,
                time: today.toDate(),
                completedPhoto: null,
                completedTime: null
            });
        }
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

        const completedPhoto = req.filename ? `${process.env.AZURE_BLOB_BASE_URL}${req.filename}` : null;
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
        const { routineId, groupId, authorId, comment } = req.body;

        const dailyRoutine = await DailyRoutine.findByPk(dailyId);
        if (!dailyRoutine) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "Daily routine not found"
            });
        }

        const photo = req.filename ? `${process.env.AZURE_BLOB_BASE_URL}${req.filename}` : null;
        console.log("photo:", photo)

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

// 리액션 조회
const getReactions = async (req, res) => {
    try {
        const { dailyId } = req.params;

        const reactions = await RoutineReaction.findAll({
            where: { dailyId }
        });

        if (!reactions || reactions.length === 0) {
            return res.status(404).json({
                status: false,
                data: [],
                message: "No reactions found for this daily routine"
            });
        }

        res.json({
            status: true,
            data: reactions,
            message: "Reactions retrieved successfully"
        });
    } catch (error) {
        console.error("Error in getReactions:", error);
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
    getReactions,
    upload
};
