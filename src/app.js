const sync = require('./models/sync');
sync();

const express = require('express');
const morgan = require('morgan');
const dotenv = require('dotenv');
dotenv.config();

const db = require('./models');

const mcRouter = require('./routes/mcRoutes');
const questionRouter = require('./routes/questionRoutes');

const app = express();
const port = process.env.PORT;

console.log('PORT:', process.env.PORT);


app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/mc', mcRouter);
app.use('/qc', questionRouter);

app.get('/', (req, res) => {
  res.send('엔드포인트임 이게 나온다면 뭔가 문제가 있다')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})