const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.STRING(100),
          allowNull: false,
          primaryKey: true,
        },
        nick: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        profile: {
          type: Sequelize.STRING(200),
          allowNull: true,
        },
        authProvider: {
          type: Sequelize.ENUM('kakao', 'apple'),
          allowNull: false,
        },
        socialToken: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        refreshToken: {
          type: Sequelize.STRING(300),
          allowNull: true,
        },
        socialTokenExpiredAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },
        lastLoginAt: {
          type: Sequelize.DATE,
          allowNull: true,
        },

      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'User',
        tableName: 'user',
      }
    );
  }

  static associate(db) {
    db.User.hasMany(db.UserGroup, { foreignKey: 'userId', sourceKey: 'userId' });
  }
}

module.exports = User;