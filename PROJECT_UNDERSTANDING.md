# 🎓 AI Study Assistant - Complete Learning Guide

## 📋 What Is This Project?

**AI Study Assistant** is a full-stack web application that lets students upload study materials (PDF, DOCX, TXT) and chat with an AI that answers questions **ONLY** based on their uploaded content.

**Real-World Use Case:**
- Student uploads their biology textbook (PDF)
- Student asks "What is photosynthesis?"
- AI searches the uploaded document and answers based on what's in it
- If it doesn't mention it, AI says "Not found in your uploaded materials"

### Key Features
✅ **User Authentication** - Sign up, login with email/password or Google OAuth  
✅ **File Upload** - Upload PDF, DOCX, or TXT files (max 10MB)  
✅ **Smart Search** - Automatically finds relevant sections in uploaded content  
✅ **AI Chat** - Ask questions about your uploaded materials  
✅ **Study Tools** - Generate summaries, quizzes, and flashcards  
✅ **Chat Sessions** - Organize multiple conversations for different topics  
✅ **Export to PDF** - Download summaries and study materials  

---

## 🏗️ Project Architecture Overview

### The Three Main Layers

```
┌─────────────────────────────────────────┐
│        FRONTEND (React.js)              │  Port 3000
│  ├─ Pages: Login, Dashboard, Chat      │
│  ├─ State: AuthContext (user login)    │
│  └─ Services: API calls via axios      │
└────────────┬────────────────────────────┘
             │ HTTP REST API
             │
┌────────────▼────────────────────────────┐
│      BACKEND (Node.js + Express)        │  Port 5000
│  ├─ Routes: /api/auth, /api/files,     │
│  ├─ Controllers: Business logic        │
│  ├─ Models: User, Note, Chat           │
│  └─ Utils: Text extraction, AI calls   │
└────────────┬────────────────────────────┘
             │ Database queries
             │
┌────────────▼────────────────────────────┐
│      MONGODB (Document Database)        │
│  ├─ Users: Store user accounts         │
│  ├─ Notes: Store uploaded files        │
│  ├─ Chat: Store conversations          │
│  └─ ChatSessions: Store chat groups    │
└─────────────────────────────────────────┘

External Services:
├─ Groq API (AI inference - fast & free)
└─ Google OAuth (Alternative login)
```

---

## 📊 How Data Flows (Step by Step)

### Scenario: Student Uploads a PDF

```
STEP 1: User selects file in Dashboard
        ↓
        Frontend: handleFileUpload() triggered
        ↓
STEP 2: FormData created with file + JWT token
        ↓
        fetch POST /api/files/upload
        ↓
STEP 3: Backend receives file
        ├─ Verify JWT token (auth middleware)
        ├─ Validate file type (PDF/DOCX/TXT only)
        └─ Save to uploads/ folder
        ↓
STEP 4: Extract text from PDF
        ├─ Read file from disk
        ├─ Use pdf-parse library
        └─ Get full text content
        ↓
STEP 5: Split text into chunks
        ├─ Divide into 1000 character chunks
        ├─ 100 char overlap between chunks
        └─ Example: [chunk1, chunk2, chunk3...]
        ↓
STEP 6: Store in MongoDB
        ├─ Create Note document
        ├─ userId: "user123" (from JWT)
        ├─ fileName: "biology_notes.pdf"
        ├─ content: full text
        ├─ chunks: [{text: "chunk1"}, {text: "chunk2"}...]
        └─ fileSize: 2048000 bytes
        ↓
STEP 7: Return to Frontend
        ├─ Send back Note object
        ├─ Frontend displays in Dashboard
        └─ User can now chat about this file
```

### Scenario: Student Asks a Question

```
STEP 1: User types "What is photosynthesis?" in Chat
        ↓
        Frontend: handleSendMessage() triggered
        ↓
STEP 2: Find matching chunks
        ├─ Search question: "What is photosynthesis?"
        ├─ Split into words: ["what", "is", "photosynthesis"]
        ├─ Compare with all chunks from the Note
        ├─ Find chunks that contain these words
        └─ Score and rank by relevance
        ↓
STEP 3: Select top 4 chunks
        Example chunks:
        - "Photosynthesis is the process where..."
        - "Plants use sunlight to convert energy..."
        - "The chloroplast is where photosynthesis occurs..."
        - "Oxygen is produced during photosynthesis..."
        ↓
STEP 4: Build prompt for AI
        Prompt = "Context:\n" +
                 [relevant chunks] +
                 "\n\nQuestion: What is photosynthesis?" +
                 "\n\nAnswer:"
        ↓
STEP 5: Send to Groq API
        ├─ Make HTTP request to Groq
        ├─ Pass the prompt
        ├─ Groq AI generates answer
        └─ Get response: "Photosynthesis is the process..."
        ↓
STEP 6: Clean and return response
        ├─ Remove prompt echo (if any)
        ├─ Save conversation to MongoDB
        ├─ Return to Frontend
        └─ Display in chat bubble
        ↓
STEP 7: Save to Chat History
        ├─ Create ChatSession (or use existing)
        ├─ Add user message
        ├─ Add AI response
        ├─ Store in MongoDB
        └─ Can view history later
```

---

## 🗂️ File Structure Explained

### Backend Structure

