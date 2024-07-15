// controllers/mcController.js

const getMemoryCards = (req, res) => {
    // 더미 데이터 생성
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

module.exports = {
    getMemoryCards
};