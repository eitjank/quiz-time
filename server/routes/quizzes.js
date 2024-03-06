const express = require('express');
const Quiz = require('../models/Quiz');

const router = express.Router();

router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quizzes/:id', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/quizzes', async (req, res) => {
  const quiz = new Quiz({
    name: req.body.name,
    description: req.body.description,
    questions: req.body.questions,
  });

  try {
    const newQuiz = await quiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/quizzes/:id', async (req, res) => {
  try {
    const result = await Quiz.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: 'Deleted Quiz' });
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