```
Backend/
│
├── server.js
│   └─ Main entry point
│   └─ Initializes Express app
│   └─ Connects to MongoDB
│   └─ Sets up CORS, routes
│
├── controllers/
│   │
│   ├── authController.js
│   │   ├─ register() → Create new user account
│   │   ├─ login() → Verify email/password
│   │   ├─ googleAuth() → Handle Google OAuth
│   │   ├─ getProfile() → Get current user info
│   │   └─ deleteAccount() → Delete user account
│   │
│   ├── fileController.js
│   │   ├─ uploadFile() → Handle PDF/DOCX upload
│   │   ├─ getFiles() → List user's files
│   │   └─ deleteFile() → Remove a file
│   │
│   └── aiController.js
│       ├─ chat() → Answer question (legacy)
│       ├─ summarize() → Generate summary
│       ├─ generateQuiz() → Create quiz questions
│       ├─ generateFlashcards() → Create flashcards
│       ├─ createChatSession() → Start new conversation
│       ├─ addMessageToSession() → Add message to chat
│       ├─ getChatSessions() → List conversations
│       └─ deleteChatSession() → Remove conversation
│
├── routes/
│   │
│   ├── authRoutes.js
│   │   POST /register → Create account
│   │   POST /login → Login
│   │   POST /google → Google OAuth
│   │   GET /profile → Get user info
│   │   DELETE /account → Delete account
│   │
│   ├── fileRoutes.js
│   │   POST /upload → Upload file
│   │   GET /files → Get all user files
│   │   DELETE /files/:noteId → Delete file
│   │
│   └── aiRoutes.js
│       POST /chat → Ask question (legacy)
│       POST /sessions → Create chat session
│       POST /sessions/message → Add message
│       GET /sessions/:noteId → Get all sessions for file
│       GET /session/:sessionId → Get single session
│       DELETE /session/:sessionId → Delete session
│       POST /summarize → Generate summary
│       POST /generate-quiz → Generate quiz
│       POST /generate-flashcards → Generate flashcards
│
├── models/
│   │
│   ├── User.js
│   │   Schema:
│   │   {
│   │     _id: ObjectId,
│   │     name: String,
│   │     email: String (unique),
│   │     password: String (hashed),
│   │     googleId: String (optional, for OAuth),
│   │     createdAt: Date,
│   │     updatedAt: Date
│   │   }
│   │
│   ├── Note.js (Uploaded Files)
│   │   Schema:
│   │   {
│   │     _id: ObjectId,
│   │     userId: ObjectId (reference to User),
│   │     fileName: String,
│   │     originalFileName: String,
│   │     content: String (full text),
│   │     chunks: [{
│   │       text: String,
│   │       embedding: [Number] (not always used)
│   │     }],
│   │     fileSize: Number,
│   │     uploadedAt: Date,
│   │     updatedAt: Date
│   │   }
│   │
│   ├── Chat.js (Legacy - not used actively)
│   │   Schema:
│   │   {
│   │     _id: ObjectId,
│   │     userId: ObjectId,
│   │     noteId: ObjectId,
│   │     messages: [{
│   │       role: String ('user' or 'assistant'),
│   │       content: String,
│   │       timestamp: Date
│   │     }],
│   │     createdAt: Date
│   │   }
│   │
│   └── ChatSession.js (Active Chat Storage)
│       Schema:
│       {
│         _id: ObjectId,
│         userId: ObjectId,
│         noteId: ObjectId,
│         title: String (e.g., "Biology Q&A"),
│         messages: [{
│           role: String ('user' or 'assistant'),
│           content: String,
│           timestamp: Date
│         }],
│         createdAt: Date,
│         updatedAt: Date
│       }
│
├── middleware/
│   │
│   ├── auth.js
│   │   └─ Verify JWT token from request header
│   │   └─ Extract userId and attach to req.userId
│   │   └─ Reject if no token or invalid
│   │
│   └── upload.js
│       └─ Multer configuration
│       └─ Save files to uploads/ folder
│       └─ Only allow PDF, DOCX, TXT
│       └─ Max file size: 10MB
│       └─ Unique filename: timestamp + random
│
├── utils/
│   │
│   ├── textExtraction.js
│   │   ├─ extractTextFromPDF() → Use pdf-parse
│   │   ├─ extractTextFromDocx() → Use mammoth
│   │   ├─ extractTextFromTxt() → Read file
│   │   └─ extractTextFromFile() → Route to correct parser
│   │
│   ├── chunk.js
│   │   └─ chunkText() → Split text into 1000 char chunks
│   │                  → 100 char overlap between chunks
│   │                  → Try to break at sentence boundaries
│   │
│   └── openaiService.js
│       ├─ sendMessage() → Chat with Groq API
│       ├─ summarizeText() → Summarize using Groq
│       ├─ generateQuiz() → Generate quiz using Groq
│       └─ generateFlashcards() → Generate flashcards using Groq
│
├── uploads/
│   └─ Temporary storage for uploaded files
│   └─ Files deleted after text extraction
│
├── package.json
├── .env
└── node_modules/
```

### Frontend Structure

```
Frontend/
│
├── src/
│   │
│   ├── components/
│   │   │
│   │   ├── AuthContext.js
│   │   │   └─ Global state for user login
│   │   │   └─ Stores: isLoggedIn, user, token
│   │   │   └─ Methods: login(), logout()
│   │   │
│   │   ├── Header.js
│   │   │   └─ Navigation bar
│   │   │   └─ Shows logo and logout button
│   │   │
│   │   └── ProtectedRoute.js
│   │       └─ Wrapper for authenticated pages
│   │       └─ Redirects to login if not authenticated
│   │
│   ├── pages/
│   │   │
│   │   ├── Home.js
│   │   │   └─ Landing page
│   │   │   └─ Shows features overview
│   │   │   └─ Links to login/signup
│   │   │
│   │   ├── Login.js
│   │   │   └─ Email/password login form
│   │   │   └─ Google OAuth button
│   │   │   └─ Link to signup
│   │   │
│   │   ├── Signup.js
│   │   │   └─ Registration form
│   │   │   └─ Create new account
│   │   │   └─ Link to login
│   │   │
│   │   ├── Dashboard.js
│   │   │   └─ File upload area
│   │   │   └─ List of uploaded files
│   │   │   └─ Delete file button
│   │   │   └─ Link to chat for each file
│   │   │
│   │   ├── Chat.js
│   │   │   └─ Main chat interface
│   │   │   └─ Message input and display
│   │   │   └─ Multiple tabs: Chat, Summary, Quiz, Flashcards
│   │   │   └─ Sidebar with chat sessions
│   │   │
│   │   └── Profile.js
│   │       └─ User profile page
│   │       └─ Delete account button
│   │
│   ├── services/
│   │   └─ api.js
│   │      └─ Axios instance with base URL
│   │      └─ Auto-adds JWT token to all requests
│   │      └─ Export functions for all API calls
│   │      └─ Functions: login, register, uploadFile, getFiles, etc.
│   │
│   ├── App.js
│   │   └─ Main router component
│   │   └─ Define all routes
│   │   └─ Wrap with AuthProvider
│   │
│   ├── index.js
│   │   └─ React entry point
│   │
│   └── index.css
│       └─ Tailwind CSS styles
│
├── public/
│   ├── index.html
│   └─ Root HTML file
│
├── package.json
├── tailwind.config.js
└── node_modules/
```

