import express   from 'express';
import { protect }   from '../middleware/auth.js';
import {
  sendMessage,
  getMessages,
  updateMessage,
  deleteMessage,
  addReaction,
  pinMessage,
}   from '../controllers/chatController.js';

const router = express.Router();

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

export default router;
