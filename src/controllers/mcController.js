// src/controllers/mcController.js

const { MemoryCard, Tag, Group, ChatSession, ChatMessage } = require('../models');
const { generateTags, generateInitialPrompt } = require('../services/azureAIService');
const { v4: uuidv4 } = require('uuid');
const uploadImage = require('../utils/uploadImage');
const uploadAudio = require('../utils/uploadAudio');
const dotenv = require('dotenv');
dotenv.config();

const fs = require('fs');
const path = require('path');

/*
// 음성 파일과 대화 기록을 저장하는 POST 메서드
const saveChatHistory = async (req, res) => {
  const { mcId, messages } = req.body;
  const audioFile = req.file;

  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      chatSession = await ChatSession.create({ mcId, groupId: req.body.groupId });
    }

    for (let message of messages) {
      await ChatMessage.create({
        chatId: chatSession.chatId,
        mcId,
        groupId: chatSession.groupId,
        content: message.content,
        voice: message.audioRecord ? message.audioRecord.fileName : null
      });
    }

    if (audioFile) {
      const fileName = `${Date.now()}_${audioFile.originalname}`;
      const filePath = path.join(__dirname, '../uploads', fileName);
      fs.writeFileSync(filePath, audioFile.buffer);
    }

    res.status(200).json({ status: true, message: "Chat history saved successfully" });
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to save chat history" });
  }
};

// 대화 기록을 조회하는 GET 메서드
const getChatHistory = async (req, res) => {
  const { mcId } = req.params;

  try {
    const chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      return res.status(404).json({ status: false, message: "Chat history not found" });
    }

    const messages = await ChatMessage.findAll({ 
      where: { chatId: chatSession.chatId },
      order: [['createdAt', 'ASC']]
    });

    res.status(200).json({ 
      status: true, 
      data: messages.map(msg => ({
        id: msg.messageId,
        role: msg.content.startsWith("User:") ? "user" : "assistant",
        content: msg.content,
        audioRecord: msg.voice ? {
          fileName: msg.voice,
          isUser: msg.content.startsWith("User:"),
          duration: 0 // 실제 오디오 길이는 서버에서 계산하기 어려우므로 클라이언트에서 처리
        } : null
      })),
      message: "Chat history retrieved successfully" 
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to retrieve chat history" });
  }
};

// 초기 대화 프롬프트를 생성하는 GET 메서드
const getInitialPrompt = async (req, res) => {
  const { mcId } = req.params;

  try {
    const memoryCard = await MemoryCard.findOne({
      where: { mcId },
      include: [Tag]
    });

    if (!memoryCard) {
      return res.status(404).json({ status: false, message: "Memory card not found" });
    }

    const prompt = await generateInitialPrompt(memoryCard.title, memoryCard.image, memoryCard.Tags.map(tag => tag.name));

    res.status(200).json({ status: true, data: prompt, message: "Initial prompt generated successfully" });
  } catch (error) {
    console.error("Error in getInitialPrompt:", error);
    res.status(500).json({ status: false, message: "Failed to generate initial prompt" });
  }
};
*/

// const saveChatHistory = async (req, res) => {
//   const { mcId } = req.params;
//   const { messages } = req.body;
//   const audioFile = req.file;

//   try {
//     let chatSession = await ChatSession.findOne({ where: { mcId } });
//     if (!chatSession) {
//       const memoryCard = await MemoryCard.findByPk(mcId);
//       if (!memoryCard) {
//         return res.status(404).json({ status: false, message: "Memory card not found" });
//       }
//       chatSession = await ChatSession.create({ mcId, groupId: memoryCard.groupId });
//     }

//     const savedMessages = [];

//     for (let message of messages) {
//       let audioUrl = null;
//       if (message.audioRecord && audioFile) {
//         // Azure Blob Storage에 업로드된 파일의 URL을 사용합니다.
//         audioUrl = audioFile.url;
//       }

//       const savedMessage = await ChatMessage.create({
//         chatId: chatSession.chatId,
//         mcId,
//         groupId: chatSession.groupId,
//         content: message.content,
//         voice: audioUrl
//       });

//       savedMessages.push({
//         id: savedMessage.messageId,
//         role: savedMessage.content.startsWith("User:") ? "user" : "assistant",
//         content: savedMessage.content,
//         audioRecord: audioUrl ? {
//           fileName: audioUrl,
//           isUser: savedMessage.content.startsWith("User:"),
//           duration: 0 // 실제 오디오 길이는 클라이언트에서 처리
//         } : null
//       });
//     }

//     res.status(200).json({ 
//       status: true, 
//       data: savedMessages,
//       message: "Chat history saved successfully" 
//     });
//   } catch (error) {
//     console.error("Error in saveChatHistory:", error);
//     res.status(500).json({ status: false, message: "Failed to save chat history" });
//   }
// };

/*
const saveChatHistory = async (req, res) => {
  const { mcId } = req.params;
  const { messages } = req.body;  // messages는 클라이언트에서 전송한 채팅 기록

  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      const memoryCard = await MemoryCard.findByPk(mcId);
      if (!memoryCard) {
        return res.status(404).json({ status: false, message: "Memory card not found" });
      }
      chatSession = await ChatSession.create({ mcId, groupId: memoryCard.groupId });
    }

    const savedMessages = [];

    for (let message of messages) {
      const savedMessage = await ChatMessage.create({
        chatId: chatSession.chatId,
        mcId,
        groupId: chatSession.groupId,
        content: message.content,
        voice: message.audioRecord ? message.audioRecord.fileName : null
      });

      savedMessages.push({
        id: savedMessage.messageId,
        role: message.role,
        content: savedMessage.content,
        audioRecord: message.audioRecord ? {
          fileName: message.audioRecord.fileName,
          isUser: message.role === 'user',
          duration: message.audioRecord.duration || 0
        } : null
      });
    }

    res.status(200).json({ 
      status: true, 
      data: savedMessages,
      message: "Chat history saved successfully" 
    });
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to save chat history" });
  }
};
*/
// const saveChatHistory = async (req, res) => {
//   const { mcId } = req.params;
//   const { messages } = req.body;