---

## 🔐 Authentication Flow (How Login Works)

### User Registration Flow

```
User clicks "Sign Up" →

Frontend: Signup.js
├─ User enters: name, email, password
├─ Validate: all fields required, password length
└─ Call registerAPI(name, email, password)
  │
  └─→ Backend: POST /api/auth/register
      ├─ Validate all fields exist
      ├─ Check if email already exists
      ├─ Hash password using bcryptjs (salt rounds: 10)
      ├─ Create User document in MongoDB
      ├─ Generate JWT token:
      │  {
      │    userId: user._id,
      │    exp: Date.now() + 7 days
      │  }
      └─ Return: { token, user: {id, name, email} }
        │
        └─→ Frontend: AuthContext.login()
            ├─ Save token to localStorage
            ├─ Save user data to localStorage
            ├─ Set isLoggedIn = true
            └─ Redirect to /dashboard
```

### User Login Flow

```
User enters email/password →

Frontend: Login.js
├─ Validate email and password
└─ Call loginAPI(email, password)
  │
  └─→ Backend: POST /api/auth/login
      ├─ Get email and password from request
      ├─ Find user by email
      ├─ Compare password using bcryptjs
      ├─ If invalid, return error
      ├─ Generate JWT token (same as above)
      └─ Return: { token, user: {id, name, email} }
        │
        └─→ Frontend: AuthContext.login()
            ├─ Save token to localStorage
            └─ Redirect to /dashboard
```

### Google OAuth Flow

```
User clicks "Sign in with Google" →

Frontend: Login.js
├─ Load Google Sign-In script
├─ Google SDK renders button
└─ User clicks and Google shows popup
  │
  └─→ Google: Generate ID token
      └─ Return token to Frontend
        │
        └─→ Frontend: handleGoogleSuccess()
            ├─ Extract token from response
            └─ Call POST /api/auth/google
              │
              └─→ Backend: POST /api/auth/google
                  ├─ Receive Google token
                  ├─ Verify token with Google
                  ├─ Extract: googleId, email, name
                  ├─ Check if user exists
                  ├─ If not, create new user
                  ├─ Generate JWT token
                  └─ Return: { token, user }
                    │
                    └─→ Frontend: AuthContext.login()
                        └─ Save and redirect
```

### Google OAuth Implementation Status

**✅ FULLY WORKING** (As of April 22, 2026)

**What was missing**: `google-auth-library` package was not installed  
**Root cause**: Required dependency listed in code but not in package.json  
**Fix applied**: Added `google-auth-library@9.6.3` to Backend/package.json and ran `npm install`

**Current Testing Results**:
```
✅ Google token verification: WORKING
✅ User email extraction: WORKING  
✅ New user creation: WORKING
✅ Existing user linking: WORKING
✅ JWT token generation: WORKING
✅ Redirect to dashboard: WORKING

Backend logs show successful OAuth:
[OAuth] Token verified successfully for email: chiragnagra256@gmail.com
[OAuth] Successfully authenticated user: chiragnagra256@gmail.com
```

**Requirements for full functionality**:
- Add `http://localhost:3000` to Google Cloud Console Authorized JavaScript Origins
  (Currently works in development mode with google-auth-library)

### How JWT Authentication Works

Every request from Frontend to Backend includes:
```
Authorization Header:
  Authorization: Bearer <JWT_TOKEN>

Backend receives request:
├─ Extract token from header
├─ Verify token using JWT_SECRET
├─ If valid:
│  ├─ Decode token
│  ├─ Extract userId
│  ├─ Attach to req.userId
│  └─ Continue to handler
├─ If invalid or expired:
│  └─ Return 401 Unauthorized
```

---

## 📁 File Upload & Storage Process

### How File Upload Works

```
Step 1: User selects PDF file in Dashboard

Step 2: Frontend sends to Backend
  POST /api/files/upload
  Headers: Authorization: Bearer <token>
  Body: FormData {
    file: <File object>,
    userId: extracted from JWT
  }

Step 3: Backend receives (middleware/upload.js)
  ├─ Multer middleware processes file
  ├─ Save to disk: uploads/timestamp-random.pdf
  ├─ Create req.file object:
  │  {
  │    fieldname: 'file',
  │    originalname: 'biology.pdf',
  │    mimetype: 'application/pdf',
  │    size: 2048000,
  │    path: 'uploads/1713700000000-123456789.pdf'
  │  }
  └─ Pass to controller

Step 4: Backend extracts text (fileController.js)
  ├─ Get file path and mime type
  ├─ Call extractTextFromFile()
  │  ├─ Read file from disk
  │  ├─ Use pdf-parse library
  │  └─ Get full text content
  └─ Text extracted and ready

Step 5: Split text into chunks (utils/chunk.js)
  ├─ Text: "Photosynthesis is... Plants need... Light reactions..."
  ├─ Chunk size: 1000 characters
  ├─ Overlap: 100 characters
  ├─ Split at sentence boundaries (try to break at periods)
  └─ Result: [{text: "chunk1"}, {text: "chunk2"}, ...]

Step 6: Save to MongoDB (models/Note.js)
  ├─ Create Note document:
  │  {
  │    userId: ObjectId("123..."),
  │    fileName: "1713700000000-123456789.pdf",
  │    originalFileName: "biology.pdf",
  │    fileSize: 2048000,
  │    content: "Full text of PDF...",
  │    chunks: [
  │      {text: "Photosynthesis is..."},
  │      {text: "Plants need light..."}
  │    ],
  │    uploadedAt: Date.now(),
  │    updatedAt: Date.now()
  │  }
  └─ Save to database

Step 7: Clean up and respond
  ├─ Delete file from disk (uploads/...)
  ├─ Send back Note object
  └─ Frontend updates file list
```

