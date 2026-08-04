const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPoll,
  getSessionPolls,
  getPoll,
  respondToPoll,
  endPoll,
  deletePoll,
} = require('../controllers/pollController');

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

module.exports = router;
