const mongoose = require('mongoose');
const Question = require('./Question');
const { deleteImage } = require('../../utils/deleteImagesUtils');

const QuizSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  visibility: { type: String, enum: ['public', 'private'], default: 'public' },
  questions: [Question.schema],
});

// delete image from questions before deleting quiz
QuizSchema.pre('remove', async function () {
  const questions = this.questions;
  questions.forEach(async (question) => {
    if (question.image) {
      deleteImage(question);
    }
  });
});

module.exports = mongoose.model('Quiz', QuizSchema);