### File Types Supported

| Type | MIME Type | Library | Method |
|------|-----------|---------|--------|
| PDF | application/pdf | pdf-parse | extractTextFromPDF() |
| DOCX | application/vnd.openxmlformats-officedocument.wordprocessingml.document | mammoth | extractTextFromDocx() |
| TXT | text/plain | fs module | extractTextFromTxt() |

---

## 🤖 Fine-Tuned AI Model (Core of Your Project)

### What is Fine-Tuning?

Fine-tuning is training a pre-trained model on your own specific data to make it better at your particular task.

```
Generic LLM (knows everything)
         ↓
    Fine-Tuning
    (Train on study Q&A data)
         ↓
Specialized Model (Expert at study materials)
```

**Your Project:**
- **Base Model**: TinyLlama-1.1B-Chat-v1.0 (lightweight, 1.1 billion parameters)
- **Training Data**: Education/study Q&A pairs
- **Technique**: LoRA (Low-Rank Adaptation)
- **Result**: Model specialized for student study materials

### Why TinyLlama?

| Aspect | TinyLlama | GPT-4 | Llama-70B |
|--------|-----------|-------|-----------|
| Size | 1.1B params | Huge | 70B params |
| Speed | Fast (can run local) | Cloud only | Slow |
| Cost | Free | Expensive | Expensive |
| Memory | 2-4 GB | N/A | 140+ GB |
| Accuracy | Good for domain | Excellent | Very good |
| **Best For** | **Local projects** | General use | Production |

**You chose TinyLlama because:**
- ✅ Small enough to run locally
- ✅ Fast inference (8-15 seconds)
- ✅ Can be fine-tuned with limited data
- ✅ No API costs (runs on your machine)
- ✅ Perfect for students/learning projects

### LoRA (Low-Rank Adaptation)

Instead of retraining all 1.1 billion parameters, LoRA adds small trainable layers:

```
Original Model Weights
         ↓
     (FROZEN - don't change)
         ↓
    Add LoRA Adapter
    (Small trainable layers)
         ↓
  Fine-Tuned Behavior
  (Without retraining entire model)

Result: 
├─ Original: 1.1B parameters
├─ LoRA Adapter: ~2-5M parameters (0.2% of original)
└─ Total: Still compact, much faster training
```

### Your Model Architecture

**File: `Backend/ml-api/fine-tuned-model/adapter_config.json`**

```json
{
  "peft_type": "LORA",
  "base_model_name_or_path": "TinyLlama/TinyLlama-1.1B-Chat-v1.0",
  "r": 8,                    // Rank (lower = smaller, faster)
  "lora_alpha": 16,          // Scaling factor
  "lora_dropout": 0.05,      // Regularization
  "target_modules": [        // Which layers to train
    "v_proj",                // Value projection in attention
    "q_proj"                 // Query projection in attention
  ],
  "task_type": "CAUSAL_LM"   // Language modeling task
}
```

**What Each Parameter Does:**

| Parameter | Value | Meaning |
|-----------|-------|---------|
| r (rank) | 8 | Low rank matrices (8x8) for adapter |
| lora_alpha | 16 | Scaling factor (alpha/r = 2.0 scaling) |
| lora_dropout | 0.05 | 5% dropout for regularization |
| target_modules | q_proj, v_proj | Train only query & value in attention |

**Why target q_proj and v_proj?**
- These are key layers in attention mechanism
- Most important for understanding relationships
- Training these + LoRA is enough for good results
- Much faster than training all layers

### Model Files Explained

```
fine-tuned-model/
├── adapter_config.json          # LoRA configuration (above)
│
├── adapter_model.safetensors    # The actual trained weights
│   └─ This is the magic file
│   └─ Contains the ~2-5M trainable parameters
│   └─ Loaded on top of base TinyLlama
│
├── tokenizer.json               # Vocabulary mapping
│   └─ Converts words ↔ numbers
│   └─ Same as TinyLlama's tokenizer
│
├── tokenizer_config.json        # Tokenizer settings
│   └─ Special tokens
│   └─ Padding strategy
│
├── chat_template.jinja          # Chat format template
│   └─ How to format messages for the model
│   └─ Example: "[INST] question [/INST] answer"
│
└── README.md                    # Model documentation
```

### Flask API for Fine-Tuned Model

**File: `Backend/ml-api/app.py`**

This is a separate Python server running on **port 5001**:

