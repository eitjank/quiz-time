const router = require('express').Router();

const upload = require('../utils/upload');

router.post('/', upload.single('file'), (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      message: 'No file uploaded',
    });
  }
  try {
    return res.status(201).json({
      message: 'File uploaded successfully',
      filePath: req.file.path,
    });
  } catch (error) {
    console.error(error);
  }
});

module.exports = router;
