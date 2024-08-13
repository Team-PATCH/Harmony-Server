const axios = require('axios');
const { ChatSession, ChatMessage } = require('../models');
require('dotenv').config();

const openAiEndpoint = process.env.OPENAI_ENDPOINT;
const apiKey = process.env.OPENAI_API_KEY;
const deploymentName = process.env.OPENAI_DEPLOYMENT_NAME;

const generateTags = async (title, image) => {
  const messages = [
    {
      role: "system",
      content: "당신은 주어진 제목과 이미지를 기반으로 추억 카드의 태그를 생성하는 도움을 주는 AI입니다. 답변으로는 태그만 제공해야 합니다. 예를 들어 가족과 함께 여행을 갔던 바다 사진이 제공될 경우, '가족, 여행, 바다'와 같은 태그를 생성해주세요. 그 외에도 사진에 관한 다양한 태그를, 3~4개 정도 생성해주세요. 또한 태그의 글자 수를 모두 합쳤을 때 10글자 이하여야 합니다."
    },
    {
      role: "user",
      content: `제목: "${title}" 이 이미지에 대한 태그를 생성해주세요: ${image}`
    }
  ];

  const params = {
    messages: messages,
    max_tokens: 50,
    temperature: 0.7
  };

  try {
    const response = await axios.post(`${openAiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-07-01-preview`, params, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (response.data.choices && response.data.choices.length > 0) {
      const tags = response.data.choices[0].message.content.split(',').map(tag => tag.trim());
      return tags;
    } else {
      throw new Error("No tags generated by AI.");
    }
  } catch (error) {
    console.error("Error in generateTags:", error);
    throw error;
  }
};


const generateInitialPrompt = async (mcId, title, image, tags) => {
  try {
      const chatSession = await ChatSession.findOne({ where: { mcId } });
      if (chatSession) {
          const messageCount = await ChatMessage.count({ where: { chatId: chatSession.chatId } });
          if (messageCount > 0) {
              return "이전 대화를 이어갈까요?";
          }
      }

      const tagString = Array.isArray(tags) ? tags.join(', ') : '';

      const messages = [
          {
              role: "system",
              content: "당신은 '모니'라는 이름의 AI 챗봇입니다. 사용자의 추억 카드에 대해 대화를 나누는 것이 목적입니다. 제공된 제목, 이미지(즉 사용자의 사진입니다), 태그를 바탕으로 사용자의 추억에 대해 공감하고 관심을 보이며, 더 자세한 이야기를 들을 수 있도록 질문을 해주세요. 친근하고 따뜻한 톤으로 대화해주세요. 당신의 답변은 두 줄 미만으로 간결해야 하고, 이미지(사진)와 이 추억 카드에 대해 인식하고 있다는 것을 사용자가 느낄 수 있게 하며 따뜻함과 공감 능력을 유지해주세요."
          },
          {
              role: "user",
              content: `제목: "${title}", 태그: ${tagString}, 이미지: ${image}`
          }
      ];

      const params = {
          messages: messages,
          max_tokens: 150,
          temperature: 0.7
      };

      const response = await axios.post(`${openAiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-07-01-preview`, params, {
          headers: {
              "api-key": apiKey,
              "Content-Type": "application/json"
          }
      });

      if (response.data.choices && response.data.choices.length > 0) {
          return response.data.choices[0].message.content;
      } else {
          throw new Error("No initial prompt generated by AI.");
      }
  } catch (error) {
      console.error("Error in generateInitialPrompt:", error);
      throw error;
  }
};


const generateSummary = async (conversation) => {
  const messages = [
    {
      role: "system",
      content: "당신은 '추억 카드'라고 하는 기능에서 노인과 가족의 추억 기록의 대화를 요약하는 AI 어시스턴트입니다. 주어진 대화 내용을 노인에게 친화적인 문구와 긍정적이고 따뜻한 말투로 4~5줄 정도로 요약해주세요. 대화 내용은 챗봇과의 대화 내용이기에, 그걸 그대로 가져오거나, 이름을 부르거나 질문하는 등 요약같지 않은 내용은 자제해주세요."
    },
    {
      role: "user",
      content: `다음 대화를 요약해주세요: ${conversation}`
    }
  ];

  const params = {
    messages: messages,
    max_tokens: 200,
    temperature: 0.7
  };

  try {
    const response = await axios.post(`${openAiEndpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2024-07-01-preview`, params, {
      headers: {
        "api-key": apiKey,
        "Content-Type": "application/json"
      }
    });

    if (response.data.choices && response.data.choices.length > 0) {
      return response.data.choices[0].message.content;
    } else {
      throw new Error("No summary generated by AI.");
    }
  } catch (error) {
    console.error("Error in generateSummary:", error);
    throw error;
  }
};

module.exports = {
  generateTags,
  generateInitialPrompt,
  generateSummary
};

