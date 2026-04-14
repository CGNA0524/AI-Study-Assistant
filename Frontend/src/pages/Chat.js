import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import html2pdf from 'html2pdf.js';
import {
  summarizeNote,
  generateQuiz,
  generateFlashcards,
  getChatSessions,
  getChatSession,
  createChatSession,
  addMessageToSession,
  deleteChatSession,
} from '../services/api';
import { FiSend, FiBook, FiHelpCircle, FiLayout, FiClock, FiPlus, FiPrinter, FiTrash2 } from 'react-icons/fi';

const Chat = () => {
  const { noteId, sessionId: paramSessionId } = useParams();
  const navigate = useNavigate();

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [summary, setSummary] = useState(null);
  const [quiz, setQuiz] = useState(null);
  const [flashcards, setFlashcards] = useState(null);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  // Chat sessions state
  const [chatSessions, setChatSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(paramSessionId || null);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [justCreatedSessionId, setJustCreatedSessionId] = useState(null);

  const messagesEndRef = useRef(null);

  // Load chat sessions for current note (don't create empty sessions)
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setSessionsLoading(true);
        const response = await getChatSessions(noteId);
        setChatSessions(response.data.sessions || []);

        // If viewing a specific session from URL, keep it
        // Otherwise, don't auto-create empty sessions
        if (paramSessionId) {
          setActiveSessionId(paramSessionId);
        } else {
          // Start with no active session (empty chat)
          setActiveSessionId(null);
        }
      } catch (err) {
        console.error('Failed to load chat sessions:', err);
        setChatSessions([]);
      } finally {
        setSessionsLoading(false);
      }
    };

    if (noteId) {
      fetchSessions();
    }
  }, [noteId, paramSessionId]);

  // Load messages from active session
  useEffect(() => {
    const fetchSessionMessages = async () => {
      if (!activeSessionId) {
        setMessages([]);
        setLoading(false);
        return;
      }

      // Skip fetching if we just created this session (avoids clearing the message we just typed)
      if (activeSessionId === justCreatedSessionId) {
        setJustCreatedSessionId(null);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await getChatSession(activeSessionId);
        setMessages(response.data.session.messages || []);
      } catch (err) {
        console.error('Failed to load session messages:', err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSessionMessages();
  }, [activeSessionId, justCreatedSessionId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleCreateNewSession = async () => {
    try {
      const response = await createChatSession(noteId);
      const newSession = response.data.session;
      setChatSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession._id);
      setMessages([]);
    } catch (err) {
      console.error('Failed to create new session:', err);
      setError('Failed to create new chat session');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;

    // Create a new session if none exists
    let currentSessionId = activeSessionId;
    if (!currentSessionId) {
      try {
        const response = await createChatSession(noteId);
        currentSessionId = response.data.session._id;
        setActiveSessionId(currentSessionId);
        setJustCreatedSessionId(currentSessionId);
        setChatSessions((prev) => [response.data.session, ...prev]);
      } catch (err) {
        console.error('Failed to create session:', err);
        setError('Failed to create chat session');
        return;
      }
    }

    const userMessage = input;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage, timestamp: new Date() }]);
    setSending(true);

    try {
      const response = await addMessageToSession(currentSessionId, userMessage);
      // Use the full session data from the backend to stay in sync
      const updatedMessages = response.data.session.messages.map((msg) => ({
        ...msg,
        timestamp: msg.timestamp || new Date(),
      }));
      setMessages(updatedMessages);

      // Update session title in the list if it was just created
      setChatSessions((prev) =>
        prev.map((s) =>
          s._id === currentSessionId
            ? { ...s, title: userMessage.substring(0, 30) + (userMessage.length > 30 ? '...' : '') }
            : s
        )
      );
    } catch (err) {
      if (err.response?.status === 429) {
        setError('🔴 API Rate Limit Exceeded: Please wait a few minutes before trying again. You\'ve reached the free tier limit.');
        setMessages((prev) => prev.slice(0, -1));
      } else {
        setError('Failed to send message');
        setMessages((prev) => prev.slice(0, -1));
      }
    } finally {
      setSending(false);
    }
  };

  const handlePrintSession = async (sessionId, sessionTitle) => {
    try {
      // Get the full session data
      const response = await getChatSession(sessionId);
      const session = response.data.session;

      // Create HTML content for PDF
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #0066cc; padding-bottom: 10px;">
            ${sessionTitle}
          </h1>
          <p style="color: #666; margin-bottom: 20px;">
            Session Date: ${new Date(session.createdAt).toLocaleString()}
          </p>
          <div style="line-height: 1.8;">
            ${session.messages
              .map((msg) => `
              <div style="margin-bottom: 15px; padding: 10px; background-color: ${
                msg.role === 'user' ? '#e3f2fd' : '#f5f5f5'
              }; border-radius: 5px;">
                <strong style="color: ${msg.role === 'user' ? '#0066cc' : '#333'}">
                  ${msg.role === 'user' ? 'You' : 'AI Assistant'}
                </strong>
                <p style="margin: 5px 0; color: #333;">${msg.content}</p>
              </div>
            `)
              .join('')}
          </div>
          <p style="text-align: center; color: #999; margin-top: 30px; font-size: 12px;">
            Generated on ${new Date().toLocaleString()}
          </p>
        </div>
      `;

      // Create PDF
      const element = document.createElement('div');
      element.innerHTML = htmlContent;

      const opt = {
        margin: 10,
        filename: `${sessionTitle.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: 'portrait', unit: 'mm', format: 'a4' },
      };

      html2pdf().set(opt).from(element).save();
    } catch (err) {
      console.error('Error generating PDF:', err);
      setError('Failed to generate PDF');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    try {
      await deleteChatSession(sessionId);
      // Remove from sessions list
      setChatSessions((prev) => prev.filter((s) => s._id !== sessionId));
      // If deleted session was active, clear it
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
        setMessages([]);
      }
    } catch (err) {
      console.error('Error deleting session:', err);
      setError('Failed to delete chat session');
    }
  };


  const handleSummarize = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await summarizeNote(noteId);
      setSummary(response.data.summary);
      setActiveTab('summary');
    } catch (err) {
      console.error('Summary error:', err);
      if (err.response?.status === 429) {
        setError('🔴 Rate Limit: Summary feature temporarily unavailable. Please try again later.');
      } else {
        setError(err.response?.data?.message || 'Failed to generate summary');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    try {
      setError('');
      setLoading(true);
      console.log('Generating quiz for noteId:', noteId);
      const response = await generateQuiz(noteId, 5);
      console.log('Quiz response:', response);
      let quizData = response.data.quiz;
      
      // Parse if it's a string
      if (typeof quizData === 'string') {
        try {
          quizData = JSON.parse(quizData);
        } catch (e) {
          console.error('Failed to parse quiz JSON:', e);
          quizData = [];
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(quizData)) {
        console.warn('Quiz data is not an array:', quizData);
        quizData = [];
      }
      
      console.log('Final quiz data:', quizData);
      setQuiz(quizData);
      setActiveTab('quiz');
    } catch (err) {
      console.error('Quiz generation error:', err);
      if (err.response?.status === 429) {
        setError('🔴 Rate Limit: Quiz feature temporarily unavailable. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to generate quiz');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuizSubmit = () => {
    if (!quiz) return;
    
    let correctCount = 0;
    quiz.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    setQuizScore(correctCount);
    setQuizSubmitted(true);
  };

  const handleResetQuiz = () => {
    setSelectedAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  };

  const handleGenerateFlashcards = async () => {
    try {
      setError('');
      setLoading(true);
      const response = await generateFlashcards(noteId, 10);
      let flashcardsData = response.data.flashcards;
      
      // Parse if it's a string
      if (typeof flashcardsData === 'string') {
        try {
          flashcardsData = JSON.parse(flashcardsData);
        } catch (e) {
          console.error('Failed to parse flashcards JSON:', e);
          flashcardsData = [];
        }
      }
      
      // Ensure it's an array
      if (!Array.isArray(flashcardsData)) {
        console.warn('Flashcards data is not an array:', flashcardsData);
        flashcardsData = [];
      }
      
      setFlashcards(flashcardsData);
      setActiveTab('flashcards');
    } catch (err) {
      console.error('Flashcards error:', err);
      if (err.response?.status === 429) {
        setError('🔴 Rate Limit: Flashcards feature temporarily unavailable. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to generate flashcards');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && messages.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <>
      <Header showLogout={true} />
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <div className="w-64 bg-white border-r border-gray-200 p-4 flex flex-col">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition w-full mb-6"
          >
            ← Back to Dashboard
          </button>

        <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('chat')}
            className={`w-full px-4 py-2 rounded-lg transition text-left ${
              activeTab === 'chat' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            Chat
          </button>
          <button
            onClick={handleSummarize}
            className={`w-full px-4 py-2 rounded-lg transition text-left flex items-center gap-2 ${
              activeTab === 'summary' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiBook /> Summary
          </button>
          <button
            onClick={handleGenerateQuiz}
            className={`w-full px-4 py-2 rounded-lg transition text-left flex items-center gap-2 ${
              activeTab === 'quiz' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiHelpCircle /> Quiz
          </button>
          <button
            onClick={handleGenerateFlashcards}
            className={`w-full px-4 py-2 rounded-lg transition text-left flex items-center gap-2 ${
              activeTab === 'flashcards' ? 'bg-blue-100 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FiLayout /> Flashcards
          </button>
        </div>

        {/* Chat History/Sessions */}
        <div className="flex-1 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
              <FiClock size={16} /> Chat History
            </h3>
            <button
              onClick={handleCreateNewSession}
              className="p-1 hover:bg-gray-100 rounded transition"
              title="New chat session"
            >
              <FiPlus size={16} className="text-blue-600" />
            </button>
          </div>

          {sessionsLoading ? (
            <div className="text-center py-4">
              <div className="text-xs text-gray-500">Loading sessions...</div>
            </div>
          ) : chatSessions.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-gray-500">No chat sessions yet.</p>
              <p className="text-xs text-gray-500 mt-2">Start asking questions to create one!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chatSessions.map((session) => (
                <div
                  key={session._id}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition group ${
                    activeSessionId === session._id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <button
                    onClick={() => setActiveSessionId(session._id)}
                    className={`flex-1 text-left truncate text-sm transition ${
                      activeSessionId === session._id
                        ? 'text-blue-700 font-semibold'
                        : 'text-gray-700'
                    }`}
                    title={session.title}
                  >
                    💬 {session.title}
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handlePrintSession(session._id, session.title);
                    }}
                    className="p-1 rounded hover:bg-blue-200 text-gray-600 hover:text-blue-700 opacity-0 group-hover:opacity-100 transition"
                    title="Print/Download PDF"
                  >
                    <FiPrinter size={16} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (window.confirm('Are you sure you want to delete this chat session?')) {
                        handleDeleteSession(session._id);
                      }
                    }}
                    className="p-1 rounded hover:bg-red-200 text-gray-600 hover:text-red-700 opacity-0 group-hover:opacity-100 transition"
                    title="Delete Session"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col" style={{ height: 'calc(100vh - 0px)' }}>
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4">
          <h1 className="text-xl font-bold text-gray-900">Study Assistant</h1>
          <p className="text-sm text-gray-600">Ask questions about your study materials</p>
        </div>

        {/* Content Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6" style={{ minHeight: 0 }}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="max-w-2xl mx-auto h-full flex flex-col">
              <div className="space-y-4 flex-1">
                {messages.length === 0 ? (
                  <div className="text-center py-12 text-gray-600">
                    <p className="text-lg">Start asking questions about your study materials!</p>
                    <p className="text-sm">The AI will answer based on your uploaded documents.</p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <div
                        key={index}
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                            msg.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 text-gray-900'
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                    {sending && (
                      <div className="flex justify-start">
                        <div className="bg-gray-200 text-gray-900 px-4 py-2 rounded-lg">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="max-w-2xl mx-auto overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : summary ? (
                <div className="bg-white p-6 rounded-lg">
                  <h2 className="text-2xl font-bold mb-4">Summary</h2>
                  <div className="prose prose-sm max-w-none whitespace-pre-wrap text-gray-700">
                    {summary}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-lg">No summary generated yet.</p>
                  <p className="text-sm">Click the Summary button in the sidebar to generate.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'quiz' && (
            <div className="max-w-2xl mx-auto overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : quiz && Array.isArray(quiz) && quiz.length > 0 ? (
                <div>
                  {quizSubmitted && (
                    <div className="bg-blue-50 border-l-4 border-blue-600 p-4 mb-6 rounded">
                      <p className="text-lg font-bold text-blue-900">
                        Quiz Results: {quizScore}/{quiz.length} Correct
                      </p>
                      <p className="text-blue-800">Score: {Math.round((quizScore / quiz.length) * 100)}%</p>
                    </div>
                  )}
                  
                  <div className="space-y-6">
                    {quiz.map((question, index) => (
                      <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition">
                        <h3 className="font-bold mb-4 text-gray-800">
                          Question {index + 1}: {question.question}
                        </h3>
                        <div className="space-y-3">
                          {question.options && question.options.map((option, optIndex) => {
                            const isSelected = selectedAnswers[index] === optIndex;
                            const isCorrectAnswer = optIndex === question.correctAnswer;
                            const isWrongSelected = isSelected && optIndex !== question.correctAnswer && quizSubmitted;
                            
                            let borderClass = 'border-gray-300';
                            let bgClass = 'bg-white hover:bg-gray-50';
                            
                            if (quizSubmitted) {
                              if (isCorrectAnswer) {
                                borderClass = 'border-green-500 border-2';
                                bgClass = 'bg-green-50';
                              } else if (isWrongSelected) {
                                borderClass = 'border-red-500 border-2';
                                bgClass = 'bg-red-50';
                              } else {
                                borderClass = 'border-gray-300';
                                bgClass = 'bg-white';
                              }
                            } else if (isSelected) {
                              borderClass = 'border-blue-500 border-2';
                              bgClass = 'bg-blue-50';
                            }
                            
                            return (
                              <label
                                key={optIndex}
                                className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition ${borderClass} ${bgClass}`}
                              >
                                <input
                                  type="radio"
                                  name={`quiz-${index}`}
                                  checked={isSelected}
                                  onChange={() => {
                                    if (!quizSubmitted) {
                                      setSelectedAnswers({ ...selectedAnswers, [index]: optIndex });
                                    }
                                  }}
                                  disabled={quizSubmitted}
                                  className="mr-3 w-4 h-4"
                                />
                                <span className="text-gray-800">{option}</span>
                                {quizSubmitted && isCorrectAnswer && (
                                  <span className="ml-auto text-green-600 font-bold text-sm">✓ Correct</span>
                                )}
                                {quizSubmitted && isWrongSelected && (
                                  <span className="ml-auto text-red-600 font-bold text-sm">✗ Wrong</span>
                                )}
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-4 mt-8 mb-6">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleQuizSubmit}
                        className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={Object.keys(selectedAnswers).length !== quiz.length}
                      >
                        Submit Quiz
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={handleResetQuiz}
                          className="flex-1 px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
                        >
                          Try Again
                        </button>
                        <button
                          onClick={() => setActiveTab('chat')}
                          className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
                        >
                          Back to Chat
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-lg">No quiz generated yet.</p>
                  <p className="text-sm">Click the Quiz button in the sidebar to generate.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'flashcards' && (
            <div className="max-w-2xl mx-auto overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : flashcards && Array.isArray(flashcards) && flashcards.length > 0 ? (
                <div className="grid gap-4">
                  {flashcards.map((card, index) => (
                    <div
                      key={index}
                      className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition cursor-pointer group"
                    >
                      <p className="text-sm text-gray-600 group-hover:text-gray-700">Card {index + 1}</p>
                      <p className="font-semibold text-lg mt-2">Q: {card.question}</p>
                      <p className="text-gray-600 mt-4">A: {card.answer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-600">
                  <p className="text-lg">No flashcards generated yet.</p>
                  <p className="text-sm">Click the Flashcards button in the sidebar to generate.</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message Input */}
        {activeTab === 'chat' && (
          <div className="border-t border-gray-200 bg-white p-4">
            <form onSubmit={handleSendMessage} className="max-w-2xl mx-auto flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                disabled={sending}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={sending || !input.trim()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <FiSend /> Send
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default Chat;