//   try {
//     let chatSession = await ChatSession.findOne({ where: { mcId } });
//     if (!chatSession) {
//       chatSession = await ChatSession.create({ mcId, groupId: req.body.groupId });
//     }

//     const savedMessages = [];

//     for (let message of messages) {
//       const savedMessage = await ChatMessage.create({
//         chatId: chatSession.chatId,
//         mcId,
//         groupId: chatSession.groupId,
//         content: message.content,
//         voice: message.audioRecord ? message.audioRecord.fileName : null
//       });

//       savedMessages.push({
//         id: savedMessage.messageId,
//         role: message.role,
//         content: savedMessage.content,
//         audioRecord: message.audioRecord ? {
//           fileName: message.audioRecord.fileName,
//           isUser: message.audioRecord.isUser,
//           duration: message.audioRecord.duration
//         } : null
//       });
//     }

//     res.status(200).json({ 
//       status: true, 
//       data: savedMessages,
//       message: "Chat history saved successfully" 
//     });
//   } catch (error) {
//     console.error("Error in saveChatHistory:", error);
//     res.status(500).json({ status: false, message: "Failed to save chat history" });
//   }
// };
/*
const saveChatHistory = async (req, res) => {
  const { mcId } = req.params;
  const { messages, groupId } = req.body;  // groupId를 클라이언트에서 받습니다.


  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      const memoryCard = await MemoryCard.findByPk(mcId);
      if (!memoryCard) {
        return res.status(404).json({ status: false, message: "Memory card not found" });
      }
      chatSession = await ChatSession.create({ mcId, groupId: memoryCard.groupId });
    }

    const savedMessages = [];

    for (let message of messages) {
      const savedMessage = await ChatMessage.create({
        chatId: chatSession.chatId,
        mcId,
        groupId: chatSession.groupId,
        content: message.content,
        voice: message.audioRecord ? message.audioRecord.fileName : null
      });

      savedMessages.push({
        id: savedMessage.messageId,
        role: message.role,
        content: savedMessage.content,
        audioRecord: message.audioRecord ? {
          fileName: message.audioRecord.fileName,
          isUser: message.audioRecord.isUser,
          duration: message.audioRecord.duration
        } : null
      });
    }

    res.status(200).json({ 
      status: true, 
      data: savedMessages,
      message: "Chat history saved successfully" 
    });
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to save chat history" });
  }
};
*/
const saveChatHistory = async (req, res) => {
  const { mcId } = req.params;
  const { messages, groupId } = req.body;

  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      chatSession = await ChatSession.create({ 
        mcId, 
        groupId,
        chatId: uuidv4() // UUID 생성
      });
    }

    const savedMessages = [];

    for (let message of messages) {
      const savedMessage = await ChatMessage.create({
        chatId: chatSession.chatId,
        mcId,
        groupId,
        content: message.content,
        voice: message.audioRecord ? message.audioRecord.fileName : null
      });

      savedMessages.push({
        id: savedMessage.messageId,
        role: message.role,
        content: savedMessage.content,
        audioRecord: message.audioRecord ? {
          fileName: message.audioRecord.fileName,
          isUser: message.audioRecord.isUser,
          duration: message.audioRecord.duration
        } : null
      });
    }

    res.status(200).json({ 
      status: true, 
      data: savedMessages,
      message: "Chat history saved successfully" 
    });
  } catch (error) {
    console.error("Error in saveChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to save chat history" });
  }
};

const getChatHistory = async (req, res) => {
  const { mcId } = req.params;

  try {
    const chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      return res.status(404).json({ status: false, message: "Chat history not found" });
    }

    const messages = await ChatMessage.findAll({ 
      where: { chatId: chatSession.chatId },
      order: [['createdAt', 'ASC']]
    });

    const formattedMessages = messages.map(msg => ({
      id: msg.messageId,
      role: msg.content.startsWith("User:") ? "user" : "assistant",
      content: msg.content.replace(/^(User:|Assistant:)/, '').trim(),
      audioRecord: msg.voice ? {
        fileName: msg.voice,
        isUser: msg.content.startsWith("User:"),
        duration: 0 // 실제 오디오 길이는 클라이언트에서 처리
      } : null
    }));

    res.status(200).json({ 
      status: true, 
      data: formattedMessages,
      message: "Chat history retrieved successfully" 
    });
  } catch (error) {
    console.error("Error in getChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to retrieve chat history" });
  }
};


const getInitialPrompt = async (req, res) => {
  const { mcId } = req.params;

  try {
    const memoryCard = await MemoryCard.findOne({
      where: { mcId },
      include: [Tag]
    });

    if (!memoryCard) {
      return res.status(404).json({ status: false, message: "Memory card not found" });
    }

    const prompt = await generateInitialPrompt(memoryCard.title, memoryCard.image, memoryCard.Tags.map(tag => tag.name));

    res.status(200).json({ status: true, data: prompt, message: "Initial prompt generated successfully" });
  } catch (error) {
    console.error("Error in getInitialPrompt:", error);
    res.status(500).json({ status: false, message: "Failed to generate initial prompt" });
  }
};




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
  saveChatHistory,
  getChatHistory,
  getInitialPrompt,
  getMemoryCards,
  getMemoryCardById,
  createMemoryCard,
  uploadImage,
  uploadAudio // 여기서 upload를 내보냅니다.
};
