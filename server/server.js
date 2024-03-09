const express = require('express');
const http = require('http');
const cors = require('cors');
const connectDB = require('./db/connection');
const socketSetup = require('./socket');
const routes = require('./routes/quizzes');
require('dotenv').config();

const app = express();
app.use(cors());
app.use('/api', routes); // Mount the routes under /api prefix
const server = http.createServer(app);

connectDB();

socketSetup(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = server;
