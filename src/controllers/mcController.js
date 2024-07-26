// controllers/mcController.js
const APNsController = require('../utils/apn');
const apns = new APNsController();

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