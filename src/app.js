// const sync = require('./models/sync');
// sync();

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cron = require('node-cron');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");

const { createDailyRoutines } = require('./controllers/routineController');
dotenv.config();

const db = require('./models');

const authMiddleware = require('./middleware/auth');
const userRouter = require('./routes/userRoutes');
const mcRouter = require('./routes/mcRoutes');
const questionRouter = require('./routes/questionRoutes');
const routineRouter = require('./routes/routineRoutes');
const dailyRoutineRouter = require('./routes/dailyRoutineRoutes');

const app = express();
const port = process.env.PORT;

console.log('PORT:', process.env.PORT);


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads')); // uploads 폴더를 정적 파일로 제공
app.use('/user', userRouter);

app.use(authMiddleware.verifyToken);

app.use('/mc', mcRouter);
app.use('/qc', questionRouter);
app.use('/routine', routineRouter)
app.use('/dailyroutine', dailyRoutineRouter)

app.get('/', (req, res) => {
  res.send('엔드포인트임 이게 나온다면 뭔가 문제가 있다')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})

// 플러그인 사용 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 매시간마다 자정을 확인하고 데일리 일과 생성
cron.schedule('0 * * * *', async () => {
  const now = dayjs().tz("Asia/Seoul");
  if (now.hour() === 0) { // 한국 표준시 기준 자정 확인
    console.log('Running daily routine creation job at midnight KST');
    await createDailyRoutines();
  }
});

// // 매일 오후 2시 56분에 데일리 일과 생성 - 테스트용, 테스트 완료 이후 삭제
// const cronExpression = '56 14 * * *';

// console.log('Scheduled job will run daily at 14:56 KST');

// // 특정 시간에 데일리 일과 생성
// cron.schedule(cronExpression, async () => {
//   console.log('Running daily routine creation job at 14:56 KST');
//   await createDailyRoutines();
// });

