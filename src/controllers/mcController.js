const { MemoryCard, Tag, Group } = require('../models');
const { generateTags } = require('../services/azureAIService');
const upload = require('../utils/uploadImage');
const dotenv = require('dotenv');
dotenv.config();

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

const createMemoryCard = async (req, res) => {
  const { groupId, title, year } = req.body; // year를 문자열로 받음

  const image = req.file ? req.file.url : null;

  // 로그 추가: 파일 및 바디 정보 확인
  console.log("req.file:", req.file);
  console.log("Uploaded Image Path:", image);
  console.log("req.body:", req.body);
  console.log("Year received:", year); // 로그 추가

  try {
      const group = await Group.findByPk(groupId);
      if (!group) {
          return res.status(400).json({
              status: false,
              message: "Invalid groupId",
              error: "Invalid groupId"
          });
      }

      // 날짜가 올바른 형식인지 확인
      const parsedDate = new Date(year);
      if (isNaN(parsedDate)) {
          return res.status(400).json({
              status: false,
              message: "Invalid date format",
              error: "Invalid date format"
          });
      }

      const newMemoryCard = await MemoryCard.create({
          groupId,
          title,
          year: parsedDate,
          image,
          summary: ""
      });

      const tags = await generateTags(title, image);

      if (tags && Array.isArray(tags)) {
          for (const tagName of tags) {
              await Tag.create({
                  mcId: newMemoryCard.mcId,
                  groupId: newMemoryCard.groupId,
                  name: tagName
              });
          }
      }

      res.status(201).json({
          status: true,
          data: {
              memorycardId: newMemoryCard.mcId,
              title: newMemoryCard.title,
              dateTime: newMemoryCard.createdAt,
              image: newMemoryCard.image,
              tags: tags || []
          },
          message: "Memory card created successfully"
      });
  } catch (error) {
      console.error("Error in createMemoryCard:", error);
      res.status(500).json({
          status: false,
          message: "Failed to create memory card",
          error: error.message
      });
  }
};



module.exports = {
  getMemoryCards,
  getMemoryCardById,
  createMemoryCard,
  upload // 여기서 upload를 내보냅니다.
};
