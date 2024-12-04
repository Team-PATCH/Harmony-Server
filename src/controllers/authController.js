const { User, UserGroup, Group } = require('../models');
const jwt = require('jsonwebtoken');
const axios = require('axios');
const moment = require('moment');
require('dotenv').config();

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

    if (!userId || !nick || !authProvider) {
      return res.status(400).json({ message: '필수 정보가 누락되었습니다.' });
    }

    if (!['kakao', 'apple'].includes(authProvider)) {
      return res.status(400).json({ message: '유효하지 않은 인증 제공자입니다.' });
    }

    // Apple 로그인인 경우 토큰 검증
    if (authProvider === 'apple' && socialToken) {
      try {
        // Apple의 public key 가져오기
        const appleResponse = await axios.get('https://appleid.apple.com/auth/keys');
        const keys = appleResponse.data.keys;
        
        // socialToken(identity token) 디코드
        const decodedToken = jwt.decode(socialToken, { complete: true });
        if (!decodedToken) {
          return res.status(400).json({ message: '유효하지 않은 identity token입니다.' });
        }

        // kid와 일치하는 public key 찾기
        const kid = decodedToken.header.kid;
        const matchingKey = keys.find(key => key.kid === kid);
        
        if (!matchingKey) {
          return res.status(400).json({ message: '일치하는 key를 찾을 수 없습니다.' });
        }

        // JWT 검증
        jwt.verify(socialToken, matchingKey, {
          algorithms: ['RS256'],
          issuer: 'https://appleid.apple.com',
          audience: process.env.APPLE_CLIENT_ID
        });
      } catch (error) {
        console.error('Apple 토큰 검증 에러:', error);
        return res.status(400).json({ message: 'Apple 토큰 검증에 실패했습니다.' });
      }
    }

    // socialTokenExpiredAt 파싱
    const expiredAtDate = socialTokenExpiredAt ? 
      moment(socialTokenExpiredAt, "YYYY-MM-DD HH:mm:ss.SSS").toDate() : 
      null;

    // 사용자 생성 또는 업데이트
    let user = await User.findOne({ where: { userId } });

    if (user) {
      user = await user.update({
        nick,
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate,
        lastLoginAt: new Date()
      });
    } else {
      user = await User.create({
        userId,
        nick,
        authProvider,
        socialToken,
        refreshToken,
        socialTokenExpiredAt: expiredAtDate,
        lastLoginAt: new Date()
      });
    }

    // 사용자의 그룹 정보 조회
    const userGroups = await UserGroup.findAll({
      where: { userId: user.userId },
      include: [{
        model: Group,
        attributes: ['name']
      }]
    });

    // JWT 토큰 생성
    const token = jwt.sign(
      { userId: user.userId }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1d' }
    );

    // 응답 데이터 구성
    return res.status(user ? 200 : 201).json({
      message: user ? '사용자 정보가 업데이트되었습니다.' : '새 사용자가 생성되었습니다.',
      user: {
        nick: user.nick,
        authProvider: user.authProvider,
        groups: userGroups.length === 0 ? {
          status: 'NO_GROUP',
          needsOnboarding: true,
          groups: []
        } : {
          status: 'HAS_GROUPS',
          needsOnboarding: false,
          groups: userGroups.map(ug => ({
            groupId: ug.groupId,
            name: ug.Group.name,
            role: ug.permissionId === 'v' ? 'VIP' : 'MEMBER'
          }))
        }
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
      include: [{
        model: UserGroup,
        include: [{
          model: Group,
          attributes: ['name']
        }]
      }]
    });

    if (!user) {
      return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
    }

    // 프로필 응답도 signup과 동일한 형식으로 구성
    const response = {
      nick: user.nick,
      authProvider: user.authProvider,
      groups: user.UserGroups.length === 0 ? {
        status: 'NO_GROUP',
        needsOnboarding: true,
        groups: []
      } : {
        status: 'HAS_GROUPS',
        needsOnboarding: false,
        groups: user.UserGroups.map(ug => ({
          groupId: ug.groupId,
          name: ug.Group.name,
          role: ug.permissionId === 'v' ? 'VIP' : 'MEMBER'
        }))
      }
    };

    res.json({ user: response });
  } catch (error) {
    console.error('프로필 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};