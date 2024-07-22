const { sequelize } = require('../src/models');
const Group = require('../src/models/group');

async function createGroups() {
  try {
    // await sequelize.sync({ force: true }); // 주의: 이 옵션은 테이블을 재생성합니다. 프로덕션에서는 사용하지 마세요.

    const groups = [
      {
        name: '멋진 할매 윤여정',
        inviteUrl: 'https://example.com/invite/study',
        vipInviteUrl: 'https://example.com/vip-invite/study',
        vipId: 'yeojeong@naver.com'
      },
    ];

    for (const group of groups) {
      await Group.create(group);
    }

    console.log('Groups created successfully.');

    // 생성된 그룹 확인
    const createdGroups = await Group.findAll();
    console.log('Created groups:', createdGroups.map(g => g.toJSON()));

  } catch (error) {
    console.error('Error creating groups:', error);
  } finally {
    await sequelize.close();
  }
}

createGroups();