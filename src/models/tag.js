const { Sequelize } = require('sequelize');

class Tag extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        tagId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // 자동 증가 설정
        },
        mcId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        name: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'Tag',
        tableName: 'tag',
        timestamps: true,
        updatedAt: false, // updatedAt 필드 비활성화
      }
    );
  }

  static associate(db) {
    db.Tag.belongsTo(db.MemoryCard, {
      foreignKey: 'mcId',
      targetKey: 'mcId'
    });
  }
}

module.exports = Tag;