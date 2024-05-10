export const ENDPOINT = process.env.SERVER_URL || 'http://localhost:3001';

export const BASE_URL = `${ENDPOINT}/api`;

export const AUTH_ENDPOINT = `${BASE_URL}/auth`;
export const SIGNUP_ENDPOINT = `${AUTH_ENDPOINT}/signup`;
export const LOGIN_ENDPOINT = `${AUTH_ENDPOINT}/login`;
export const LOGOUT_ENDPOINT = `${AUTH_ENDPOINT}/logout`;

export const USER_ENDPOINT = `${BASE_URL}/user`;

export const QUIZZES_ENDPOINT = `${BASE_URL}/quizzes`;
export const PERSONAL_QUIZZES_ENDPOINT = `${QUIZZES_ENDPOINT}/my-quizzes`;
export const QUESTIONS_ENDPOINT = `${BASE_URL}/questions`;
export const MOVE_QUESTION_ENDPOINT = `${QUESTIONS_ENDPOINT}/moveQuestion`;
export const QUESTIONS_IMPORT_EXPORT_ENDPOINT = `${BASE_URL}/questionsImportExport`;

export const QUIZ_SESSIONS_START_ENDPOINT = `${BASE_URL}/quizSessions/start`;

export const FILE_UPLOAD_ENDPOINT = `${BASE_URL}/uploads`;