```python
# Load model (happens once at startup)
from transformers import AutoModelForCausalLM
from peft import PeftModel

base_model = "TinyLlama/TinyLlama-1.1B-Chat-v1.0"
model = AutoModelForCausalLM.from_pretrained(base_model)
model = PeftModel.from_pretrained(model, "fine-tuned-model")

device = "cuda" if torch.cuda.is_available() else "cpu"
model.to(device)  # Use GPU if available
model.eval()      # Set to evaluation mode

# API endpoint
@app.route("/generate", methods=["POST"])
def generate():
    prompt = request.json["prompt"]
    
    # Tokenize prompt
    inputs = tokenizer(prompt, return_tensors="pt").to(device)
    
    # Generate response
    outputs = model.generate(
        **inputs,
        max_new_tokens=60,        # Max response length
        do_sample=True,           # Random sampling (more natural)
        temperature=0.7,          # Randomness (0=deterministic, 1=random)
        top_p=0.9                 # Nucleus sampling
    )
    
    # Extract only new tokens (not the prompt)
    input_len = inputs["input_ids"].shape[1]
    generated_tokens = outputs[0][input_len:]
    response = tokenizer.decode(generated_tokens, skip_special_tokens=True)
    
    return jsonify({"response": response})
```

**Parameters Explained:**

| Parameter | Value | Effect |
|-----------|-------|--------|
| max_new_tokens | 60 | Generate up to 60 new tokens (~150 words) |
| temperature | 0.7 | Moderate randomness (0=boring, 1=chaotic) |
| top_p | 0.9 | Keep top 90% probability tokens |
| do_sample | True | Use sampling (not greedy) |

### Integration with Node.js Backend

**File: `Backend/controllers/aiController.js`**

```javascript
// When user asks a question, we can route to:

// Option 1: Groq API (Fast, reliable, no setup)
const callGroqAPI = async (prompt) => {
  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{role: 'user', content: prompt}],
    temperature: 0.7,
    max_tokens: 1000
  });
  return completion.choices[0].message.content;
};

// Option 2: Fine-Tuned TinyLlama (Local, customized, slower)
const callFineTunedModel = async (prompt) => {
  const res = await axios.post(
    'http://localhost:5001/generate',
    { prompt },
    { timeout: 15000 }  // 15 second timeout
  );
  return res.data.response;
};

// In chat function:
const chat = async (req, res) => {
  const { noteId, message } = req.body;
  const note = await Note.findById(noteId);
  
  // Build prompt with context from uploaded file
  const prompt = buildFineTunedPrompt(note, message);
  
  // Route to model (could check message content to choose)
  const response = await callFineTunedModel(prompt);
  
  // Save to chat history
  await ChatSession.updateOne(
    { _id: sessionId },
    { $push: { messages: [{role: 'user', content: message}, {role: 'assistant', content: response}] } }
  );
  
  res.json({ response });
};
```

### Data Flow: Question → Fine-Tuned Response

```
STEP 1: User asks question
        "What is photosynthesis?"
        ↓
STEP 2: Backend (aiController.js)
        ├─ Get uploaded file (Note)
        ├─ Find relevant chunks
        ├─ Build prompt with context
        └─ Prompt = "Context:\n[chunks]\n\nQuestion: What is photosynthesis?\n\nAnswer:"
        ↓
STEP 3: Call Flask API
        POST http://localhost:5001/generate
        Body: { prompt: "Context:\n..." }
        ↓
STEP 4: Flask Server (app.py)
        ├─ Receive prompt
        ├─ Tokenize into numbers
        ├─ Pass to TinyLlama model
        ├─ TinyLlama uses LoRA adapter
        ├─ Generate response tokens
        └─ Decode back to text
        ↓
STEP 5: Return response
        Response: "Photosynthesis is the process where..."
        ↓
STEP 6: Backend receives response
        ├─ Clean output (remove artifacts)
        ├─ Filter low-quality responses
        ├─ Save to ChatSession
        └─ Return to Frontend
        ↓
STEP 7: Frontend displays
        User sees AI answer in chat
```

### Comparison: Groq vs Fine-Tuned TinyLlama

| Aspect | Groq API | Fine-Tuned TinyLlama |
|--------|----------|-------------------|
| **Speed** | 500ms - 1s | 8-15 seconds |
| **Quality** | Excellent | Good (domain-specific) |
| **Cost** | Free tier available | Free (local) |
| **Setup** | API key only | Python, PyTorch, CUDA |
| **Customization** | None | Complete control |
| **Internet** | Requires connection | Works offline |
| **Best For** | Production | Learning, experimentation |

**Your Project Uses Both:**
- **Default**: Groq (fast for immediate feedback)
- **Alternative**: Fine-tuned TinyLlama (when you want custom behavior)

### Training Your Fine-Tuned Model

To understand how the model was trained:

```
Training Process:
├─ 1. Prepare Data
│  ├─ Collect Q&A pairs from study materials
│  ├─ Format: [INST] question [/INST] answer [/END]
│  └─ Create train/test splits
│
├─ 2. Setup Training Script
│  ├─ Use HuggingFace `transformers` library
│  ├─ Use PEFT library for LoRA
│  ├─ Load base TinyLlama model
│  └─ Attach LoRA adapter
│
├─ 3. Training
│  ├─ Feed Q&A pairs to model
│  ├─ Model learns to predict answers
│  ├─ LoRA weights are adjusted
│  ├─ Takes 30 min - 2 hours (depending on data)
│  └─ Save adapter weights
│
├─ 4. Evaluation
│  ├─ Test on unseen questions
│  ├─ Measure BLEU, ROUGE scores
│  ├─ Compare with Groq
│  └─ Generate evaluation report
│
└─ 5. Deployment
   ├─ Package fine-tuned-model/
   ├─ Deploy Flask API
   └─ Integrate with Node.js backend
```

### Key Files for Fine-Tuning

```
Backend/ml-api/
├── app.py                       # Flask server (MAIN FILE)
├── requirements.txt             # Python dependencies
├── fine-tuned-model/            # Trained model weights
│   ├── adapter_model.safetensors  # LoRA weights (THE MAGIC)
│   ├── adapter_config.json      # LoRA configuration
│   ├── tokenizer.json           # Word vocabulary
│   └── chat_template.jinja      # Chat format
│
├── benchmark_prompts.json       # Test questions
├── benchmark_smoke.json         # Quick test suite
├── smoke_eval_report.json       # Evaluation results
└── IMPROVEMENT_PLAN.md          # Future improvements
```

