const mongoose = require('mongoose');
const { deleteImage } = require('../../utils/deleteImagesUtils');

const QuestionSchema = new mongoose.Schema({
  type: { type: String, required: true },
  question: { type: String, required: true },
  options: [String],
  answer: {
    type: [String],
    validate: {
      validator: function (array) {
        return array.length > 0;
      },
      message: 'A question must have at least one correct answer.',
    },
    required: true,
  },
  timeLimit: Number,
  image: String,
  tags: [String],
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

// delete image from questions before deleting quiz
QuestionSchema.pre('remove', async function () {
  if (this.image) {
    deleteImage(this);
  }
});

module.exports = mongoose.model('Question', QuestionSchema);
