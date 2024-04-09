const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true},
  question: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  timeLimit: Number,
  image: String,
});

module.exports = mongoose.model('Question', QuestionSchema);