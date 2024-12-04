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
        url: 'https://harmony-api2.azurewebsites.net',
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
      }
    ],
  },
  apis: [
    'src/routes/questionRoutes.js',
    'src/routes/authRoutes.js',
    'src/routes/groupRoutes.js'
  ],
};

const specs = swaggerJsdoc(options);

module.exports = specs;