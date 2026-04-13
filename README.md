<div align="center">
  <h1>🚀 ResuMate</h1>
  <p><h3>Your Ultimate AI-Powered Placement & Resume Assistant</h3></p>
  <p>
    <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
    <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node JS" />
    <img src="https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
    <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" alt="MongoDB" />
    <br/>
    <img src="https://img.shields.io/badge/Groq%20AI-FF4A00?style=for-the-badge&logo=groq&logoColor=white" alt="Groq API" />
  </p>
</div>

<hr/>

## 📖 About The Project

**ResuMate** is an intelligent, full-stack application designed to be a comprehensive platform for placement preparation and ATS-friendly resume analysis. Leveraging advanced AI models via the Groq API, ResuMate analyzes user resumes against target job descriptions to provide detailed feedback, matching scores, and actionable recommendations.

Whether you're crafting your profile for upcoming campus placements or seeking a competitive edge with your resume, ResuMate provides tailored, data-driven insights.

## ✨ Key Features

- **🔐 Secure Authentication** - Full authentication flow (Signup & Login) using JWT and encrypted passwords.
- **🧑‍💻 Comprehensive Profile Builder** - Create personalized user profiles to track placement stats and resources.
- **📚 PlacementPrep Dashboard** - Access structured learning resources and curated roadmaps tailored for placement interviews.
- **📄 AI Resume Analyzer (ResuHelp)** - Upload your resume (PDF/DOCX/TXT) and a job description to receive an AI-generated analysis, including a matching percentage and actionable improvement tips to bypass ATS systems.
- **⚡ Lightning-fast AI** - Powered by advanced LLMs via Groq (e.g., LLaMA-3.3, Mixtral) for incredibly fast and accurate insights.
- **Responsive UI** - Modern React-based frontend styled with CSS3 to provide a premium user experience.

---

## 🏗️ Architecture & Tech Stack

ResuMate follows a classic MERN (MongoDB, Express, React, Node.js) architecture. 

### Frontend
- **Framework:** React.js
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** CSS3

### Backend
- **Runtime & Framework:** Node.js, Express.js
- **Database (via ODM):** MongoDB, Mongoose
- **Authentication:** JWT, bcryptjs
- **File Parsing & Uploads:** multer, pdf-parse, mammoth
- **AI Integration:** Groq API via Axios

---

## 🚀 Getting Started

Follow these steps to set up the project locally on your machine.

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas cluster)
- [Groq API Key](https://console.groq.com)

### 1️⃣ Clone the Repository
```bash
git clone https://github.com/your-username/ResuMate-A-Placement-Assistant-System.git
cd ResuMate-A-Placement-Assistant-System
```

### 2️⃣ Backend Setup
Navigate into the backend directory and configure the server.

```bash
cd backend
# Install backend dependencies
npm install
```

Create a `.env` file inside the `backend` folder and add the following variables:
```env
PORT=5000
MONGODB_URI=your-mongodb-connection-string
JWT_SECRET=your-super-secret-jwt-key
GROQ_API_KEY=your-groq-api-key
GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
GROQ_MODEL=llama-3.3-70b-versatile
```
*(Valid Groq Models: `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`, `mixtral-8x7b-32768`, etc.)*

Start the backend development server:
```bash
npm run dev
```
*The backend server should now be running on `http://localhost:5000`.*

### 3️⃣ Frontend Setup
Open a new terminal window, navigate into the frontend directory, and start the React server.

```bash
cd frontend
# Install frontend dependencies
npm install

# Start the React app
npm start
```
*The frontend should now be running and accessible at `http://localhost:3000`.*

---

## 📡 API Endpoints Overview

The backend exposes a highly cohesive REST API. 

### 🔐 Auth & Users
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Authenticate user & get JWT token
- `POST /api/auth/profile` - Save/update user profile (Protected)
- `GET /api/auth/profile` - Retrieve user profile details (Protected)

### 📄 Resume Assistant
- `POST /api/resume/analyze` - Analyze resume against JD (Protected)
  - **Payload:** form-data containing `resume` (File) and `jobDescription` (File/Text)
  - **Returns:** AI-structured JSON containing matching percentage, missing keywords, and recommendations.

---

## 🔮 Future Enhancements
- [ ] Integration of mock coding assessments.
- [ ] Company-specific interview experiences and frequently asked questions.
- [ ] Support for direct LinkedIn profile parsing.
- [ ] Exporting optimized resumes directly to PDF.

---
<div align="center">
  <p>Built with ❤️ for students preparing for placements.</p>
</div>
