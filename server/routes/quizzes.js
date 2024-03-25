const express = require('express');
const Quiz = require('../db/models/Quiz');
const mongoose = require('mongoose');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ visibility: 'public' });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quizzes/private', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const quizzes = await Quiz.find({
      visibility: 'private',
      owner: req.user.id,
    });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/quizzes/:id', authenticateUser, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      // If the quiz is private and the user is not authenticated or doesn't have access to it
      if (
        quiz.visibility === 'private' &&
        (!req.user || quiz.owner.toString() !== req.user.id)
      ) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// TODO: Add authentication
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

// TODO: Add authentication
router.put('/quizzes/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      quiz.name = req.body.name;
      quiz.description = req.body.description;
      quiz.questions = req.body.questions;
      quiz.visibility = req.body.visibility;
      const updatedQuiz = await quiz.save();
      res.json(updatedQuiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
});

// TODO: Add authentication
router.delete('/quizzes/:id', async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

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
