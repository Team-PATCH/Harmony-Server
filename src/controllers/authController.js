// controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

exports.signup = async (req, res) => {
  try {
    const {
      userId,
      nick,
      profile,
      authProvider,
      socialToken,
      refreshToken,
      socialTokenExpiredAt
    } = req.body;

    if (!userId || !nick || !authProvider) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    if (!['kakao', 'apple'].includes(authProvider)) {
      return res.status(400).json({ message: '유효하지 않은 인증 제공자입니다.' });
    }

    // socialTokenExpiredAt을 moment를 사용하여 파싱
    const expiredAtDate = socialTokenExpiredAt ? moment(socialTokenExpiredAt, "YYYY-MM-DD HH:mm:ss.SSS").toDate() : null;

    let user = await User.findOne({ where: { userId } });

    if (user) {
      user = await user.update({
        nick,
        profile,
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate,
        lastLoginAt: new Date()
      });
    } else {
      user = await User.create({
        userId,
        nick,
        profile,
        authProvider,
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate,
        lastLoginAt: new Date()
      });
    }

    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, { expiresIn: '1d' });

    // socialTokenExpiredAt을 원래 형식의 문자열로 변환하여 응답
    const responseUser = user.toJSON();
    responseUser.socialTokenExpiredAt = user.socialTokenExpiredAt ? 
      moment(user.socialTokenExpiredAt).format("YYYY-MM-DD HH:mm:ss.SSS") : null;

    return res.status(user ? 200 : 201).json({
      message: user ? '사용자 정보가 업데이트되었습니다.' : '새 사용자가 생성되었습니다.',
      user: responseUser,
      token
    });
  } catch (error) {
    console.error('회원가입 에러:', error);
    return res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.verifyAppleToken = async (req, res) => {
  try {
    const { identityToken, refreshToken } = req.body;
    
    if (!identityToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Identity token이 필요합니다.' 
      });
    }

    // Apple의 public key 가져오기
    const response = await axios.get('https://appleid.apple.com/auth/keys');
    const keys = response.data.keys;
    
    // identityToken 디코드하여 kid(Key ID) 추출
    const decodedToken = jwt.decode(identityToken, { complete: true });
    if (!decodedToken) {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 identity token입니다.' 
      });
    }

    // kid와 일치하는 public key 찾기
    const kid = decodedToken.header.kid;
    const matchingKey = keys.find(key => key.kid === kid);
    
    if (!matchingKey) {
      return res.status(400).json({ 
        success: false, 
        message: '일치하는 key를 찾을 수 없습니다.' 
      });
    }

    // JWT 검증
    const verified = jwt.verify(identityToken, matchingKey, {
      algorithms: ['RS256'],
      issuer: 'https://appleid.apple.com',
      audience: process.env.APPLE_CLIENT_ID
    });

    // 검증 성공 후 user 정보 생성 또는 업데이트는 FE에서 /signup API를 통해 처리
    return res.json({
      success: true,
      verifiedToken: verified
    });

  } catch (error) {
    console.error('Apple 토큰 검증 에러:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false, 
        message: '유효하지 않은 토큰입니다.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: '서버 오류가 발생했습니다.' 
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findOne({ where: { userId: req.user.userId } });
    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }
    res.json({ user });
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};