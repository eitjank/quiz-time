const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: String,
  question: String,
  options: [String],
  answer: String,
  timeLimit: Number
});

const QuizSchema = new mongoose.Schema({
  name: String,
  description: String,
  questions: [QuestionSchema]
});

module.exports = mongoose.model('Quiz', QuizSchema);