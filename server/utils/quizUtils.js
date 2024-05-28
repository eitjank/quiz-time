function validateQuestions(questions) {
  for (let question of questions) {
    if (
      question.type === 'multipleChoice' &&
      (!question.options || question.options.length === 0)
    ) {
      throw new Error(
        'Multiple choice questions must have at least one option.'
      );
    }
    if (!question.answer || question.answer.length === 0) {
      throw new Error('Each question must have an answer.');
    }
  }
}

module.exports = {
  validateQuestions,
};
