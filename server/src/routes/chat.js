const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  addReaction,
  pinMessage,
} = require('../controllers/chatController');

// Private routes - all require authentication
router.use(protect);

// Message management
router.post('/:sessionId/messages', sendMessage);
router.get('/:sessionId/messages', getMessages);
router.put('/messages/:id', updateMessage);
router.delete('/messages/:id', deleteMessage);

// Message interactions
router.post('/messages/:id/react', addReaction);
router.put('/messages/:id/pin', pinMessage);

module.exports = router;
