# AI Study Assistant - Full Stack Application

A powerful web platform where users can upload study materials (PDF/DOCX) and interact with an AI assistant that answers questions strictly based on their uploaded content using Retrieval-Augmented Generation (RAG).

## Features

### Core Features
- ✅ **User Authentication** - Secure signup and login with JWT tokens
- ✅ **File Upload System** - Upload PDF and DOCX documents with automatic text extraction
- ✅ **Vector Embeddings** - Convert text into embeddings using OpenAI API
- ✅ **RAG-Based Chat** - Ask questions and get answers based only on uploaded content
- ✅ **Summarization** - Generate bullet-point summaries of study materials
- ✅ **Quiz Generator** - Create multiple-choice questions from notes
- ✅ **Flashcards Generator** - Generate Q&A pairs for revision

### UI Features
- Clean, modern ChatGPT-style interface
- Responsive design for all devices
- Dark-mode ready
- Real-time chat with loading indicators
- Intuitive sidebar navigation

## Tech Stack

### Frontend
- **React.js** - Modern UI framework with hooks
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Axios** - HTTP client for API calls
- **React Icons** - Icon library

### Backend
- **Node.js + Express.js** - Server framework
- **MongoDB** - Document database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **bcryptjs** - Password hashing

### AI & Data
- **OpenAI API** - Chat completions and embeddings
- **pdf-parse** - PDF text extraction
- **Mammoth** - DOCX text extraction
- **In-memory Vector Store** - Local embedding storage

## Project Structure

```
.
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── AuthContext.js      # Authentication context
│   │   │   ├── ProtectedRoute.js   # Route protection
│   │   ├── pages/
│   │   │   ├── Home.js             # Landing page
│   │   │   ├── Login.js            # Login page
│   │   │   ├── Signup.js           # Signup page
│   │   │   ├── Dashboard.js        # File management
│   │   │   ├── Chat.js             # Chat interface
│   │   ├── services/
│   │   │   └── api.js              # API calls
│   │   ├── App.js                  # Main app component
│   │   ├── index.js                # Entry point
│   │   └── index.css               # Tailwind styles
│   ├── public/
│   │   └── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── .env.example
│
├── server/                         # Express Backend
│   ├── models/
│   │   ├── User.js                # User schema
│   │   ├── Note.js                # Study material schema
│   │   └── Chat.js                # Chat history schema
│   ├── routes/
│   │   ├── authRoutes.js          # Auth endpoints
│   │   ├── fileRoutes.js          # File endpoints
│   │   └── aiRoutes.js            # AI endpoints
│   ├── controllers/
│   │   ├── authController.js      # Auth logic
│   │   ├── fileController.js      # File handling
│   │   └── aiController.js        # AI features
│   ├── middleware/
│   │   ├── auth.js                # JWT verification
│   │   └── upload.js              # File upload config
│   ├── utils/
│   │   ├── textExtraction.js      # PDF/DOCX parsing
│   │   ├── embeddings.js          # Text chunking & embeddings
│   │   └── openaiService.js       # OpenAI integration
│   ├── uploads/                   # Uploaded files storage
│   ├── server.js                  # Express app setup
│   ├── package.json
│   └── .env.example
│
├── .gitignore
└── README.md
```

## Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- OpenAI API key
- npm or yarn

### Backend Setup

1. Navigate to server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant
JWT_SECRET=your_secure_jwt_secret_here
OPENAI_API_KEY=sk-your-openai-key
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
# macOS/Linux
mongod

# Windows
mongod.exe

# Or use MongoDB Atlas (cloud)
```

6. Run the server:
```bash
npm run dev
# or
npm start
```

Server will be running at `http://localhost:5000`

### Frontend Setup

1. In a new terminal, navigate to client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure `.env`:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm start
```

Frontend will open at `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Files
- `POST /api/files/upload` - Upload a file (protected)
- `GET /api/files/files` - Get all user files (protected)
- `DELETE /api/files/files/:noteId` - Delete a file (protected)

