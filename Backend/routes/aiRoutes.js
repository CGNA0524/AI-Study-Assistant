const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const {
  chat,
  summarize,
  generateQuiz,
  generateFlashcards,
  getChat,
  getChatSessions,
  getChatSession,
  createChatSession,
  addMessageToSession,
  deleteChatSession,
} = require('../controllers/aiController');

// Chat (legacy)
router.post('/chat', auth, chat);

// Get previous chat (legacy)
router.get('/chat/:noteId', auth, getChat);

// Chat Sessions
router.post('/sessions', auth, createChatSession);
router.post('/sessions/message', auth, addMessageToSession);
router.get('/sessions/:noteId', auth, getChatSessions);
router.get('/session/:sessionId', auth, getChatSession);
router.delete('/session/:sessionId', auth, deleteChatSession);

// Summarize
router.post('/summarize', auth, summarize);

// Quiz
router.post('/generate-quiz', auth, generateQuiz);

// Flashcards
router.post('/generate-flashcards', auth, generateFlashcards);

module.exports = router;