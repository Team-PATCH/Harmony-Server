// const sync = require('./models/sync');
// sync();

const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const morgan = require('morgan');

const app = express();
const port = process.env.PORT;

console.log('PORT:', process.env.PORT);

// const mcRouter = require('./routers/');

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use('/mc', mcRouter)


app.get('/', (req, res) => {
  res.send('엔드포인트임 이게 나온다면 뭔가 문제가 있다')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})