const Sequelize = require('sequelize');

class Group extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        groupId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // auto-increment 추가
        },
        name: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
        inviteUrl: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        vipInviteUrl: {
          type: Sequelize.STRING(200),
          allowNull: false,
        },
        vipId: {
          type: Sequelize.STRING(50),
          allowNull: true,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Group',
        tableName: 'group',
      }
    );
  }

  static associate(db) {
    db.Group.hasMany(db.UserGroup, { foreignKey: 'groupId', sourceKey: 'groupId' });
  }
}

module.exports = Group;