### How to Run Fine-Tuned Model Locally

```bash
# 1. Install Python dependencies
cd Backend/ml-api
pip install -r requirements.txt

# 2. Start Flask server
python app.py

# Expected output:
# * Running on http://0.0.0.0:5001

# 3. Test the model
curl -X POST http://localhost:5001/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Context: Photosynthesis is...\n\nQuestion: What is photosynthesis?\n\nAnswer:"}'

# 4. Response:
# {"response": "Photosynthesis is the process..."}
```

### Performance Metrics (From Your Training)

The model has been evaluated on benchmark prompts:

**Files:**
- `smoke_eval_report.json` - Initial evaluation
- `smoke_eval_report_v2.json` - Improved version
- `last_eval_report.json` - Latest results

**Typical Metrics:**
- BLEU Score: How similar to reference answers
- ROUGE Score: Overlap with reference answers
- Perplexity: How confident in predictions
- F1 Score: Combined precision + recall

### Advantages of Your Fine-Tuned Model

✅ **Domain-Specific**: Trained on study Q&A data  
✅ **Privacy**: Runs locally, no data sent to cloud  
✅ **Customizable**: Can retrain on new data  
✅ **Cost-Effective**: No API fees  
✅ **Offline**: Works without internet  
✅ **Learning Value**: Great for understanding LLMs  

### Limitations

⚠️ **Slower**: 8-15 seconds vs Groq's 500ms  
⚠️ **Limited Context**: Smaller model understands less  
⚠️ **Setup Required**: Needs PyTorch, CUDA (if GPU)  
⚠️ **Memory**: Needs 4-8GB RAM (or VRAM if GPU)  
⚠️ **Quality**: Good but not as smart as 70B models  

---

## 🤖 How AI Features Work

### 1. Chat with Context (Question Answering)

```
Frontend Input: "What is photosynthesis?"

Step 1: Get relevant chunks
├─ Question: "What is photosynthesis?"
├─ Split into words: ["what", "is", "photosynthesis"]
├─ Go through all chunks in the Note
├─ Count matching words in each chunk
├─ Score chunks by relevance
└─ Select top 4 chunks

Step 2: Build AI prompt (aiController.js)
const context = buildContext(note, question, topK=4);
const prompt = `Context:\n${context}\n\nQuestion: ${question}\n\nAnswer:`;

Step 3: Send to Groq API (utils/openaiService.js)
const completion = await groq.chat.completions.create({
  model: 'llama-3.3-70b-versatile',
  messages: [{
    role: 'user',
    content: prompt
  }],
  temperature: 0.7,
  max_tokens: 1000
});

Step 4: Process response
├─ Get AI's answer
├─ Clean output (remove echoes)
├─ Save to ChatSession in MongoDB
└─ Return to Frontend

Step 5: Display in chat
└─ Show user message and AI response
```

### 2. Summarization

```
POST /api/ai/summarize
Body: { noteId: "123", numChunks: 5 }

Backend:
├─ Get Note document
├─ Take text from chunks
├─ Send to Groq with prompt:
│  "Summarize the following text into bullet points:\n\n${text}"
├─ Groq returns summary
└─ Return formatted summary

Frontend:
└─ Display in "Summary" tab
```

### 3. Quiz Generation

```
POST /api/ai/generate-quiz
Body: { noteId: "123", numQuestions: 5 }

Backend:
├─ Get Note content
├─ Send prompt to Groq:
│  "Generate 5 multiple choice questions..."
├─ Groq returns JSON:
│  [
│    {
│      "question": "What is...?",
│      "options": ["A", "B", "C", "D"],
│      "correctAnswer": 0
│    }
│  ]
├─ Parse JSON response
└─ Return to Frontend

Frontend:
├─ Display quiz interface
├─ User selects answers
├─ Calculate score
└─ Show results
```

### 4. Flashcard Generation

```
POST /api/ai/generate-flashcards
Body: { noteId: "123", numCards: 10 }

Backend:
├─ Get Note content
├─ Send to Groq:
│  "Generate 10 flashcard Q&A pairs..."
├─ Groq returns JSON:
│  [
│    {
│      "question": "What is...?",
│      "answer": "It is..."
│    }
│  ]
└─ Return to Frontend

Frontend:
├─ Display flashcards
├─ Click to flip
├─ Mark as learned
└─ Export as PDF
```

---

## 💬 Chat Sessions & History Management

### Creating a New Chat Session

```
When user starts chatting, a ChatSession is created:

ChatSession Schema:
{
  userId: ObjectId,
  noteId: ObjectId,
  title: "New Chat",
  messages: [
    {
      role: "user",
      content: "What is photosynthesis?",
      timestamp: Date.now()
    },
    {
      role: "assistant",
      content: "Photosynthesis is...",
      timestamp: Date.now()
    }
  ],
  createdAt: Date,
  updatedAt: Date
}

Multiple sessions for same Note:
├─ Session 1: Biology Q&A (topic-focused)
├─ Session 2: Quiz Practice (for testing)
└─ Session 3: Summary Review (study prep)
```

### Adding Messages to Session

```
Frontend: User types and sends message

POST /api/ai/sessions/message
Body: {
  sessionId: "session123",
  message: "What is photosynthesis?"
}

Backend:
├─ Find ChatSession by ID
├─ Send message to Groq API
├─ Get AI response
├─ Add user message to session.messages
├─ Add AI response to session.messages
├─ Save to MongoDB
└─ Return response to Frontend

Result: Conversation history grows in database
```

---

## 🔌 API Endpoints Reference

### Authentication API

