const { Sequelize } = require('sequelize');

class MemoryCard extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        mcId: {
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
        year: {
          type: Sequelize.DATE,
          allowNull: false,
        },
        image: {
          type: Sequelize.STRING(1000),
          allowNull: false,
        },
        summary: {
          type: Sequelize.STRING(1000),
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'MemoryCard',
        tableName: 'memorycard',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    db.MemoryCard.belongsTo(db.Group, {
      foreignKey: 'groupId',
      targetKey: 'groupId'
    });
    db.MemoryCard.hasOne(db.ChatSession, { foreignKey: 'mcId', sourceKey: 'mcId'})
    db.MemoryCard.hasMany(db.Tag, { foreignKey: 'mcId', sourceKey: 'mcId'})
  }
}

module.exports = MemoryCard;