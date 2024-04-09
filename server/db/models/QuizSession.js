const mongoose = require('mongoose');

const QuizSessionSchema = new mongoose.Schema({
  quiz: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true,
  },
  participants: [
    {
      id: String,
      name: String,
      score: Number,
      answers: [
        {
          questionId: mongoose.Schema.Types.ObjectId,
          answer: String,
        },
      ],
    },
  ],
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
