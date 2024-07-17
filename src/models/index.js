const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/database.js')[env];
const db = {};
let sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// const User = require('./user.js');

// db.User = User;

// User.init(sequelize);

// User.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
