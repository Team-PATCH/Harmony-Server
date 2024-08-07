const { Sequelize } = require('sequelize');

class ChatMessage extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        messageId: {
          type: Sequelize.BIGINT,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // 자동 증가 설정
        },
        chatId: {
          type: Sequelize.UUID,
          allowNull: false,
        },
        mcId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        content: {
          type: Sequelize.STRING(1000),
          allowNull: false,
        },
        voice: {
          type: Sequelize.STRING(1000),
          allowNull: true,
        },
        role: {
          type: Sequelize.STRING(100),  // STRING 타입으로 변경, 길이는 필요에 따라 조정 가능
          allowNull: true,
        },
      },
      {
        sequelize,
        modelName: 'ChatMessage',
        tableName: 'chatmessage',
        timestamps: true,
        updatedAt: false,
      }
    );
  }

  static associate(db) {
    db.ChatMessage.belongsTo(db.ChatSession, {
      foreignKey: 'chatId',
      targetKey: 'chatId'
    });
  }
}

module.exports = ChatMessage;