const fs = require('fs');

const deleteImageFromFilePath = async (filePath) => {
  if (!filePath.startsWith('uploads\\')) return;
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
    }
  });
};

const deleteImage = async (question) => {
  if (question.image) {
    // check if file exists and starts with 'uploads/'
    const filePath = question.image;
    deleteImageFromFilePath(filePath);
  }
};

module.exports = { deleteImage, deleteImageFromFilePath };
