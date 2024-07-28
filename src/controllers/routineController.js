const Routine = require("../models/routine")
const DailyRoutine = require("../models/dailyRoutine")
const RoutineReaction = require("../models/routionReaction")
const dayjs = require("dayjs");

// 일과 목록을 가져오는 함수
const getRoutines = async (req, res) => {
    try {
        const routines = await Routine.findAll({
            order: [["id", "ASC"]],
        });
        console.log("Retrieved routines:", routines);
        
        if (!routines || routines.length === 0) {
            console.log("No routines found in the database");
            return res.status(404).json({ message: "No routines found" });
        }
        res.json(routines);
    } catch (error) {
        console.error("Error in getRoutines:", error);
        res.status(500).json({ message: error.message });
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
                    routineId: newRoutine.id
                });
            }
        }

        res.status(201).json(newRoutine);
    } catch (error) {
        console.error("Error in createRoutine:", error);
        res.status(500).json({ message: error.message });
    }
};

// 특정 일과의 DailyRoutine 목록을 가져오는 함수
const getDailyRoutines = async (req, res) => {
    try {
        const { routineId } = req.params;
        const dailyRoutines = await DailyRoutine.findAll({
            where: { routineId },
            order: [["date", "ASC"]],
        });
        console.log("Retrieved daily routines:", dailyRoutines);
        if (!dailyRoutines || dailyRoutines.length === 0) {
            console.log("No daily routines found for the given routine ID");
            return res.status(404).json({ message: "No daily routines found" });
        }
        res.json(dailyRoutines);
    } catch (error) {
        console.error("Error in getDailyRoutines:", error);
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getRoutines,
    createRoutine,
    getDailyRoutines
};
