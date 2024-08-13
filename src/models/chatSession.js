const { Sequelize } = require('sequelize');
const { v4: uuidv4 } = require('uuid');

class ChatSession extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        chatId: {
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        mcId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
      },
      {
        sequelize,
        modelName: 'ChatSession',
        tableName: 'chatsession',
        timestamps: true,
        paranoid: true,
      }
    );
  }

  static associate(db) {
    db.ChatSession.belongsTo(db.MemoryCard, {
      foreignKey: 'mcId',
      targetKey: 'mcId'
    });
    db.ChatSession.hasMany(db.ChatMessage, {
        foreignKey: 'chatId', sourceKey: 'chatId'
    })
  }
}

module.exports = ChatSession;