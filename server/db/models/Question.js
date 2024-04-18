const mongoose = require('mongoose');
const { deleteImage } = require('../../utils/deleteImagesUtils');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: [String],
  answer: { type: String, required: true },
  timeLimit: Number,
  image: String,
  tags: [String],
});

// delete image from questions before deleting quiz
QuestionSchema.pre('remove', async function () {
  if (this.image) {
    deleteImage(this);
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
