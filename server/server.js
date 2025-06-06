const express = require('express');
const http = require('http');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const connectDB = require('./db/connection');
const socketSetup = require('./socket');
const quizzesRoutes = require('./routes/quizzes');
const quizSessionsRoutes = require('./routes/quizSessions');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const uploadRoutes = require('./routes/uploads');
const questionsRoutes = require('./routes/questions');
const questionsImportExportRoutes = require('./routes/questionsImportExport');
require('dotenv').config();

const app = express();
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    credentials: true, // Allow cookies for signup
  })
);
app.use(cookieParser());
app.use(express.json());
app.use('/api/quizzes', quizzesRoutes);
app.use('/api/quizSessions', quizSessionsRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/questionsImportExport', questionsImportExportRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/uploads', express.static('uploads'));
const server = http.createServer(app);

connectDB();

socketSetup(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;
