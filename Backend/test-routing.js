/**
 * Test script to verify routing logic in aiController.js
 * Tests: Task-based queries -> fine-tuned model, General queries -> Groq
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
}

// Create or get test user
async function getTestUser() {
  const User = require('./models/User');
  let user = await User.findOne({ email: 'test@routing.com' });
  
  if (!user) {
    user = await User.create({
      name: 'Test User',
      email: 'test@routing.com',
      password: 'hashed_password_here',
    });
    console.log('✅ Created test user:', user._id);
  } else {
    console.log('✅ Found existing test user:', user._id);
  }
  return user;
}

// Create JWT token for test user
function createToken(userId) {
  const jwt = require('jsonwebtoken');
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
}

// Create test note (PDF simulation)
async function createTestNote(userId) {
  const Note = require('./models/Note');
  
  const testContent = `
    Cyber-Physical Systems (CPS) are integrations of computation, networking, and physical processes.
    IoT (Internet of Things) is a network of physical devices that collect and share data.
    Machine Learning enables computers to learn from data and improve performance.
    Deep Learning uses neural networks with multiple layers.
    TinyLlama is a lightweight language model suitable for edge devices.
  `;

  const note = await Note.create({
    userId,
    fileName: 'test-document.pdf',
    originalFileName: 'test-document.pdf',
    content: testContent,
    chunks: [
      { text: 'CPS integrates computation, networking, and physical processes.' },
      { text: 'IoT is a network of physical devices that collect and share data.' },
      { text: 'Machine Learning enables computers to learn from data.' },
      { text: 'Deep Learning uses neural networks with multiple layers.' },
    ],
    fileSize: 1024,
  });

  console.log('✅ Created test note:', note._id);
  return note;
}

// Test routing with different queries
async function testRouting(token, noteId) {
  const testCases = [
    {
      name: 'General Query (should use Groq)',
      message: 'What is CPS?',
      expectedRoute: 'Groq',
    },
    {
      name: 'Summarize Task (should use fine-tuned)',
      message: 'summarize the document',
      expectedRoute: 'fine-tuned',
    },
    {
      name: 'Quiz Task (should use fine-tuned)',
      message: 'generate quiz on machine learning',
      expectedRoute: 'fine-tuned',
    },
    {
      name: 'Flashcard Task (should use fine-tuned)',
      message: 'create flashcards for deep learning',
      expectedRoute: 'fine-tuned',
    },
    {
      name: 'Another General Query (should use Groq)',
      message: 'What is IoT in detail?',
      expectedRoute: 'Groq',
    },
  ];

  console.log('\n' + '='.repeat(70));
  console.log('ROUTING TESTS');
  console.log('='.repeat(70) + '\n');

  for (const testCase of testCases) {
    try {
      console.log(`🧪 Test: ${testCase.name}`);
      console.log(`   Message: "${testCase.message}"`);
      console.log(`   Expected Route: ${testCase.expectedRoute}`);

      const response = await axios.post(
        `${API_BASE}/ai/chat`,
        {
          noteId,
          message: testCase.message,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      console.log(`   ✅ Response received (${response.data.response.substring(0, 50)}...)`);
      console.log(`   Status: ${response.status}\n`);
    } catch (err) {
      console.log(`   ❌ Error: ${err.response?.data?.message || err.message}\n`);
    }
  }
}

// Main test execution
async function runTests() {
  try {
    console.log('🚀 Starting Routing Tests\n');
    
    await connectDB();
    
    const user = await getTestUser();
    const token = createToken(user._id);
    console.log('✅ Generated JWT token\n');

    const note = await createTestNote(user._id);
    
    await testRouting(token, note._id);

    console.log('='.repeat(70));
    console.log('📊 CHECK BACKEND CONSOLE LOGS:');
    console.log('='.repeat(70));
    console.log('Look for these patterns in the Terminal running "npm run dev":');
    console.log('  🔥 Task detected → Using fine-tuned model');
    console.log('  ⚡ General query → Using Groq API with RAG');
    console.log('='.repeat(70) + '\n');

    console.log('✅ Tests completed! Check backend logs for routing details');
    process.exit(0);
  } catch (err) {
    console.error('❌ Test error:', err.message);
    process.exit(1);
  }
}

runTests();
