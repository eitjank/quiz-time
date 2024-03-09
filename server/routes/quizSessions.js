const express = require('express');
const Quiz = require('../db/models/Quiz');
const QuizSession = require('../db/models/QuizSession');

const router = express.Router();

router.post('/start', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.body.quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    const quizSession = new QuizSession({ quiz: req.body.quizId });
    await quizSession.save();
    res.json({ quizSessionId: quizSession._id });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
