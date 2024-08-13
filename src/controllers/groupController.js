const { Group, User, UserGroup } = require('../models');
const { v4: uuidv4 } = require('uuid');
const { Op } = require('sequelize');

exports.createGroup = async (req, res) => {
  try {
    const { name, alias, userId, deviceToken } = req.body;
    
    const inviteUrl = uuidv4().slice(0, 5);
    const vipInviteUrl = uuidv4().slice(0, 5);
    
    const group = await Group.create({
      name,
      inviteUrl,
      vipInviteUrl
    });
    
    await UserGroup.create({
      userId,
      groupId: group.groupId,
      permissionId: 'a',
      alias,
      deviceToken
    });
    
    const response = {
      groupId: group.groupId,
      groupName: group.name,
      inviteUrl: group.inviteUrl,
      vipInviteUrl: group.vipInviteUrl
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
        where: {
          [Op.or]: [
            { inviteUrl: inviteCode },
            { vipInviteUrl: inviteCode }
          ]
        }
      });
      
      if (!group) {
        return res.status(404).json({ message: '유효하지 않은 초대 코드입니다.' });
      }
      
      const existingMembership = await UserGroup.findOne({
        where: {
          userId,
          groupId: group.groupId
        }
      });
      
      if (existingMembership) {
        return res.status(400).json({ message: '이미 그룹에 가입되어 있습니다.' });
      }
      
      const isVipInvite = inviteCode === group.vipInviteUrl;
      const permissionId = isVipInvite ? 'v' : 'm';
      
      await UserGroup.create({
        userId,
        groupId: group.groupId,
        permissionId,
        deviceToken
      });
  
      if (isVipInvite) {
        await group.update({
          vipInviteUrl: null,  // VIP 초대 코드 삭제
          vipId: userId        // vipId 설정
        });
      }
      
      res.status(200).json({ 
        message: isVipInvite ? 'VIP로 그룹에 성공적으로 가입했습니다.' : '그룹에 성공적으로 가입했습니다.',
        group: await Group.findByPk(group.groupId),
        permission: isVipInvite ? 'v' : 'm'  // 업데이트된 그룹 정보를 반환
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
    const { type } = req.body;
    
    const group = await Group.findByPk(groupId);
    
    if (!group) {
      return res.status(404).json({ message: '그룹을 찾을 수 없습니다.' });
    }
    
    const newInviteCode = uuidv4().slice(0, 5);
    
    if (type === 'regular') {
      await group.update({ inviteUrl: newInviteCode });
    } else if (type === 'vip') {
      await group.update({ vipInviteUrl: newInviteCode });
    } else {
      return res.status(400).json({ message: '유효하지 않은 초대 코드 타입입니다.' });
    }
    
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