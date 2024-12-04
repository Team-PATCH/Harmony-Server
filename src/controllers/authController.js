const jwksClient = require('jwks-rsa');
const { User, UserGroup, Group } = require('../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

// JWKS 클라이언트 초기화
const client = jwksClient({
  jwksUri: 'https://appleid.apple.com/auth/keys',
  cache: true,
  cacheMaxAge: 86400000
});

// 키를 가져오는 함수
const getKey = (header, callback) => {
  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      return callback(err);
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

exports.signup = async (req, res) => {
  try {
    const {
      userId,
      nick,
      authProvider,
      socialToken,
      refreshToken,
      socialTokenExpiredAt
    } = req.body;

    if (!userId || !authProvider) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    if (!['kakao', 'apple'].includes(authProvider)) {
      return res.status(400).json({ message: '유효하지 않은 인증 제공자입니다.' });
    }

    // Apple 로그인인 경우 토큰 검증
    if (authProvider === 'apple' && socialToken) {
      try {
        await new Promise((resolve, reject) => {
          jwt.verify(socialToken, getKey, {
            algorithms: ['RS256'],
            issuer: 'https://appleid.apple.com',
            audience: process.env.APPLE_CLIENT_ID
          }, (err, decoded) => {
            if (err) {
              reject(err);
            } else {
              resolve(decoded);
            }
          });
        });
      } catch (error) {
        console.error('Apple 토큰 검증 에러:', error);
        return res.status(400).json({ 
          message: 'Apple 토큰 검증에 실패했습니다.',
          error: error.message 
        });
      }
    }

    const expiredAtDate = socialTokenExpiredAt ? 
      moment(socialTokenExpiredAt, "YYYY-MM-DD HH:mm:ss.SSS").toDate() : 
      null;

    let user = await User.findOne({ where: { userId } });
    
    if (user) {
      const updateData = {
        lastLoginAt: new Date(),
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate
      };
      if (nick) updateData.nick = nick;
      
      user = await user.update(updateData);
    } else {
      const createData = {
        userId,
        authProvider,
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate,
        lastLoginAt: new Date()
      };
      if (nick) createData.nick = nick;
      
      user = await User.create(createData);
    }

    // 그룹 정보 조회 (permissionId 포함)
    const userGroup = await UserGroup.findOne({
      where: { userId: user.userId },
      attributes: ['groupId', 'permissionId']
    });

    const token = jwt.sign(
      { userId: user.userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 응답에 permissionId 포함
    return res.status(user ? 200 : 201).json({
      message: user ? '사용자 정보가 업데이트되었습니다.' : '새 사용자가 생성되었습니다.',
      user: {
        nick: user.nick,
        authProvider: user.authProvider,
        groupId: userGroup ? userGroup.groupId : -1,
        permissionId: userGroup ? userGroup.permissionId : null
      },
      token
    });

  } catch (error) {
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ 
      where: { userId: req.user.userId },
      attributes: ['userId', 'nick', 'authProvider']
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    const userGroup = await UserGroup.findOne({
      where: { userId: user.userId },
      attributes: ['groupId', 'permissionId']
    });

    // 단순화된 프로필 응답
    const response = {
      userId: user.userId,
      nick: user.nick,
      authProvider: user.authProvider,
      groupId: userGroup ? userGroup.groupId : -1,
      permissionId: userGroup ? userGroup.permissionId : null
    };

    res.json({ user: response });
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};