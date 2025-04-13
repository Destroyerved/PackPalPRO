import express from 'express';
import { PollService } from '../services/pollService';
import { requireAuth } from '../middleware/auth';

const router = express.Router();

// Create poll
router.post('/', requireAuth, async (req, res) => {
  try {
    const { eventId, itemId, question, options } = req.body;
    const poll = await PollService.createPoll(
      eventId,
      itemId,
      question,
      options,
      req.user!.id
    );
    res.json(poll);
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ error: 'Failed to create poll' });
  }
});

// Vote on poll
router.post('/:pollId/vote', requireAuth, async (req, res) => {
  try {
    const { optionId } = req.body;
    const results = await PollService.vote(
      req.params.pollId,
      optionId,
      req.user!.id
    );
    res.json(results);
  } catch (error) {
    console.error('Error voting on poll:', error);
    res.status(500).json({ error: 'Failed to vote on poll' });
  }
});

// Get poll results
router.get('/:pollId/results', requireAuth, async (req, res) => {
  try {
    const results = await PollService.getPollResults(req.params.pollId);
    res.json(results);
  } catch (error) {
    console.error('Error getting poll results:', error);
    res.status(500).json({ error: 'Failed to get poll results' });
  }
});

export default router; 