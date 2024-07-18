const Sequelize = require("sequelize");

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
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        authorId: {
          type: Sequelize.STRING(50),
          allowNull: false,
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
        modelName: "Comment",
        tableName: "comment",
      }
    );
  }

  static associate(db) {
    db.Comment.belongsTo(db.Question, {
      foreignKey: "questionId",
      targetKey: "questionId",
    });
  }
}

module.exports = Comment;
