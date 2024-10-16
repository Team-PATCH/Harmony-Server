const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'My API',
      version: '0.0.0',
      description: 'API documentation for My Project',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Question',
        description: 'API endpoints for question operations',
      },
      {
        name: 'User',
        description: 'API endpoints for user operations',
      },
      {
        name: 'Group',
        description: 'API endpoints for group operations',
      },
      {
        name: 'MC',
        description: 'API endpoints for MC operations',
      },
      {
        name: 'Routine',
        description: 'API endpoints for routine operations',
      },
      {
        name: 'DailyRoutine',
        description: 'API endpoints for daily routine operations',
      },
    ],
  },
  apis: [
    'src/routes/*.js', //모든 라우트 파일을 포함
    //또는 개별 지정
    // './routes/questionRoutes.js',
    // './routes/userRoutes.js',
    // './routes/groupRoutes.js',
    // './routes/mcRoutes.js',
    // './routes/routineRoutes.js',
    // './routes/dailyRoutineRoutes.js'
  ], // 모든 라우트 파일 포함
};

const specs = swaggerJsdoc(options);

module.exports = specs;