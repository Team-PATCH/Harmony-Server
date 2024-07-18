const { Sequelize } = require("sequelize");

class RoutineReaction extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        rrId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // 자동 증가 설정
        },
        dailyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        routineId: {
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
        photo: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        comment: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: "RoutineReaction",
        tableName: "routinereaction",
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    db.RoutineReaction.belongsTo(db.DailyRoutine, {
      foreignKey: "dailyId",
      targetKey: "dailyId",
    });
  }
}

module.exports = RoutineReaction;
