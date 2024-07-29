const { sequelize } = require('../src/models');
const User = require('../src/models/user');

async function createUsers() {
  try {
    // await sequelize.sync({ force: true }); // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.

    const users = [
      {
        userId: 'yeojeong@naver.com', // 카카오 ID 예시
        nick: '윤여정',
        profile: 'profile.png',
        authProvider: 'kakao',
        socialToken: 'kakao_social_token_example',
        refreshToken: 'kakao_refresh_token_example',
        socialTokenExpiredAt: new Date(Date.now() + 3600000), // 1시간 후 만료
        lastLoginAt: new Date(),
      },
      {
        userId: 'user2@example.com', // 애플 이메일 예시
        nick: '최우식',
        profile: 'profile2.png',
        authProvider: 'apple',
        socialToken: 'apple_social_token_example',
        refreshToken: null, // 애플은 리프레시 토큰이 없음
        socialTokenExpiredAt: null, // 애플은 만료 시간이 없음
        lastLoginAt: new Date(),
      },
    ];

    for (const user of users) {
      await User.create(user);
    }

    console.log('Users created successfully.');

    // 생성된 사용자 확인
    const createdUsers = await User.findAll({
      attributes: ['userId', 'nick', 'profile', 'authProvider', 'lastLoginAt'] // 민감한 정보 제외
    });
    console.log('Created users:', createdUsers.map(u => u.toJSON()));
  } catch (error) {
    console.error('Error creating users:', error);
  } finally {
    await sequelize.close();
  }
}

createUsers();