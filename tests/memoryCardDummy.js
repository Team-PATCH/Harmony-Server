const { sequelize } = require('../src/models');
const MemoryCard = require('../src/models/memoryCard');
const Group = require('../src/models/group');
const Tag = require('../src/models/tag');  // Tag 모델 추가

async function createMemoryCards() {
  try {
    console.log('Fetching existing groups...');
    const groups = await Group.findAll();
    console.log('Groups:', groups.map(g => g.toJSON()));

    if (groups.length === 0) {
      throw new Error('No groups found. Please create some groups first.');
    }

    const memoryCards = [
      {
        groupId: groups[0].groupId,
        title: "첫 번째 추억",
        year: "2011",
        image: "https://img.freepik.com/free-photo/beautiful-tropical-beach_74190-1327.jpg",
        summary: "첫 번째 추억의 요약입니다.",
        tags: ["추억", "여름"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "두 번째 추억",
        year: "2012",
        image: "https://cdn.crowdpic.net/detail-thumb/thumb_d_2F583E5543F7E19139C6FCFFBF9607A6.jpg",
        summary: "두 번째 추억의 요약입니다.",
        tags: ["여행", "가족"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "세 번째 추억",
        year: "2013",
        image: "https://cdn.vdcm.co.kr/news/photo/201803/4538_13153_5736.jpg",
        summary: "세 번째 추억의 요약입니다.",
        tags: ["봄", "꽃"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "네 번째 추억",
        year: "2014",
        image: "https://previews.123rf.com/images/pixeleurope/pixeleurope1206/pixeleurope120600030/14157998-%EC%97%AC%EB%A6%84-%ED%92%8D%EA%B2%BD.jpg",
        summary: "네 번째 추억의 요약입니다.",
        tags: ["해변", "바다"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "다섯 번째 추억",
        year: "2015",
        image: "https://c0.wallpaperflare.com/preview/189/978/520/austria-innsbruck-forest-mountains.jpg",
        summary: "다섯 번째 추억의 요약입니다.",
        tags: ["산", "등산"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "여섯 번째 추억",
        year: "2016",
        image: "https://osmanias.com/files/attach/images/173/597/480/002/63b992dc33e19d7c5ef8d697bc9c995b.jpg",
        summary: "여섯 번째 추억의 요약입니다.",
        tags: ["겨울", "눈"]  // 태그 추가
      },
      {
        groupId: groups[0].groupId,
        title: "일곱 번째 추억",
        year: "2017",
        image: "https://cdn.pixabay.com/video/2018/02/19/14385-256955049_tiny.jpg",
        summary: "일곱 번째 추억의 요약입니다.",
        tags: ["도시", "야경"]  // 태그 추가
      }
    ];

    for (const memoryCard of memoryCards) {
      const createdMemoryCard = await MemoryCard.create(memoryCard);

      // Tag 생성
      for (const tagName of memoryCard.tags) {
        await Tag.create({
          mcId: createdMemoryCard.mcId,
          groupId: createdMemoryCard.groupId,
          name: tagName
        });
      }
    }

    console.log('MemoryCards created successfully.');

    // 생성된 MemoryCard 및 관련 Tag 확인
    const createdMemoryCards = await MemoryCard.findAll({ include: [Tag] });
    console.log('Created MemoryCards:', createdMemoryCards.map(mc => mc.toJSON()));

  } catch (error) {
    console.error('Error creating MemoryCards:', error);
  } finally {
    await sequelize.close();
  }
}

createMemoryCards();
