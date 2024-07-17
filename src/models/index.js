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

const User = require('./user.js');
const Group = require('./group.js');
const Permission = require('./permission.js');
const UserGroup = require('./userGroup.js');
const ProvideQuestion = require('./provideQuestion.js')
const Question = require('./question.js')
const Comment = require('./comment.js')



db.User = User;
db.Permission = Permission;
db.Group = Group;
db.UserGroup = UserGroup;
db.ProvideQuestion = ProvideQuestion;
db.Question = Question;
db.Comment = Comment;

User.init(sequelize);
Permission.init(sequelize);
Group.init(sequelize);
UserGroup.init(sequelize);
ProvideQuestion.init(sequelize);
Question.init(sequelize);
Comment.init(sequelize);

User.associate(db);
Permission.associate(db);
Group.associate(db);
UserGroup.associate(db);
Question.associate(db);
Comment.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
