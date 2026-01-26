const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Log environment variables status on startup
console.log('Environment Configuration:');
console.log('PORT:', process.env.PORT || 'Not set (using default 5000)');
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set ✓' : 'Not set ✗');
console.log('GROQ_API_KEY:', process.env.GROQ_API_KEY || process.env.GROK_API_KEY ? `Set ✓ (length: ${(process.env.GROQ_API_KEY || process.env.GROK_API_KEY).length})` : 'Not set ✗');
console.log('GROQ_API_URL:', process.env.GROQ_API_URL || process.env.GROK_API_URL || 'Not set (using default: https://api.groq.com/openai/v1/chat/completions)');
console.log('GROQ_MODEL:', process.env.GROQ_MODEL || process.env.GROK_MODEL || 'Not set (using default: llama-3.3-70b-versatile)');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/resume', require('./routes/resume'));

// Test route
app.get('/api/test', (req, res) => {
  res.json({ message: 'Backend is running!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

