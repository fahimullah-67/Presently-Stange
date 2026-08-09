import express   from 'express';
import { protect }   from '../middleware/auth.js';
import {
  createPoll,
  getSessionPolls,
  getPoll,
  respondToPoll,
  endPoll,
  deletePoll,
}   from '../controllers/pollController.js';

const router = express.Router();


// Private routes - all require authentication
router.use(protect);

// Poll management
router.post('/', createPoll);
router.get('/:id', getPoll);
router.put('/:id/end', endPoll);
router.delete('/:id', deletePoll);

// Poll responses
router.post('/:id/respond', respondToPoll);

// Get session polls
router.get('/session/:sessionId', getSessionPolls);

export default router;
