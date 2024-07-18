const { Sequelize } = require('sequelize');

class ChatSession extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        chatId: {
          type: Sequelize.STRING(100),
          allowNull: false,
          primaryKey: true,
          defaultValue: '채팅세션(chat 스레드)', // 기본값 설정
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
        paranoid: true, // deletedAt 필드 사용
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