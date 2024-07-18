const Sequelize = require('sequelize');

class Permission extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        permissionId: {
          type: Sequelize.CHAR(1),
          allowNull: false,
          primaryKey: true,
        },
        name: {
          type: Sequelize.CHAR(10),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'Permission',
        tableName: 'permission',
      }
    );
  }

  static associate(db) {
    db.Permission.hasMany(db.UserGroup, { foreignKey: 'permissionId', sourceKey: 'permissionId' });
  }
}

module.exports = Permission;