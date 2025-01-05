const { Group, User, UserGroup } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

exports.createGroup = async (req, res) => {
  try {
    const { name, userId, deviceToken } = req.body;
    
    const inviteUrl = uuidv4().slice(0, 5);
    
    const group = await Group.create({
      name,
      inviteUrl,
      vipId: userId  // VIP를 그룹 생성자로 설정
    });
    
    await UserGroup.create({
      userId,
      groupId: group.groupId,
      permissionId: 'v',  
      deviceToken
    });
    
    const response = {
      groupId: group.groupId,
      groupName: group.name,
      inviteUrl: group.inviteUrl
    };
    
    res.status(201).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.joinGroup = async (req, res) => {
  try {
    const { userId, inviteCode, deviceToken } = req.body;
    
    const group = await Group.findOne({
      where: { inviteUrl: inviteCode }  // vipInviteUrl 제거
    });
    
    if (!group) {
      return res.status(404).json({ message: '유효하지 않은 초대 코드입니다.' });
    }
    
    const existingMembership = await UserGroup.findOne({
      where: { userId, groupId: group.groupId }
    });
    
    if (existingMembership) {
      return res.status(400).json({ message: '이미 그룹에 가입되어 있습니다.' });
    }
    
    // 일반 멤버로 가입
    await UserGroup.create({
      userId,
      groupId: group.groupId,
      permissionId: 'm',
      deviceToken
    });
    
    res.status(200).json({ 
      message: '그룹에 성공적으로 가입했습니다.',
      group: await Group.findByPk(group.groupId),
      permission: 'm'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.getGroupInfo = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findByPk(groupId, {
      include: [{
        model: UserGroup,
        include: [User]
      }]
    });
    
    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.getGroupMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const members = await UserGroup.findAll({
      where: { groupId },
      include: [User]
    });
    
    res.status(200).json(members);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.regenerateInviteCode = async (req, res) => {
  try {
    const { groupId } = req.params;
    
    const group = await Group.findByPk(groupId);
    
    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }
    
    const newInviteCode = uuidv4().slice(0, 5);
    await group.update({ inviteUrl: newInviteCode });
    
    res.status(200).json({ message: '초대 코드가 재생성되었습니다.', newInviteCode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

exports.updateOnboardingInfo = async (req, res) => {
  try {
      const { groupId } = req.params;
      const { userId, nick, alias, profile, deviceToken } = req.body;

      // UserGroup 레코드 찾기
      const userGroup = await UserGroup.findOne({
          where: {
              userId,
              groupId
          }
      });

      if (!userGroup) {
          return res.status(404).json({ message: '해당 그룹에 가입되어 있지 않습니다.' });
      }

      // UserGroup 업데이트
      await userGroup.update({
          alias,
          deviceToken
      });

      // User 찾기
      const user = await User.findByPk(userId);
      if (!user) {
          return res.status(404).json({ message: '사용자를 찾을 수 없습니다.' });
      }

      // User 업데이트
      await user.update({
          nick,
          profile
      });

      // 업데이트된 UserGroup 정보 가져오기
      const updatedUserGroup = await UserGroup.findOne({
          where: {
              userId,
              groupId
          },
          include: [{ model: User, attributes: ['nick', 'profile'] }]
      });

      res.status(200).json({
          message: '온보딩 정보가 성공적으로 업데이트되었습니다.',
          userGroup: updatedUserGroup
      });
  } catch (error) {
      console.error('updateOnboardingInfo 에러:', error);
      res.status(500).json({ message: '서버 오류가 발생했습니다.', error: error.message });
  }
};

// 사용자의 그룹 목록 조회
exports.getUserGroups = async (req, res) => {
  try {
    const { userId } = req.params;

    const userGroups = await UserGroup.findAll({
      where: { userId },
      include: [{
        model: Group,
        include: [{
          model: UserGroup,
          include: [{
            model: User,
            attributes: ['userId', 'nick', 'profile']
          }]
        }]
      }],
      order: [[Group, 'createdAt', 'DESC']]
    });

    // 각 그룹별로 필요한 정보만 추출하여 응답
    const groupList = userGroups.map(ug => ({
      groupId: ug.Group.groupId,
      name: ug.Group.name,
      permissionId: ug.permissionId,
      myAlias: ug.alias,
      members: ug.Group.UserGroups.map(member => ({
        userId: member.User.userId,
        nick: member.User.nick,
        profile: member.User.profile,
        alias: member.alias,
        permissionId: member.permissionId
      }))
    }));

    res.json({ groups: groupList });
  } catch (error) {
    console.error('그룹 목록 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};

// 특정 그룹의 초대 코드 조회 (멤버만 조회 가능)
exports.getInviteCode = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { userId } = req.user; // auth middleware에서 제공된 사용자 정보

    // 해당 그룹의 멤버인지 확인
    const userGroup = await UserGroup.findOne({
      where: { 
        groupId,
        userId
      }
    });

    if (!userGroup) {
      return res.status(403).json({ message: '해당 그룹의 멤버가 아닙니다.' });
    }

    const group = await Group.findByPk(groupId);
    
    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }

    res.json({ 
      inviteCode: group.inviteUrl,
      groupName: group.name
    });
  } catch (error) {
    console.error('초대 코드 조회 에러:', error);
    res.status(500).json({ message: '서버 오류가 발생했습니다.' });
  }
};