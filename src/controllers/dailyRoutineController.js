const Routine = require("../models/routine");
const DailyRoutine = require("../models/dailyRoutine");
const RoutineReaction = require("../models/routionReaction");
const UserGroup = require("../models/userGroup");
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { Op } = require("sequelize");
const upload = require("../utils/uploadImage");
const dotenv = require('dotenv');
const { notifyVIPRoutineCompletion } = require('./notificationController');
const { notifyNewRoutineReaction } = require('./notificationController');
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
                message: "오늘의 일일 루틴을 찾을 수 없습니다"
            });
        }

        res.json({
            status: true,
            data: dailyRoutines,
            message: "오늘의 일일 루틴을 성공적으로 조회했습니다"
        });
    } catch (error) {
        console.error("getTodayDailyRoutines 오류:", error);
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
            const routineTime = dayjs(today.format('YYYY-MM-DD') + ' ' + routine.time).tz("Asia/Seoul").toDate();

            await DailyRoutine.create({
                routineId: routine.routineId,
                groupId: routine.groupId,
                time: routineTime,
                completedPhoto: null,
                completedTime: null
            });
        }
    } catch (error) {
        console.error("createDailyRoutines 오류:", error);
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
                message: "일일 루틴을 찾을 수 없습니다"
            });
        }

        const completedPhoto = req.filename ? `${process.env.AZURE_BLOB_BASE_URL}${req.filename}` : null;
        dailyRoutine.completedPhoto = completedPhoto;
        dailyRoutine.completedTime = dayjs().tz("Asia/Seoul").toDate();

        await dailyRoutine.save();
        console.log("인증된 일일 루틴:", dailyRoutine);

        //일과달성 알림 발송
        await notifyVIPRoutineCompletion(dailyRoutine);
        

        res.json({
            status: true,
            data: dailyRoutine,
            message: "일일 루틴이 성공적으로 인증되었습니다"
        });
    } catch (error) {
        console.error("provingDailyRoutine 오류:", error);
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
                message: "일일 루틴을 찾을 수 없습니다"
            });
        }

        const photo = req.filename ? `${process.env.AZURE_BLOB_BASE_URL}${req.filename}` : null;
        console.log("사진:", photo)

        const reaction = await RoutineReaction.create({
            dailyId,
            routineId,
            groupId,
            authorId,
            photo,
            comment
        });

        //리액션 알림 발송
        await notifyNewRoutineReaction(reaction, dailyRoutine);

        res.json({
            status: true,
            data: reaction,
            message: "리액션이 성공적으로 추가되었습니다"
        });
    } catch (error) {
        console.error("addReaction 오류:", error);
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
                message: "이 일일 루틴에 대한 리액션을 찾을 수 없습니다"
            });
        }

        res.json({
            status: true,
            data: reactions,
            message: "리액션이 성공적으로 조회되었습니다"
        });
    } catch (error) {
        console.error("getReactions 오류:", error);
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