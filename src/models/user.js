const Sequelize = require('sequelize');

class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        userId: {
          type: Sequelize.STRING(50),
          allowNull: false,
          primaryKey: true,
        },
        password: {
          type: Sequelize.STRING(160),
          allowNull: false,
        },
        nick: {
          type: Sequelize.STRING(10),
          allowNull: false,
        },
        profile: {
          type: Sequelize.STRING(200),
          allowNull: false,
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