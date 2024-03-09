const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  participants: [],
  // ... any other necessary fields ...
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
