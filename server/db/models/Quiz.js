const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: String,
  question: String,
  options: [String],
  answer: String,
  timeLimit: Number,
});

const QuizSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  questions: [QuestionSchema],
});

module.exports = mongoose.model('Quiz', QuizSchema);
