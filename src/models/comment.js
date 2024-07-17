const Sequelize = require('sequelize');

class Comment extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        commentId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        questionId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        content: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Comment',
        tableName: 'comment',
      }
    );
  }

  static associate(db) {
    // db.Comment.belongsTo(db.Question, { foreignKey: 'groupId', targetKey: 'groupId'});
    db.Comment.belongsTo(db.Question, { foreignKey: ['questionId', 'groupId'], targetKey: ['questionId', 'groupId']});
  }
}

module.exports = Comment;