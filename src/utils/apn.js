const apn = require('apn');
const dotenv = require('dotenv');

class APNsController {
  constructor() {
    dotenv.config();
    
    const options = {
      token: {
        key: process.env.KEY,
        keyId: process.env.KEY_ID,
        teamId: process.env.TEAM_ID,
      },
      production: false,
    };
    
    this.apnProvider = new apn.Provider(options);
  }

  async sendNotification(alert, payload, deviceToken) {
    const notification = new apn.Notification();
    notification.sound = "default";
    notification.alert = alert;
    notification.payload = payload;
    notification.topic = process.env.BUNDLE_ID;

    try {
      const result = await this.apnProvider.send(notification, deviceToken);
      console.log(result);
      return result;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  shutdown() {
    this.apnProvider.shutdown();
  }
}

// 클래스의 인스턴스를 생성하여 내보냅니다.
module.exports = new APNsController();