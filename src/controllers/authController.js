// controllers/authController.js
const { User } = require('../models');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const moment = require('moment'); // moment 라이브러리를 추가해주세요

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