const Sequelize = require('sequelize');

class Question extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        questionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // auto-increment 추가
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        question: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        answer: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        askedAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        answeredAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Question',
        tableName: 'question',
      }
    );
  }

  static associate(db) {
    db.Question.belongsTo(db.Group, { foreignKey: 'groupId', targetKey: 'groupId' });
    // db.Question.hasMany(db.Comment, { foreignKey: 'groupId', sourceKey: 'groupId'});
    db.Question.hasMany(db.Comment, { foreignKey: ['questionId','groupId'], sourceKey: ['questionId','groupId']});
  }
}

module.exports = Question;