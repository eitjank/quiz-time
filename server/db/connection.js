const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/quizApp';

async function connectDb() {
  try {
    await mongoose.connect(mongoURI);
    console.log('Connected to MongoDB...');
  } catch (err) {
    console.error(err);
  }
}

module.exports = connectDb;
