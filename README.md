# Real-Time Quiz Application

This is a real-time quiz application designed to enhance the quiz-playing experience by providing a reliable and interactive platform. The system supports real-time interactions, a user-friendly interface, and efficient quiz and question management tools.

## Features
- Real-time quiz sessions
- User registration and authentication
- Quiz creation, editing, and deletion
- Question bank management
- Multiple question types (multiple choice, true/false, open-ended)
- Leaderboard display
- JSON import/export for quizzes and questions

## Technologies Used
- **Backend**: Node.js, Express.js, Socket.IO, MongoDB
- **Frontend**: React, Mantine

## Setup
1. Follow the setup instructions in the [server README](server/README.md).

2. Follow the setup instructions in the [client README](client/README.md).

## Running the Application
1. Start the backend server:
    ```bash
    cd server
    npm start
    ```
2. Start the frontend development server:
    ```bash
    cd client
    npm start
    ```

## Usage
1. Open your browser and navigate to `http://localhost:3000`.
2. Register a new account or log in with an existing account to manage quizzes.
3. Create, join, or participate in quizzes in real time.
