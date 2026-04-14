const Note = require('../models/Note');
const Chat = require('../models/Chat');
const ChatSession = require('../models/ChatSession');
const Groq = require('groq-sdk');
const axios = require('axios');
const {
  summarizeText,
  generateQuiz: groqGenerateQuiz,
  generateFlashcards: groqGenerateFlashcards,
} = require('../utils/openaiService');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const FINE_TUNED_API_URL = process.env.FINE_TUNED_API_URL || 'http://127.0.0.1:5001/generate';
const FINE_TUNED_TIMEOUT_MS = Number(process.env.FINE_TUNED_TIMEOUT_MS || 15000);

// ✅ Task detection
const isTaskBasedMessage = (message = '') => {
  const messageLower = message.trim().toLowerCase();
  return (
    messageLower.includes('summarize') ||
    messageLower.includes('summary') ||
    messageLower.includes('quiz') ||
    messageLower.includes('flashcard') ||
    messageLower.includes('flashcards') ||
    messageLower.includes('generate questions')
  );
};

// ✅ Context builder
const getRelevantChunks = (question, chunks, topK = 4) => {
  const questionWords = question.toLowerCase().split(' ');

  const chunkScores = chunks.map((chunk) => {
    const chunkText = (chunk.text || '').toLowerCase();
    const matches = questionWords.filter(
      (word) => word.length > 3 && chunkText.includes(word)
    ).length;

    return { chunk, score: matches };
  });

  return chunkScores
    .filter((c) => c.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map((c) => c.chunk.text);
};

// Limit context to prevent slow responses and prompt echo issues
const buildContext = (note, query, topK = 5, maxChars = 800) => {
  const chunks = getRelevantChunks(query, note.chunks || [], topK);
  let context = '';
  
  if (chunks.length > 0) {
    context = chunks.join('\n\n');
  } else {
    context = note.content || note.chunks?.map((chunk) => chunk.text).join('\n\n') || '';
  }
  
  // Limit context size to prevent long responses and model confusion
  if (context.length > maxChars) {
    context = context.substring(0, maxChars).trim() + '...';
  }
  
  return context;
};

// ✅ Prompt builder - Simplified to prevent prompt echo
// ONLY includes essential info: context, question, and answer marker
const buildFineTunedPrompt = (note, message) => {
  const context = buildContext(note, message, 5, 600);
  
  return `Context:\n${context}\n\nQuestion: ${message}\n\nAnswer:`;
};

// ✅ Low quality filter
const isLowQualityFineTunedResponse = (text = '') => {
  const badPatterns = [
    'ensure that your response is written',
    'teacher or classmates',
    'clarifications'
  ];
  return badPatterns.some((p) => text.toLowerCase().includes(p));
};

// ✅ API call with output cleaning
const callFineTunedModel = async (prompt) => {
  try {
    const res = await axios.post(
      FINE_TUNED_API_URL,
      { prompt },
      { timeout: FINE_TUNED_TIMEOUT_MS }
    );

    let response = (res.data.response || '').trim();
    
    // Clean output: Remove prompt echo and extract ONLY the answer
    // If response contains "Answer:", take everything after it
    if (response.includes('Answer:')) {
      const answerIndex = response.lastIndexOf('Answer:');
      response = response.substring(answerIndex + 7).trim();
    }
    
    // Remove prompt junk (if full prompt was echoed back)
    const junkPatterns = [
      /Context:.*?Question:/is,
      /You are a study assistant/i,
      /Return a short summary/i,
      /Return 3-5 flashcards/i,
      /Return 3 MCQs/i
    ];
    
    for (const pattern of junkPatterns) {
      if (pattern.test(response)) {
        console.warn('⚠️ Detected prompt echo in fine-tuned response');
        return null;
      }
    }
    
    // Validate response isn't empty or too short
    if (!response || response.length < 5) {
      console.warn('⚠️ Fine-tuned response too short or empty');
      return null;
    }
    
    return response;
  } catch (err) {
    console.error('Fine-tuned model error:', err.message);
    throw err;
  }
};

// ✅ 🔥 MAIN LOGIC - Smart routing with improved fallback
const generateAssistantReply = async (note, message) => {
  const isShortMessage = message.length < 100;

  // Try fine-tuned model for task-based short messages
  if (isTaskBasedMessage(message) && isShortMessage) {
    console.log('🔥 Using fine-tuned model (short task)');

    try {
      const prompt = buildFineTunedPrompt(note, message);
      const response = await callFineTunedModel(prompt);

      // If response is valid, return it
      if (response && !isLowQualityFineTunedResponse(response)) {
        console.log('✅ Fine-tuned model returned valid response');
        return response;
      }
      
      // Response was null or low quality, fall through to Groq
      console.log('⚠️ Fine-tuned model returned invalid response, falling back to Groq');
    } catch (err) {
      console.log('⚠️ Fine-tuned model failed:', err.message, ', falling back to Groq');
    }
  } else {
    console.log('⚡ Using Groq for this query (direct route)');
  }

  const context = buildContext(note, message, 5);

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [
      {
        role: 'user',
        content: `Answer using only this context:\n${context}\n\nQuestion: ${message}`,
      },
    ],
  });

  return completion.choices[0].message.content;
};

