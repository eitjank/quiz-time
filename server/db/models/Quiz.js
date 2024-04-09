const mongoose = require('mongoose');
const Question = require('./Question');

const QuizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  questions: [Question.schema],
});

module.exports = mongoose.model('Quiz', QuizSchema);
