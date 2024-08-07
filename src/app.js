// const sync = require('./models/sync');
// sync();

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cron = require('node-cron');
const dayjs = require("dayjs");
const utc = require("dayjs/plugin/utc");
const timezone = require("dayjs/plugin/timezone");
const { createDailyRoutines } = require('./controllers/dailyRoutineController');
const bodyParser = require('body-parser'); // 추가된 부분
dotenv.config();

const db = require('./models');

const authMiddleware = require('./middleware/auth');
const userRouter = require('./routes/userRoutes');
const groupRouter = require('./routes/groupRoutes')
const mcRouter = require('./routes/mcRoutes');
const questionRouter = require('./routes/questionRoutes');
const routineRouter = require('./routes/routineRoutes');
const dailyRoutineRouter = require('./routes/dailyRoutineRoutes');

const { setupCronJobs } = require('./controllers/questionController');
const apnsController = require('./utils/apn');

const app = express();
const port = process.env.PORT;

console.log('PORT:', process.env.PORT);

app.use(morgan('dev'));
app.use(bodyParser.json()); // 추가된 부분
app.use(bodyParser.urlencoded({ extended: true })); // 추가된 부분
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/user', userRouter);
app.use((req, res, next) => {
  if (req.method === 'PUT') {
    console.log('PUT request body:', req.body);
  }
  next();
});


// app.use(authMiddleware.verifyToken);

app.use('/group', groupRouter);
app.use('/mc', mcRouter);
app.use('/qc', questionRouter);
app.use('/routine', routineRouter);
app.use('/dailyroutine', dailyRoutineRouter);

app.get('/', (req, res) => {
  res.send('엔드포인트임 이게 나온다면 뭔가 문제가 있다');
});

// cron 작업 설정
setupCronJobs();

process.on('SIGINT', () => {
  console.log('서버를 종료합니다...');
  apnsController.shutdown();
  process.exit();
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});

// 플러그인 사용 설정
dayjs.extend(utc);
dayjs.extend(timezone);

// 매시간마다 자정을 확인하고 데일리 일과 생성
<<<<<<< HEAD
// cron.schedule('0 * * * *', async () => {
//   const now = dayjs().tz("Asia/Seoul");
//   if (now.hour() === 0) { // 한국 표준시 기준 자정 확인
//     console.log('Running daily routine creation job at midnight KST');
//     await createDailyRoutines();
//   }
// });

// // 매일 오전 11시 58분에 데일리 일과 생성 - 테스트용, 테스트 완료 이후 삭제
// const cronExpression = '24 15 * * *';

// // 특정 시간에 데일리 일과 생성
// cron.schedule(cronExpression, async () => {
//   console.log('Running daily routine creation job at 15:10 KST');
//   await createDailyRoutines();
// });
=======
cron.schedule('0 * * * *', async () => {
  const now = dayjs().tz("Asia/Seoul");
  if (now.hour() === 0) { // 한국 표준시 기준 자정 확인
    console.log('Running daily routine creation job at midnight KST');
    await createDailyRoutines();
  }
});
>>>>>>> 08d1981 ([Chore] 주석 코드 제거)
