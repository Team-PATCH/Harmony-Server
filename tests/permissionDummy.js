const { sequelize } = require('../src/models');
const Permission = require('../src/models/permission');

async function insertPermissions() {
  try {
    // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.
    // await sequelize.sync({ force: true });

    const permissions = [
      { permissionId: 'v', name: 'VIP' },
      { permissionId: 'm', name: 'Member' },
      { permissionId: 'a', name: 'Admin' },
    ];

    for (const perm of permissions) {
      await Permission.create(perm);
    }

    console.log('Permissions inserted successfully.');

    // 삽입된 데이터 확인
    const insertedPermissions = await Permission.findAll();
    console.log('Inserted permissions:', insertedPermissions.map(p => p.toJSON()));

  } catch (error) {
    console.error('Error inserting permissions:', error);
  } finally {
    await sequelize.close();
  }
}

insertPermissions();