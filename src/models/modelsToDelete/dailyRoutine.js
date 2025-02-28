const { Sequelize } = require('sequelize');

class DailyRoutine extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        dailyId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // 자동 증가 설정
        },
        routineId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        time: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        completedPhoto: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        completedTime: {
          type: Sequelize.DATE,
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'DailyRoutine',
        tableName: 'dailyroutine',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    db.DailyRoutine.belongsTo(db.Routine, {
      foreignKey: 'routineId',
      targetKey: 'routineId',
    });
    db.DailyRoutine.hasMany(db.RoutineReaction, {
        foreignKey: 'dailyId',
        sourceKey: 'dailyId',
    })
  }
}

module.exports = DailyRoutine;