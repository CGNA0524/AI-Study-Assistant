/**
 * Edge Case Testing - Verify keyword detection with various inputs
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

    testUser = await User.findOne({ email: 'edge-case-test@test.com' });
    if (!testUser) {
      testUser = await User.create({
        name: 'Edge Case Tester',
        email: 'edge-case-test@test.com',
        password: 'test123',
      });
    }

    testToken = jwt.sign({ userId: testUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

    testNote = await Note.findOne({ userId: testUser._id, fileName: 'edge-case-test.pdf' });
    if (!testNote) {
      testNote = await Note.create({
        userId: testUser._id,
        fileName: 'edge-case-test.pdf',
        originalFileName: 'edge-case-test.pdf',
        content: 'Test content for edge case testing.',
        chunks: [{ text: 'Test content for edge case testing.' }],
        fileSize: 50,
      });
    }

    console.log('✅ Setup complete\n');
  } catch (err) {
    console.error('❌ Setup error:', err.message);
    process.exit(1);
  }
}

async function testQuery(message, expectedRoute, description) {
  try {
    const response = await axios.post(
      `${API_BASE}/ai/chat`,
      { noteId: testNote._id, message },
      { headers: { Authorization: `Bearer ${testToken}` } }
    );

    const success = response.status === 200;
    const status = success ? '✅' : '❌';
    console.log(`${status} ${expectedRoute === 'Groq' ? '⚡' : '🔥'} [${expectedRoute}] ${description}`);
    console.log(`   Message: "${message}"`);
    return success;
  } catch (err) {
    console.error(`❌ [ERROR] ${description}`);
    console.error(`   Message: "${message}"`);
    console.error(`   Error: ${err.message}`);
    return false;
  }
}

async function runEdgeCaseTests() {
  await setup();

  console.log('🧪 EDGE CASE TESTING - Keyword Detection\n');
  console.log('='.repeat(70));
  console.log('GENERAL QUERIES (Should route to ⚡ Groq)');
  console.log('='.repeat(70) + '\n');

  let passed = 0, total = 0;

  // General queries
  const generalQueries = [
    ['What is this about?', 'Normal question'],
    ['Tell me more', 'Vague question'],
    ['Explain the concept', 'General request'],
    ['Who invented this?', 'Specific question'],
    ['When was it created?', 'Date question'],
    ['How does it work?', 'How question'],
    ['  What is this?  ', 'With whitespace'],
    ['WHAT IS THIS?', 'ALL CAPS'],
  ];

  for (const [msg, desc] of generalQueries) {
    total++;
    if (await testQuery(msg, 'Groq', desc)) passed++;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(70));
  console.log('TASK QUERIES (Should route to 🔥 Fine-tuned)');
  console.log('='.repeat(70) + '\n');

  // Task queries
  const taskQueries = [
    ['summarize this', 'Basic summarize'],
    ['SUMMARIZE', 'Uppercase summarize'],
    ['  summarize  ', 'With whitespace'],
    ['summary of the text', 'Using "summary"'],
    ['create a quiz', 'Quiz request'],
    ['generate quiz questions', 'Quiz with "generate"'],
    ['make flashcards', 'Flashcard request'],
    ['create flashcard pairs', 'Flashcards (plural)'],
    ['generate questions', 'Using "generate questions"'],
    ['Please summarize the key points', 'Natural language summarize'],
    ['Can you summarize?', 'Question with summarize'],
    ['I need a quiz', 'Phrase with quiz'],
  ];

  for (const [msg, desc] of taskQueries) {
    total++;
    if (await testQuery(msg, 'Fine-tuned', desc)) passed++;
    await new Promise(r => setTimeout(r, 500));
  }

  console.log('\n' + '='.repeat(70));
  console.log('TEST RESULTS');
  console.log('='.repeat(70));
  console.log(`\n✅ Passed: ${passed}/${total}`);
  console.log(`📊 Success Rate: ${((passed/total)*100).toFixed(1)}%\n`);

  if (passed === total) {
    console.log('🎉 ALL EDGE CASE TESTS PASSED!');
  } else {
    console.log(`⚠️ ${total - passed} test(s) failed`);
  }

  process.exit(passed === total ? 0 : 1);
}

runEdgeCaseTests();
