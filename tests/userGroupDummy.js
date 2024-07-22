const { sequelize } = require('../src/models');
const UserGroup = require('../src/models/userGroup');
const User = require('../src/models/user');
const Group = require('../src/models/group');
const Permission = require('../src/models/permission');

async function createUserGroups() {
  try {
    console.log('Fetching existing data...');
    const users = await User.findAll();
    const groups = await Group.findAll();
    const permissions = await Permission.findAll();

    console.log('Users:', users.map(u => u.toJSON()));
    console.log('Groups:', groups.map(g => g.toJSON()));
    console.log('Permissions:', permissions.map(p => p.toJSON()));

    const userGroups = [
      {
        userId: 'yeojeong@naver.com',
        permissionId: 'v', // 'v' (VIP)
        groupId: 1,  // 정수형으로 변경
        alias: '할머니 윤여정',
        deviceToken: 'token123'
      },
      {
        userId: 'user2@example.com',
        permissionId: 'm', // 'm' (Member)
        groupId: 1,  // 정수형으로 변경
        alias: '손자 최우식',
        deviceToken: 'token456'
      },
    ];

    console.log('Creating UserGroups...');
    for (const userGroup of userGroups) {
      try {
        const createdUserGroup = await UserGroup.create(userGroup);
        console.log('Created UserGroup:', createdUserGroup.toJSON());
      } catch (error) {
        console.error('Error creating UserGroup:', error);
        console.error('UserGroup data:', userGroup);
      }
    }

    console.log('UserGroups created successfully.');

    // 생성된 UserGroup 확인
    const createdUserGroups = await UserGroup.findAll({
      include: [User, Group, Permission]
    });
    console.log('All UserGroups:', JSON.stringify(createdUserGroups, null, 2));

  } catch (error) {
    console.error('Error in createUserGroups:', error);
  } finally {
    await sequelize.close();
  }
}

createUserGroups();