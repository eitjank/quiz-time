# Quiz Application Server

This repository contains the server-side code for the real-time quiz application. The server is responsible for handling incoming requests, processing data, and interacting with the MongoDB database. Built with node.js, socket.io.

## Prerequisites

Before you begin, ensure you have met the following requirements:

- You have installed [Node.js and npm](https://nodejs.org/en/download/)
- You have a MongoDB database set up. This can be either a local instance of [MongoDB](https://www.mongodb.com/try/download/community) or a cloud-based instance on [MongoDB Atlas](https://www.mongodb.com/atlas/database).

## Setup

1. Rename the `.env.example` file to `.env`.

2. Open the `.env` file and update the configuration variables according to your environment.

3. Run to install the dependencies:
`npm install`

4. Run to start the development server:
`npm start`

The server should now be running and ready to handle requests from the Quiz Application client.


## Other Available Scripts

### `node .\addInitialData.js`

Add sample data to database

### `npm run test`

Run tests
