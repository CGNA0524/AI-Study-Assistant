import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../components/AuthContext';
import { FiUploadCloud, FiMessageCircle, FiZap, FiPlay, FiGithub, FiTwitter, FiLinkedin } from 'react-icons/fi';

const Home = () => {
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(AuthContext);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <img src="/images/studyai_logo.png" alt="StudyAI Logo" className="w-12 h-12 drop-shadow-sm" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent">StudyAI</h1>
          </div>
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
            <a href="#testimonials" className="text-gray-600 hover:text-gray-900 transition">Testimonials</a>
            <a href="#pricing" className="text-gray-600 hover:text-gray-900 transition">Pricing</a>
          </div>
          
          <div className="flex gap-3">
            {isLoggedIn ? (
              <>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 transition"
                >
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Go to Chat
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate('/login')}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 border border-gray-300 rounded-lg transition"
                >
                  Login
                </button>
                <button
                  onClick={() => navigate('/signup')}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Sign Up
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side */}
          <div className="space-y-6">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Your Personal<br />AI Study<br />Assistant
            </h1>
            <p className="text-lg text-gray-600">
              Upload notes. Ask anything. Learn faster.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate(isLoggedIn ? '/dashboard' : '/signup')}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-semibold text-lg"
              >
                Get Started
              </button>
              <button
                className="px-8 py-3 text-blue-600 border-2 border-blue-600 rounded-lg hover:bg-blue-50 transition font-semibold text-lg flex items-center gap-2"
              >
                <FiPlay size={20} /> Watch Demo
              </button>
            </div>
          </div>

          {/* Right Side - Chat UI Mock */}
          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/images/studyai_logo.png" alt="StudyAI Logo" className="w-8 h-8 drop-shadow" />
                <span className="text-white font-bold text-lg">StudyAI</span>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/10 rounded-lg transition">−</button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition">□</button>
                <button className="p-2 hover:bg-white/10 rounded-lg transition">×</button>
              </div>
            </div>
            
            <div className="p-6 space-y-4 h-96 overflow-y-auto bg-gray-50">
              {/* User Message */}
              <div className="flex justify-end">
                <div className="bg-blue-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xs">
                  <p>Explain photosynthesis</p>
                </div>
              </div>

              {/* AI Response */}
              <div className="flex">
                <div className="bg-white text-gray-900 rounded-2xl rounded-tl-none px-4 py-3 max-w-xs border border-gray-200">
                  <p className="font-semibold text-sm mb-2">Photosynthesis</p>
                  <p className="text-sm text-gray-600">The process by which plants, algae, and some bacteria convert light energy into chemical energy in the form of glucose. It occurs mainly in the chloroplasts of plant cells where chlorophyll captures sunlight.</p>
                  <p className="text-sm text-blue-600 mt-3">Generate an MCQ quiz about it</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 bg-white">
              <input 
                type="text" 
                placeholder="Ask anything..." 
                className="w-full px-4 py-3 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="flex justify-center py-4">
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-full px-4 py-2">
          <span className="text-green-600 text-lg">●</span>
          <span className="text-gray-700 text-sm font-medium">Used by 500+ students</span>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-6 py-12" id="features">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
          Chat With Your Study Assistant
        </h2>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Upload Notes */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <FiUploadCloud size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Upload Notes</h3>
            <p className="text-gray-600">Upload PDFs and Word documents in seconds</p>
          </div>

          {/* Ask Anything */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiMessageCircle size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Ask Anything</h3>
            <p className="text-gray-600">Ask any question and get answers directly based on your notes</p>
          </div>

          {/* Smart Summaries */}
          <div className="bg-white p-8 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <FiZap size={24} className="text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Smart Summaries</h3>
            <p className="text-gray-600">Get concise summaries of your study materials</p>
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid md:grid-cols-2 gap-8 items-center bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Upload Notes</h4>
              <p className="text-gray-600 text-sm">Upload PDFs and Word documents in seconds. in seconds</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2">Ask Anything</h4>
              <p className="text-gray-600 text-sm">Ask any question and get answers directly based on your notes.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-lg text-gray-900 font-semibold">
              "This app has transformed how I study! I can upload my notes and the AI provides clear, concise answers to all my questions. It's like having a personal tutor available 24/7."
            </p>
            <p className="text-sm text-gray-600">- 5 days ago</p>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="max-w-7xl mx-auto px-6 py-12" id="testimonials">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-10">
          Loved by Students
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Testimonial 1 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <p className="text-gray-700 mb-4">
              "This app has transformed how I study! I can upload my notes and the AI provides clear, concise answers to all my questions. It's like having a personal tutor available 24/7."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">Sarah Chen</p>
                <p className="text-gray-600 text-xs">Pre-med Student</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 hover:shadow-lg transition">
            <p className="text-gray-700 mb-4">
              "Amazing tool for exam prep. The quiz generator is a game changer! It makes multiple choice questions from my notes in seconds."
            </p>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full"></div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">James Rodriguez</p>
                <p className="text-gray-600 text-xs">Engineering Major</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-10 text-center space-y-6">
          <h2 className="text-3xl font-bold text-white">
            Start Studying Smarter Today
          </h2>
          <button
            onClick={() => navigate(isLoggedIn ? '/chat' : '/signup')}
            className="inline-block px-6 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition font-semibold"
          >
            Get Started Free
          </button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-10 mt-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <img src="/images/studyai_logo.png" alt="StudyAI Logo" className="w-7 h-7 drop-shadow" />
                <span className="text-white font-bold text-base">StudyAI</span>
              </div>
              <p className="text-xs">Learn smarter, not harder.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Product</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white transition">Features</a></li>
                <li><a href="#" className="hover:text-white transition">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Company</h4>
              <ul className="space-y-1 text-xs">
                <li><a href="#" className="hover:text-white transition">About</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm">Follow</h4>
              <div className="flex gap-3">
                <a href="#" className="text-gray-400 hover:text-white transition"><FiTwitter size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FiGithub size={20} /></a>
                <a href="#" className="text-gray-400 hover:text-white transition"><FiLinkedin size={20} /></a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex justify-between items-center text-xs">
            <p>&copy; AI Study Assistant. All rights reserved.</p>
            <div className="flex gap-4 text-xs">
              <a href="#" className="hover:text-white transition">Privacy Policy</a>
              <a href="#" className="hover:text-white transition">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
