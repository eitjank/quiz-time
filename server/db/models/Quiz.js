const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true},
  question: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  timeLimit: Number,
  image: String,
});

const QuizSchema = new mongoose.Schema({
  name: String,
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  questions: [QuestionSchema],
});

module.exports = mongoose.model('Quiz', QuizSchema);
