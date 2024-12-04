const { Sequelize } = require('sequelize');

class Routine extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        routineId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // 자동 증가 설정
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        title: {
          type: Sequelize.STRING(20),
          allowNull: false,
        },
        days: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        time: {
          type: Sequelize.TIME,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Routine',
        tableName: 'routine',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    db.Routine.belongsTo(db.Group, {
      foreignKey: 'groupId',
      targetKey: 'groupId',
    });
    db.Routine.hasMany(db.DailyRoutine, {
        foreignKey: 'routineId',
        sourceKey: 'routineId',
    })
  }
}

module.exports = Routine;