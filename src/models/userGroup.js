const Sequelize = require('sequelize');

class UserGroup extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        ugId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        userId: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
        permissionId: {
          type: Sequelize.CHAR(1),
          allowNull: false,
        },
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        alias: {
          type: Sequelize.STRING(10),
          allowNull: true,
        },
        deviceToken: {
          type: Sequelize.STRING(30),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'UserGroup',
        tableName: 'usergroup',
      }
    );
  }

  static associate(db) {
    db.UserGroup.belongsTo(db.User, { foreignKey: 'userId', targetKey: 'userId' });
    db.UserGroup.belongsTo(db.Permission, { foreignKey: 'permissionId', targetKey: 'permissionId' });
    db.UserGroup.belongsTo(db.Group, { foreignKey: 'groupId', targetKey: 'groupId' });
  }
}

module.exports = UserGroup;