```
POST /api/auth/register
Request: { name, email, password }
Response: { token, user: {id, name, email} }

POST /api/auth/login
Request: { email, password }
Response: { token, user: {id, name, email} }

POST /api/auth/google
Request: { token (from Google) }
Response: { token (JWT), user: {...} }

GET /api/auth/profile
Headers: { Authorization: Bearer <token> }
Response: { user: {id, name, email, ...} }

DELETE /api/auth/account
Headers: { Authorization: Bearer <token> }
Response: { message: "Account deleted" }
```

### File Management API

```
POST /api/files/upload
Headers: { Authorization: Bearer <token> }
Body: FormData { file: <File> }
Response: { message, note: {...} }

GET /api/files/files
Headers: { Authorization: Bearer <token> }
Response: {
  files: [
    {
      _id: "noteId",
      fileName: "filename.pdf",
      originalFileName: "original.pdf",
      fileSize: 2048000,
      uploadedAt: Date
    }
  ]
}

DELETE /api/files/files/:noteId
Headers: { Authorization: Bearer <token> }
Response: { message: "File deleted" }
```

### AI Features API

```
POST /api/ai/chat
Headers: { Authorization: Bearer <token> }
Body: { noteId, message }
Response: { response: "AI answer...", sourceChunks: [...] }

POST /api/ai/sessions
Headers: { Authorization: Bearer <token> }
Body: { noteId, title: "New Chat" }
Response: { sessionId, title, messages: [] }

POST /api/ai/sessions/message
Headers: { Authorization: Bearer <token> }
Body: { sessionId, message: "user question" }
Response: { sessionId, messages: [...], response: "..." }

GET /api/ai/sessions/:noteId
Headers: { Authorization: Bearer <token> }
Response: { sessions: [{ id, title, createdAt }] }

GET /api/ai/session/:sessionId
Headers: { Authorization: Bearer <token> }
Response: { session: { id, title, messages: [...] } }

DELETE /api/ai/session/:sessionId
Headers: { Authorization: Bearer <token> }
Response: { message: "Session deleted" }

POST /api/ai/summarize
Headers: { Authorization: Bearer <token> }
Body: { noteId }
Response: { summary: "Bullet points..." }

POST /api/ai/generate-quiz
Headers: { Authorization: Bearer <token> }
Body: { noteId, numQuestions: 5 }
Response: {
  questions: [
    {
      question: "...",
      options: ["A", "B", "C", "D"],
      correctAnswer: 0
    }
  ]
}

POST /api/ai/generate-flashcards
Headers: { Authorization: Bearer <token> }
Body: { noteId, numCards: 10 }
Response: {
  flashcards: [
    { question: "...", answer: "..." }
  ]
}
```

---

## 🗄️ MongoDB Collections Explained

### Users Collection

```javascript
db.users.find()
// Returns:
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Doe",
  email: "john@example.com",
  password: "$2a$10$...(hashed password)...",
  googleId: "110169091234567890123",  // if used OAuth
  createdAt: ISODate("2024-04-22T10:00:00Z"),
  updatedAt: ISODate("2024-04-22T10:00:00Z")
}

Indexes:
- { email: 1 } (unique)
```

### Notes Collection (Uploaded Files)

```javascript
db.notes.find()
// Returns:
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  fileName: "1713700000000-123456789.pdf",
  originalFileName: "biology_notes.pdf",
  content: "Photosynthesis is... Plants need... Light reactions...",
  chunks: [
    {
      text: "Photosynthesis is the process by which plants convert light..."
    },
    {
      text: "Plants need both light and dark reactions to..."
    },
    {
      text: "Light reactions occur in the thylakoid membranes..."
    }
  ],
  fileSize: 2048000,
  uploadedAt: ISODate("2024-04-22T10:15:00Z"),
  updatedAt: ISODate("2024-04-22T10:15:00Z")
}

Indexes:
- { userId: 1 }
```

### ChatSessions Collection (Conversations)

```javascript
db.chatsessions.find()
// Returns:
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  userId: ObjectId("507f1f77bcf86cd799439011"),
  noteId: ObjectId("507f1f77bcf86cd799439012"),
  title: "Biology - Photosynthesis Q&A",
  messages: [
    {
      role: "user",
      content: "What is photosynthesis?",
      timestamp: ISODate("2024-04-22T10:20:00Z")
    },
    {
      role: "assistant",
      content: "Photosynthesis is the process where plants convert light energy...",
      timestamp: ISODate("2024-04-22T10:20:05Z")
    },
    {
      role: "user",
      content: "How do light reactions work?",
      timestamp: ISODate("2024-04-22T10:21:00Z")
    }
  ],
  createdAt: ISODate("2024-04-22T10:20:00Z"),
  updatedAt: ISODate("2024-04-22T10:21:00Z")
}

Indexes:
- { userId: 1, noteId: 1 }
- { userId: 1, createdAt: -1 }
```

---

## 🚀 Running the Project Locally

### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Groq API key (free from https://console.groq.com)
- Google OAuth credentials (optional)

### Backend Setup

```bash
# 1. Navigate to Backend folder
cd Backend

# 2. Install dependencies
npm install

# 3. Create .env file
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-study-assistant
JWT_SECRET=your-secret-key-here-change-this
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxx

# 4. Start MongoDB
# On Windows with MongoDB installed:
mongod

# 5. Start Backend
npm run dev

# Expected output:
# MongoDB connected
# Server is running on port 5000
```

### Frontend Setup

```bash
# 1. Open new terminal, navigate to Frontend
cd Frontend

# 2. Install dependencies
npm install

# 3. Create .env file
REACT_APP_API_URL=http://localhost:5000/api

# 4. Start React
npm start

# Expected output:
# Compiled successfully!
# You can now view the app in the browser at http://localhost:3000
```

### Verify Everything Works

