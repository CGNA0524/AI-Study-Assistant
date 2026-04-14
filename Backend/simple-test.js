/**
 * Simple test to verify routing with one query at a time
 * Shows debug logs clearly
 */

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const API_BASE = 'http://localhost:5000/api';
let testUser, testToken, testNote;

async function setup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const User = require('./models/User');
    const Note = require('./models/Note');
    const jwt = require('jsonwebtoken');

    // Get or create user
    testUser = await User.findOne({ email: 'routing-test@test.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Routing Tester',
        email: 'routing-test@test.com',
        password: 'test123',
      });
    }

    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    // Get or create note
    testNote = await Note.findOne({ userId: testUser._id, fileName: 'routing-test.pdf' });
    if (!testNote) {
      testNote = await Note.create({
        userId: testUser._id,
        fileName: 'routing-test.pdf',
        originalFileName: 'routing-test.pdf',
        content: 'Machine Learning is the study of algorithms that learn from data.',
        chunks: [
          { text: 'Machine Learning is the study of algorithms.' },
        ],
        fileSize: 100,
      });
    }

    console.log('✅ Setup complete');
    console.log(`   User: ${testUser._id}`);
    console.log(`   Note: ${testNote._id}\n`);
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    process.exit(1);
  }
}

async function testQuery(message, expectedType) {
  try {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`📤 Testing: "${message}"`);
    console.log(`Expected Route: ${expectedType}`);
    console.log(`Check backend terminal for: 🔥 or ⚡ markers`);
    console.log(`${'='.repeat(70)}`);

    const response = await axios.post(
      `${API_BASE}/ai/chat`,
      { noteId: testNote._id, message },
      { headers: { Authorization: `Bearer ${testToken}` } }
    );

    console.log(`✅ Response: ${response.data.response.substring(0, 80)}...`);
  } catch (err) {
    console.error(`❌ Error: ${err.response?.data?.message || err.message}`);
  }
}

async function runTests() {
  await setup();

  console.log('\n🧪 ROUTING TEST - WATCH BACKEND LOGS\n');

  // Test 1: General query
  await testQuery('What is machine learning?', 'Groq');
  await new Promise(r => setTimeout(r, 2000));

  // Test 2: Summarize task
  await testQuery('summarize the concept', 'Fine-tuned');
  await new Promise(r => setTimeout(r, 2000));

  // Test 3: Quiz task
  await testQuery('generate quiz questions', 'Fine-tuned');
  await new Promise(r => setTimeout(r, 2000));

  // Test 4: General query again
  await testQuery('Tell me more about this', 'Groq');

  console.log('\n✅ All tests completed!');
  console.log('\nExpected backend log patterns:');
  console.log('  ⚡ General query → Using Groq API with RAG');
  console.log('  🔥 Task detected → Using fine-tuned model');
  
  process.exit(0);
}

runTests();
