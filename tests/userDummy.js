const { sequelize } = require('../src/models');
const User = require('../src/models/user');
const argon = require('argon2');

async function createUsers() {
  try {
    // await sequelize.sync({ force: true }); // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.

    const saltRounds = 10;
    const users = [
      {
        userId: 'yeojeong@naver.com',
        password: await argon.hash('password123', saltRounds),
        nick: '윤여정',
        profile: 'profile.png',
      },
      {
        userId: 'user2@example.com',
        password: await argon.hash('password456', saltRounds),
        nick: '최우식',
        profile: 'profile2.png',
      },
    ];

    for (const user of users) {
      await User.create(user);
    }

    console.log('Users created successfully.');

    // 생성된 사용자 확인
    const createdUsers = await User.findAll({
      attributes: ['userId', 'nick', 'profile'] // 비밀번호는 제외
    });
    console.log('Created users:', createdUsers.map(u => u.toJSON()));

  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await sequelize.close();
  }
}

createUsers();