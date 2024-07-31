// controllers/mcController.js

// const APNsController = require('../utils/apn');
// const apns = new APNsController();

//윗 두줄을 밑에 한줄로 바꿔쓰시면 됩니다:
/*
const apnsController = require('../utils/apn');

const getMemoryCards = (req, res) => {
    // 더미 데이터 생성
    apns.sendNotification('안녕하세요 이건 얼럿부분','이건 페이로드 부분이죠', '326041e35c59c1335bcb4071efbfa307afda190db88873432db30776443b2518')
    .then(result => {
        console.log('알림 전송 성공:', result);
      })
      .catch(error => {
        console.error('알림 전송 실패:', error);
      }); 
    const memoryCards = [
        {
            memorycardId: 1,
            title: "첫 번째 추억",
            dateTime: "2023-07-15T10:30:00Z",
            image: "https://example.com/image1.jpg"
        },
        {
            memorycardId: 2,
            title: "두 번째 추억",
            dateTime: "2023-07-16T14:45:00Z",
            image: "https://example.com/image2.jpg"
        }
    ];

    // 응답 객체 생성
    const response = {
        status: true,
        data: memoryCards,
        message: "메모리 카드를 성공적으로 불러왔습니다."
    };

    // 응답 전송
    res.json(response);
};

const getMemoryCardById = (req, res) => {
    const memorycardId = parseInt(req.params.memorycardId);

    // 더미 데이터 (실제 구현에서는 데이터베이스에서 조회해야 합니다)
    const memoryCard = {
        memorycardId: memorycardId,
        title: "특별한 추억",
        dateTime: "2023-07-20T15:30:00Z",
        tag: ["가족", "여행", "여름"],
        image: "https://example.com/special_memory.jpg",
        description: "가족과 함께한 즐거운 여름 휴가의 추억입니다."
    };

    // memorycardId가 유효한지 확인 (여기서는 간단히 1 이상인지만 체크)
    if (memorycardId && memorycardId > 0) {
        const response = {
            status: true,
            ...memoryCard,
            message: "메모리 카드를 성공적으로 불러왔습니다."
        };
        res.json(response);
    } else {
        const response = {
            status: false,
            message: "유효하지 않은 메모리 카드 ID입니다."
        };
        res.status(404).json(response);
    }
};


module.exports = {
    getMemoryCards
    ,getMemoryCardById
};
*/

/*
const apnsController = require('../utils/apn');
const { MemoryCard, Tag } = require('../models');
const { Op } = require('sequelize');

// 추억카드 목록 조회
const getMemoryCards = async (req, res) => {
  try {
    const memoryCards = await MemoryCard.findAll({
      order: [['createdAt', 'DESC']],
      include: [{ model: Tag }]
    });

    if (!memoryCards || memoryCards.length === 0) {
      return res.status(404).json({
        status: false,
        data: [],
        message: "No memory cards found"
      });
    }

    res.json({
      status: true,
      data: memoryCards,
      message: "Memory cards retrieved successfully"
    });
  } catch (error) {
    console.error("Error in getMemoryCards:", error);
    res.status(500).json({
      status: false,
      data: [],
      message: error.message
    });
  }
};

// 추억카드 개별 조회
const getMemoryCardById = async (req, res) => {
  try {
    const { mcId } = req.params;
    
    const memoryCard = await MemoryCard.findByPk(mcId, {
      include: [{ model: Tag }]
    });

    if (!memoryCard) {
      return res.status(404).json({
        status: false,
        data: null,
        message: "Memory card not found"
      });
    }

    res.json({
      status: true,
      data: memoryCard,
      message: "Memory card retrieved successfully"
    });
  } catch (error) {
    console.error("Error in getMemoryCardById:", error);
    res.status(500).json({
      status: false,
      data: null,
      message: error.message
    });
  }
};

module.exports = {
  getMemoryCards,
  getMemoryCardById
};
*/

const { MemoryCard, Tag } = require('../src/models');

const getMemoryCards = async (req, res) => {
  try {
    const memoryCards = await MemoryCard.findAll({
      include: [Tag],
      order: [['createdAt', 'DESC']]
    });

    if (!memoryCards || memoryCards.length === 0) {
      return res.status(404).json({
        status: false,
        data: [],
        message: "No memory cards found"
      });
    }

    const response = {
      status: true,
      data: memoryCards.map(card => ({
        memorycardId: card.mcId,
        title: card.title,
        dateTime: card.createdAt,
        image: card.image,
        tags: card.Tags.map(tag => tag.name)
      })),
      message: "Memory cards retrieved successfully"
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getMemoryCards:", error);
    res.status(500).json({
      status: false,
      data: [],
      message: error.message
    });
  }
};

const getMemoryCardById = async (req, res) => {
  const memorycardId = parseInt(req.params.memorycardId);

  try {
    const memoryCard = await MemoryCard.findOne({
      where: { mcId: memorycardId },
      include: [Tag]
    });

    if (!memoryCard) {
      return res.status(404).json({
        status: false,
        message: 'Memory card not found'
      });
    }

    const response = {
      status: true,
      memorycardId: memoryCard.mcId,
      title: memoryCard.title,
      dateTime: memoryCard.createdAt,
      tags: memoryCard.Tags.map(tag => tag.name),
      image: memoryCard.image,
      description: memoryCard.summary,
      message: "Memory card retrieved successfully"
    };

    res.json(response);
  } catch (error) {
    console.error("Error in getMemoryCardById:", error);
    res.status(500).json({
      status: false,
      message: 'Failed to fetch memory card'
    });
  }
};

module.exports = {
  getMemoryCards,
  getMemoryCardById
};
