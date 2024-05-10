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
      totalScore: Number,
      answers: [
        {
          questionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Question' },
          answer: [String],
          score: { type: Number, default: 0 },
        },
      ],
    },
  ],
});

module.exports = mongoose.model('QuizSession', QuizSessionSchema);
