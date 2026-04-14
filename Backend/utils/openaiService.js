const Groq = require('groq-sdk');

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Send message to Groq with context
const sendMessage = async (userMessage, context) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Answer using ONLY this context. If the answer is not found in the context, respond with: "I couldn't find this information in your uploaded notes. Please check your study materials or ask another question."\n\nContext:\n${context}\n\nQuestion: ${userMessage}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error sending message to Groq: ${error.message}`);
  }
};

// Summarize text using Groq
const summarizeText = async (text) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Summarize the following text into bullet points:\n\n${text}`,
        },
      ],
      temperature: 0.5,
      max_tokens: 1000,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    throw new Error(`Error summarizing text: ${error.message}`);
  }
};

// Generate quiz questions from text using Groq
const generateQuiz = async (text, numQuestions = 5) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate ${numQuestions} multiple choice quiz questions from the following text. Return ONLY a valid JSON array with no additional text. Each object must have "question", "options" (array of 4 options), and "correctAnswer" (index 0-3).

Text:
${text}

Return ONLY this JSON format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0
  }
]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content.trim();
    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format from Groq');
  } catch (error) {
    throw new Error(`Error generating quiz: ${error.message}`);
  }
};

// Generate flashcards from text using Groq
const generateFlashcards = async (text, numCards = 10) => {
  try {
    const completion = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate ${numCards} flashcard pairs (question-answer) from the following text. Return ONLY a valid JSON array with no additional text. Each object must have "question" and "answer".

Text:
${text}

Return ONLY this JSON format:
[
  {
    "question": "What is...?",
    "answer": "The answer is..."
  }
]`,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = completion.choices[0].message.content.trim();
    // Extract JSON from the response
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('Invalid response format from Groq');
  } catch (error) {
    throw new Error(`Error generating flashcards: ${error.message}`);
  }
};

module.exports = {
  sendMessage,
  summarizeText,
  generateQuiz,
  generateFlashcards,
};