```
1. Open http://localhost:3000 in browser
2. Click "Sign Up" and create account
3. Upload a PDF file
4. Ask a question about it
5. You should get an AI response!
```

---

## 🔍 Common Code Patterns You'll See

### Pattern 1: Request with Authentication

```javascript
// Frontend: services/api.js
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Backend: middleware/auth.js
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.userId = decoded.userId;
  next();
};
```

### Pattern 2: Wrapping Protected Routes

```javascript
// Frontend: App.js
<Route
  path="/dashboard"
  element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

// components/ProtectedRoute.js
function ProtectedRoute({ children }) {
  const { isLoggedIn, loading } = useContext(AuthContext);
  if (loading) return <Loading />;
  return isLoggedIn ? children : <Navigate to="/login" />;
}
```

### Pattern 3: Error Handling

```javascript
// Frontend
try {
  const response = await uploadFile(file);
  setFiles([...files, response.data.note]);
} catch (error) {
  setError(error.response?.data?.message || 'Upload failed');
}

// Backend
try {
  const note = await Note.create({...});
  res.json({ message: 'Success', note });
} catch (error) {
  res.status(500).json({ message: `Error: ${error.message}` });
}
```

---

## 🐛 Troubleshooting Common Issues

### Issue: "MongoDB connection error"
```
Solution:
1. Make sure MongoDB is running
2. Check MONGODB_URI in .env
3. For local: mongodb://localhost:27017/ai-study-assistant
4. Test: mongosh (should connect)
```

### Issue: "Groq API error"
```
Solution:
1. Verify GROQ_API_KEY is correct
2. Check at: https://console.groq.com/keys
3. Make sure API key hasn't expired
4. Check Groq API status online
```

### Issue: "File upload fails"
```
Solution:
1. Check file type (PDF, DOCX, or TXT only)
2. Check file size (max 10MB)
3. Verify uploads/ folder exists
4. Check multer middleware settings
```

### Issue: "Chat returns empty response"
```
Solution:
1. Make sure file has content (not image-only PDF)
2. Verify chunks were created and stored
3. Check Groq API connection
4. Look at backend console for errors
```

### Issue: "CORS errors"
```
Solution:
1. Check CORS configuration in server.js
2. Make sure frontend URL in allowedOrigins
3. For local dev: http://localhost:3000
4. Restart backend after changes
```

---

## 📚 Key Technologies Explained

### JWT (JSON Web Tokens)
```
Structure: header.payload.signature
Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI1ZjA...

What it does:
├─ Stateless authentication (no session storage needed)
├─ Includes userId and expiration
├─ Cryptographically signed for security
└─ Expires after 7 days (auto logout)
```

### Groq API
```
Fast LLM inference service
├─ Model: llama-3.3-70b-versatile
├─ Speed: ~500ms per request
├─ Free tier available
└─ Returns JSON responses
```

### MongoDB
```
NoSQL Document Database
├─ Stores documents (JSON-like)
├─ Collections (like tables)
├─ Flexible schema
├─ Used for: Users, Notes, Chat, ChatSessions
└─ Queried from Backend
```

### Multer
```
Express middleware for file uploads
├─ Handles multipart/form-data
├─ Saves to disk
├─ Validates file types
└─ Creates req.file object
```

---

## 📊 Performance Tips

1. **Database Indexing**
   - Already indexed on userId for faster queries
   - Helps with large user bases

2. **Chunking Strategy**
   - 1000 char chunks help balance speed and context
   - Smaller chunks = more precise but slower search
   - Larger chunks = more context but less precise

3. **API Response Caching**
   - Could cache summaries for same file
   - Could cache quiz results
   - Not currently implemented but possible

4. **Frontend Optimization**
   - Lazy load pages with React Router
   - Code splitting for faster initial load
   - Images optimized by Tailwind

---

## 🎯 Next Steps to Learn

1. **Read the Code:**
   - Start with `Backend/server.js`
   - Then check `Backend/controllers/authController.js`
   - Then `Backend/utils/openaiService.js`
   - Finally `Frontend/src/pages/Chat.js`

2. **Modify Features:**
   - Add new study feature (e.g., concept mapping)
   - Change AI model/temperature
   - Add export to different formats
   - Add file sharing between users

3. **Add Advanced Features:**
   - Multi-language support
   - Advanced search (semantic + keyword)
   - Real-time collaboration
   - Mobile app

4. **Deployment:**
   - Deploy Backend to Railway/Render
   - Deploy Frontend to Vercel
   - Use MongoDB Atlas for database

---

## 📞 Common Questions

**Q: How is content restricted to only uploaded files?**
A: In the prompt, we build context only from chunks in the Note. The AI's instructions say "Answer using ONLY this context". If nothing matches, we return "Not found in your materials".

**Q: Can the AI access the internet?**
A: No, it only sees the context from your uploaded files. Completely isolated and private.

**Q: How are passwords secured?**
A: Hashed with bcryptjs (10 salt rounds). Even we can't see the original password.

**Q: Can I change AI models?**
A: Yes! Edit `utils/openaiService.js` to use different Groq models or add your own API.

**Q: How long are chat sessions stored?**
A: Indefinitely in MongoDB. You can delete them manually from the UI.

---

## 📄 File Map

| File | Purpose |
|------|---------|
| Backend/server.js | Express setup, routes, middleware |
| Backend/controllers/* | Business logic for each feature |
| Backend/routes/* | API endpoint definitions |
| Backend/models/* | MongoDB schemas |
| Backend/middleware/* | JWT auth, file upload |
| Backend/utils/* | Helper functions (text extraction, AI calls) |
| Frontend/App.js | Router and main layout |
| Frontend/pages/* | Full page components |
| Frontend/components/* | Reusable components |
| Frontend/services/api.js | API client with axios |

---

**Created**: April 2026
**Version**: 1.0.0
**Status**: Active Development
**Last Updated**: After file cleanup
