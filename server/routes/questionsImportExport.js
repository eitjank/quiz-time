const express = require('express');
const router = express.Router();
const Question = require('../db/models/Question');
const authenticateUser = require('../middleware/authMiddleware');

// export questions
router.get('/', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const questions = await Question.find({ owner: req.user.id }).select(
      '-owner -__v -_id'
    );
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// import questions
router.post('/', authenticateUser, async (req, res) => {
  try {
    console.log(req.body);
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const questions = await req.body.map((q) => {
      q.owner = req.user.id;
      return q;
    });
    const newQuestions = await Question.insertMany(questions);
    res.status(201).json(newQuestions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