### AI Features
- `POST /api/ai/chat` - Send chat message (protected)
- `GET /api/ai/chat/:noteId` - Get chat history (protected)
- `POST /api/ai/summarize` - Generate summary (protected)
- `POST /api/ai/generate-quiz` - Generate quiz questions (protected)
- `POST /api/ai/generate-flashcards` - Generate flashcards (protected)

## Usage

### 1. Create Account
- Click "Sign Up" and create a new account
- Provide name, email, and password

### 2. Upload Study Materials
- Go to Dashboard
- Click the upload area
- Select PDF or DOCX file
- File text is automatically extracted and embedded

### 3. Chat with AI
- Click "Chat" button on any uploaded file
- Ask questions about the content
- AI answers based ONLY on the uploaded material

### 4. Generate Study Tools
- **Summary** - Get bullet-point overview
- **Quiz** - Generate 5 MCQ questions
- **Flashcards** - Create 10 Q&A pairs for revision

## Authentication Flow

1. User registers/logs in
2. Backend validates credentials and generates JWT token
3. Token stored in localStorage
4. Token sent with each API request (Bearer token in Authorization header)
5. Protected routes verify token before allowing access
6. Token expires after 7 days

## RAG Implementation

The RAG system works as follows:

1. **Text Extraction**: PDF/DOCX files are parsed to extract text
2. **Chunking**: Text is split into 500-character chunks with 50-character overlap
3. **Embedding**: Each chunk is converted to embeddings using OpenAI's text-embedding-ada-002
4. **Storage**: Chunks and embeddings are stored in MongoDB
5. **Retrieval**: When user asks a question:
   - Question is compared with chunks using keyword matching (or cosine similarity)
   - Top 3 relevant chunks are selected
6. **Generation**: Selected chunks + question are sent to GPT-3.5-turbo
7. **Response**: AI generates answer based ONLY on the provided context

## Security Features

- ✅ Password hashing with bcryptjs
- ✅ JWT-based authentication
- ✅ Protected API routes
- ✅ File upload validation (only PDF/DOCX)
- ✅ File size limits (10MB max)
- ✅ CORS enabled
- ✅ Environment variables for sensitive data

## Error Handling

- Comprehensive try-catch blocks
- User-friendly error messages
- Logging of errors
- Validation of user input
- File upload error recovery

## Performance Optimizations

- Efficient text chunking
- Batch embedding generation
- Database indexing
- Async/await for non-blocking operations
- Caching of chat history
- Lazy loading of data

## Future Enhancements

- [ ] Dark mode implementation
- [ ] Voice input/output
- [ ] Real-time collaboration
- [ ] Pinecone integration for large-scale embeddings
- [ ] Subject-based filtering
- [ ] Study progress tracking
- [ ] Advanced search
- [ ] Export study materials
- [ ] Mobile app
- [ ] Multi-language support

## Troubleshooting

### MongoDB Connection Error
```
Error: connect ECONNREFUSED 127.0.0.1:27017
```
**Solution**: Start MongoDB service or update MONGODB_URI in .env

### OpenAI API Key Error
```
Error: Invalid API key provided
```
**Solution**: Check your API key in .env and ensure it's valid

### File Upload Error
```
Error: Only PDF and DOCX files are allowed
```
**Solution**: Ensure you're uploading .pdf or .docx files only

### CORS Error
```
Error: No 'Access-Control-Allow-Origin' header
```
**Solution**: Ensure backend is running and CORS is configured

### Port Already in Use
```
Error: listen EADDRINUSE :::5000
```
**Solution**: Kill process using port 5000 or change PORT in .env

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see LICENSE file for details.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review API documentation
3. Open an issue on GitHub

## Author

Created as a full-stack AI application demonstrating RAG capabilities.

---

**Happy studying!** 📚✨
