const express = require('express');
const Quiz = require('../db/models/Quiz');
const mongoose = require('mongoose');
const authenticateUser = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const quizzes = await Quiz.find({ visibility: 'public' });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/my-quizzes', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const quizzes = await Quiz.find({ owner: req.user.id });
    res.json(quizzes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
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
      const { withOwner } = req.query;
      if (withOwner === 'true') {
        await quiz.populate('owner', 'username');
      }

      res.json(quiz);
    } else {
      res.status(404).json({ message: 'Quiz not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const quiz = new Quiz({
      name: req.body.name,
      description: req.body.description,
      questions: req.body.questions,
      owner: req.user.id,
      visibility: req.body.visibility,
    });
    const newQuiz = await quiz.save();
    res.status(201).json(newQuiz);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', authenticateUser, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Quiz not found' });
  }

  try {
    const quiz = await Quiz.findById(req.params.id);
    if (quiz) {
      if (!req.user || quiz.owner.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden' });
      }
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
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return res.status(404).json({ message: 'Quiz not found' });
  }
  try {
    // Find the quiz
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    if (!req.user || quiz.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    // Delete the quiz
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ message: 'Quiz deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id/export', async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).select(
      '-_id -__v -owner -visibility -questions._id -questions.image'
    );
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=quiz.json');
    res.send(JSON.stringify(quiz));
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.post('/import', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const quiz = new Quiz({
      name: req.body.name,
      description: req.body.description,
      questions: req.body.questions,
      owner: req.user.id,
      visibility: req.body.visibility,
    });
    const importedQuiz = await quiz.save();
    res.status(201).json({
      message: 'Quiz imported successfully',
      quizId: importedQuiz._id,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

module.exports = router;
