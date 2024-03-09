const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db/connection');
const socketSetup = require('./socket');
const quizzesRoutes = require('./routes/quizzes');
const quizSessionsRoutes = require('./routes/quizsessions');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api', quizzesRoutes);
app.use('/api/quizSessions', quizSessionsRoutes);
const server = http.createServer(app);

connectDB();

socketSetup(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;
