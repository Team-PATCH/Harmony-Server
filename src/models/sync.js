// const { sequelize } = require('./index.js');

// const sync = () => {
//   sequelize
//     .sync({ force: true, alter: true })
//     .then(() => console.log('데이터베이스 생성완료'))
//     .catch((error) => {
//       console.log(error);
//     });
// };

// module.exports = sync;


const { sequelize, Permission } = require('./index.js');

const sync = async () => {
  try {
    // 데이터베이스 동기화
    await sequelize.sync({ force: true, alter: true });
    
    // Permission 초기 데이터 생성
    await Permission.bulkCreate([
      { permissionId: 'v', name: 'VIP' },
      { permissionId: 'm', name: 'Member' }
    ]);
    
    console.log('데이터베이스 생성 및 초기 데이터 설정 완료');
  } catch (error) {
    console.error('데이터베이스 동기화 에러:', error);
  }
};

module.exports = sync;