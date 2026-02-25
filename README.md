# ResuMate

ResuMate is an AI-powered application that helps you with placement preparation and builds ATS-friendly resumes.

## Project Structure

- `frontend/` - React.js frontend application
- `backend/` - Node.js/Express backend API

## Features

- **Authentication**: Login and Signup with secure JWT authentication
- **Profile Generation**: Complete profile setup for first-time users
- **PlacementPrep**: Resources for placement interview preparation
- **ResuHelp**: AI-powered resume builder and optimizer

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the backend directory with:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
GROQ_API_KEY=your-groq-api-key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
```

**Note:** 
- Get your Groq API key from [console.groq.com](https://console.groq.com)
- Valid model names: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, `gemma2-9b-it`
- Check [Groq Models Documentation](https://console.groq.com/docs/models) for current available models
- The code also supports `GROK_API_KEY` and `GROK_API_URL` for backward compatibility

4. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies (if not already installed):
```bash
npm install
```

3. Start the React development server:
```bash
npm start
```

The frontend will run on `http://localhost:3000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User signup
- `POST /api/auth/login` - User login
- `POST /api/auth/profile` - Save user profile (Protected)
- `GET /api/auth/profile` - Get user profile (Protected)

### Resume Analysis
- `POST /api/resume/analyze` - Analyze resume against job description (Protected)
  - Requires: `resume` (file) and `jobDescription` (file)
  - Supported file types: PDF, DOCX, TXT

## Technology Stack

### Frontend
- React.js
- React Router DOM
- Axios
- CSS3

### Backend
- Node.js
- Express.js
- bcryptjs (Password hashing)
- jsonwebtoken (JWT authentication)
- multer (File upload handling)
- pdf-parse (PDF text extraction)
- mammoth (DOCX text extraction)
- axios (HTTP client for Groq API)
- Groq API (AI-powered resume analysis)
- CORS

## Development

Make sure both frontend and backend servers are running simultaneously for full functionality.

