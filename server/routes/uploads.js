const router = require('express').Router();
const fs = require('fs');
const path = require('path');

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

router.delete('/uploads/:filename', (req, res) => {
  const filePath = path.join('uploads', req.params.filename);

  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: 'Failed to delete file' });
    }
    res.json({ message: 'File deleted successfully' });
  });
});

module.exports = router;
