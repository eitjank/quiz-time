const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  question: String,
  options: [String], // For multiple choice questions
  answer: String,
  type: String, // E.g., 'multipleChoice', 'trueFalse', 'openEnded'
  timeLimit: Number,
});

module.exports = mongoose.model('Question', QuestionSchema);
