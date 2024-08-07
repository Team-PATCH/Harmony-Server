// src/controllers/mcController.js

const { MemoryCard, Tag, Group, ChatSession, ChatMessage } = require('../models');
const { generateTags, generateInitialPrompt, generateSummary } = require('../services/azureAIService');
const { v4: uuidv4 } = require('uuid');
const uploadImage = require('../utils/uploadImage');
// const uploadAudio = require('../utils/uploadAudio');
const { upload, uploadAudio } = require('../utils/uploadAudio');
const dotenv = require('dotenv');
dotenv.config();


const fs = require('fs');
const path = require('path');

const getSummary = async (req, res) => {
  const { mcId } = req.params;
  const forceUpdate = req.query.forceUpdate === 'true';

  try {
    let memoryCard = await MemoryCard.findByPk(mcId);
    if (!memoryCard) {
      return res.status(404).json({ status: false, message: "Memory card not found" });
    }

    const chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      return res.status(200).json({ 
        status: true, 
        data: { summary: "아직 이 추억에 대해 대화를 나누지 않았네요.\n모니와 대화를 시작해보세요!😄", lastMessageId: null },
        message: "No chat session available" 
      });
    }

    const messages = await ChatMessage.findAll({ 
      where: { chatId: chatSession.chatId },
      order: [['createdAt', 'ASC']]
    });

    // 메시지가 없으면 기존 데이터 반환
    if (messages.length === 0) {
      return res.status(200).json({ 
        status: true, 
        data: { summary: "아직 이 추억에 대해 대화를 나누지 않았네요.\n모니와 대화를 시작해보세요!😄", lastMessageId: null },
        message: "No chat history" 
      });
    }

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage ? lastMessage.messageId : null;

    // 요약이 이미 있고 forceUpdate가 false면 기존 요약 반환
    if (memoryCard.summary && !forceUpdate) {
      return res.status(200).json({ 
        status: true, 
        data: { summary: memoryCard.summary, lastMessageId },
        message: "Existing summary retrieved" 
      });
    }

    const chatContent = messages.map(msg => `${msg.role}: ${msg.content}`).join('\n');
    const summary = await generateSummary(chatContent);
    
    memoryCard.summary = summary;
    await memoryCard.save();

    res.status(200).json({ 
      status: true, 
      data: { summary, lastMessageId },
      message: "Summary generated and retrieved successfully" 
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    res.status(500).json({ status: false, message: "Failed to retrieve summary" });
  }
};




const saveChatHistory = async (req, res) => {
  const { mcId } = req.params;
  console.log("Received files:", req.files);
  console.log("Received body:", req.body);

  let data;
  try {
    data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
  } catch (error) {
    console.error("Error parsing request body:", error);
    return res.status(400).json({ status: false, message: "Invalid JSON in request body" });
  }

  const { groupId, messages } = data;

  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      chatSession = await ChatSession.create({ 
        mcId, 
        groupId,
        chatId: uuidv4()
      });
    }

    const savedMessages = [];

    for (let message of messages) {
      let voiceUrl = null;
      if (message.audioRecord) {
        const audioFile = req.files.find(file => file.originalname === message.audioRecord.fileName);
        if (audioFile) {
          try {
            voiceUrl = await uploadAudio(audioFile);
          } catch (error) {
            console.error("Error uploading audio:", error);
          }
        }
      }

      // 이미 존재하는 메시지인지 확인
      let existingMessage = await ChatMessage.findOne({
        where: {
          chatId: chatSession.chatId,
          content: message.content,
          role: message.role
        }
      });

      if (existingMessage) {
        // 이미 존재하는 메시지면 업데이트
        existingMessage.voice = voiceUrl || existingMessage.voice;
        await existingMessage.save();
        savedMessages.push({
          id: existingMessage.messageId,
          role: existingMessage.role,
          content: existingMessage.content,
          audioRecord: existingMessage.voice ? {
            fileName: existingMessage.voice,
            isUser: existingMessage.role === 'user',
            duration: message.audioRecord ? message.audioRecord.duration : 0
          } : null
        });
      } else {
        // 새로운 메시지면 생성
        const savedMessage = await ChatMessage.create({
          chatId: chatSession.chatId,
          mcId,
          groupId,
          content: message.content,
          voice: voiceUrl,
          role: message.role
        });

        savedMessages.push({
          id: savedMessage.messageId,
          role: savedMessage.role,
          content: savedMessage.content,
          audioRecord: voiceUrl ? {
            fileName: voiceUrl,
            isUser: message.role === 'user',
            duration: message.audioRecord ? message.audioRecord.duration : 0
          } : null
        });
      }
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


const updateChatHistory = async (req, res) => {
  const { mcId } = req.params;
  console.log("Received files:", req.files);
  console.log("Received body:", req.body);

  let data;
  try {
    data = typeof req.body.data === 'string' ? JSON.parse(req.body.data) : req.body.data;
  } catch (error) {
    console.error("Error parsing request body:", error);
    return res.status(400).json({ status: false, message: "Invalid JSON in request body" });
  }

  const { groupId, messages } = data;

  try {
    let chatSession = await ChatSession.findOne({ where: { mcId } });
    if (!chatSession) {
      return res.status(404).json({ status: false, message: "Chat session not found" });
    }

    const existingMessages = await ChatMessage.findAll({
      where: { chatId: chatSession.chatId },
      order: [['createdAt', 'ASC']]
    });

    const savedMessages = [];
    let newMessagesStartIndex = 0;

    // Find the index where new messages start
    for (let i = 0; i < messages.length; i++) {
      if (i >= existingMessages.length || 
          messages[i].content !== existingMessages[i].content || 
          messages[i].role !== existingMessages[i].role) {
        newMessagesStartIndex = i;
        break;
      }
    }

    // Keep existing messages
    savedMessages.push(...existingMessages.slice(0, newMessagesStartIndex).map(msg => ({
      id: msg.messageId,
      role: msg.role,
      content: msg.content,
      audioRecord: msg.voice ? {
        fileName: msg.voice,
        isUser: msg.role === 'user',
        duration: 0 // You might want to store this information in the database
      } : null
    })));

    // Add new messages
    for (let i = newMessagesStartIndex; i < messages.length; i++) {
      const message = messages[i];
      let voiceUrl = null;
      if (message.audioRecord) {
        const audioFile = req.files.find(file => file.originalname === message.audioRecord.fileName);
        if (audioFile) {
          try {
            voiceUrl = await uploadAudio(audioFile);
          } catch (error) {
            console.error("Error uploading audio:", error);
          }
        }
      }

      if (voiceUrl) { // Only save messages with audio
        const newMessage = await ChatMessage.create({
          chatId: chatSession.chatId,
          mcId,
          groupId,
          content: message.content,
          voice: voiceUrl,
          role: message.role
        });

        savedMessages.push({
          id: newMessage.messageId,
          role: newMessage.role,
          content: newMessage.content,
          audioRecord: {
            fileName: voiceUrl,
            isUser: message.role === 'user',
            duration: message.audioRecord ? message.audioRecord.duration : 0
          }
        });
      }
    }

    res.status(200).json({ 
      status: true, 
      data: savedMessages,
      message: "Chat history updated successfully" 
    });
  } catch (error) {
    console.error("Error in updateChatHistory:", error);
    res.status(500).json({ status: false, message: "Failed to update chat history" });
  }
};

const getInitialPrompt = async (req, res) => {
  const { mcId } = req.params;

  try {
    const memoryCard = await MemoryCard.findByPk(mcId, {
      include: [Tag]
    });

    if (!memoryCard) {
      return res.status(404).json({ status: false, message: "Memory card not found" });
    }

    const tags = memoryCard.Tags.map(tag => tag.name);
    const prompt = await generateInitialPrompt(mcId, memoryCard.title, memoryCard.image, tags);

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
        dateTime: card.year,
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
      dateTime: memoryCard.year,
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
              dateTime: newMemoryCard.year,
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
  getSummary,
  saveChatHistory,
  getChatHistory,
  getInitialPrompt,
  getMemoryCards,
  getMemoryCardById,
  createMemoryCard,
  updateChatHistory,
  uploadImage,
  uploadAudio,
};