// ================= CHAT =================
exports.chat = async (req, res) => {
  try {
    const { noteId, message } = req.body;
    const userId = req.userId;

    const note = await Note.findById(noteId);

    const reply = await generateAssistantReply(note, message);

    let chat = await Chat.findOne({ userId, noteId });

    if (!chat) {
      chat = await Chat.create({ userId, noteId, messages: [] });
    }

    chat.messages.push({ role: 'user', content: message });
    chat.messages.push({ role: 'assistant', content: reply });

    await chat.save();

    res.json({ response: reply, chatId: chat._id });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

// ================= SUMMARY =================
exports.summarize = async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.userId;

    const note = await Note.findById(noteId);

    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Summarize:\n${note.content}`,
        },
      ],
    });

    res.json({ summary: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= QUIZ =================
exports.generateQuiz = async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.userId;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.content) {
      return res.status(400).json({ message: 'Note has no content to generate quiz from' });
    }

    const quiz = await groqGenerateQuiz(note.content);

    res.json({ quiz });
  } catch (error) {
    console.error('Quiz generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= FLASHCARDS =================
exports.generateFlashcards = async (req, res) => {
  try {
    const { noteId } = req.body;
    const userId = req.userId;

    if (!noteId) {
      return res.status(400).json({ message: 'noteId is required' });
    }

    const note = await Note.findById(noteId);
    
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (!note.content) {
      return res.status(400).json({ message: 'Note has no content to generate flashcards from' });
    }

    const flashcards = await groqGenerateFlashcards(note.content);

    res.json({ flashcards });
  } catch (error) {
    console.error('Flashcards generation error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ================= GET CHAT (LEGACY) =================
exports.getChat = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const chat = await Chat.findOne({ userId, noteId });

    if (!chat) {
      return res.status(404).json({ message: 'Chat not found' });
    }

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ================= CHAT SESSIONS =================
exports.createChatSession = async (req, res) => {
  try {
    const { noteId, title } = req.body;
    const userId = req.userId;

    const session = await ChatSession.create({ userId, noteId, title, messages: [] });

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatSessions = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.userId;

    const sessions = await ChatSession.find({ userId, noteId });

    res.json({ sessions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await ChatSession.findById(sessionId);

    if (!session || session.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    res.json({ session });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.addMessageToSession = async (req, res) => {
  try {
    const { sessionId, message } = req.body;
    const userId = req.userId;

    const session = await ChatSession.findById(sessionId);

    if (!session || session.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    // Get the note to generate a reply
    const note = await Note.findById(session.noteId);
    const reply = await generateAssistantReply(note, message);

    // Add messages to session
    session.messages.push({ role: 'user', content: message });
    session.messages.push({ role: 'assistant', content: reply });

    await session.save();

    res.json({ session, response: reply });
  } catch (error) {
    console.error('addMessageToSession error:', error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteChatSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.userId;

    const session = await ChatSession.findById(sessionId);

    if (!session || session.userId.toString() !== userId) {
      return res.status(404).json({ message: 'Session not found' });
    }

    await ChatSession.deleteOne({ _id: sessionId });

    res.json({ message: 'Session deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};