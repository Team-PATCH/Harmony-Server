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
const MemoryCard = require('./memoryCard.js')
const Tag = require('./tag.js')
const ChatSession = require('./chatSession.js')
const ChatMessage = require('./chatMessage.js')
const Routine = require('./routine.js')
const DailyRoutine = require('./dailyRoutine.js')
const RoutineReaction = require('./routionReaction.js')


db.User = User;
db.Permission = Permission;
db.Group = Group;
db.UserGroup = UserGroup;
db.ProvideQuestion = ProvideQuestion;
db.Question = Question;
db.Comment = Comment;
db.MemoryCard = MemoryCard;
db.Tag = Tag;
db.ChatSession = ChatSession;
db.ChatMessage = ChatMessage;
db.Routine = Routine;
db.DailyRoutine = DailyRoutine;
db.RoutineReaction = RoutineReaction;

User.init(sequelize);
Permission.init(sequelize);
Group.init(sequelize);
UserGroup.init(sequelize);
ProvideQuestion.init(sequelize);
Question.init(sequelize);
Comment.init(sequelize);
MemoryCard.init(sequelize);
Tag.init(sequelize);
ChatSession.init(sequelize);
ChatMessage.init(sequelize);
Routine.init(sequelize);
DailyRoutine.init(sequelize);
RoutineReaction.init(sequelize);

User.associate(db);
Permission.associate(db);
Group.associate(db);
UserGroup.associate(db);
Question.associate(db);
Comment.associate(db);
MemoryCard.associate(db);
Tag.associate(db);
ChatSession.associate(db);
ChatMessage.associate(db);
Routine.associate(db);
DailyRoutine.associate(db);
RoutineReaction.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
