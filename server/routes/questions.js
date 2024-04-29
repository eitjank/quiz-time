const express = require('express');
const router = express.Router();
const Question = require('../db/models/Question');
const mongoose = require('mongoose');
const authenticateUser = require('../middleware/authMiddleware');

router.put('/moveQuestion/:id', authenticateUser, async (req, res) => {
  const { id } = req.params;
  const { newFolder } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const question = await Question.findOne({ _id: id, owner: req.user.id });
    if (!question) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const result = await Question.updateOne(
      { _id: id },
      { $set: { folder: newFolder } }
    );
    if (result.modifiedCount === 1) {
      res.json({ message: 'Question moved successfully.' });
    } else {
      res.json({ message: 'No changes made to the question.' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Error moving question.', error: err });
  }
});

router.get('/', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const questions = await Question.find({ owner: req.user.id });
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authenticateUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    if (question.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    res.json(question);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticateUser, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    const newQuestion = new Question(req.body);
    newQuestion.owner = req.user.id;
    const savedQuestion = await newQuestion.save();
    res.status(201).json(savedQuestion);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/:id', authenticateUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }
    if (question.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }
    Object.assign(question, req.body);
    const updatedQuestion = await question.save();
    res.json(updatedQuestion);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete('/:id', authenticateUser, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(404).json({ message: 'Question not found' });
    }
    const question = await Question.findByIdAndDelete(req.params.id, {
      owner: req.user.id,
    });
    if (!question) {
      return res.status(404).json({ message: 'Cannot find question' });
    }
    res.json({ message: 'Deleted Question' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
