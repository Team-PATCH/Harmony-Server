const Sequelize = require('sequelize');

class ProvideQuestion extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        pqid: {
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true, // auto-increment 추가
        },
        question: {
          type: Sequelize.STRING(50),
          allowNull: false,
        },
      },
      {
        sequelize,
        timestamps: true,
        paranoid: true,
        modelName: 'ProvideQuestion',
        tableName: 'provideQuestion',
      }
    );
  }

  static associate(db) {
  }
}

module.exports = ProvideQuestion;