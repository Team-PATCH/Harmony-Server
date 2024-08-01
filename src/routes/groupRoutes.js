const express = require('express');
const router = express.Router();
const groupController = require('../controllers/groupController');

router.post('/', groupController.createGroup);
router.post('/join', groupController.joinGroup);
router.get('/:groupId', groupController.getGroupInfo);
router.get('/:groupId/members', groupController.getGroupMembers);
router.post('/:groupId/regenerate-invite', groupController.regenerateInviteCode);
router.post('/:groupId/onboarding', groupController.updateOnboardingInfo);

module.exports = router;