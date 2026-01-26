const express = require('express');
const multer = require('multer');
// pdf-parse import - use the module directly
// Note: In some versions, typeof may report 'object' but the module is still callable
const pdfParse = require('pdf-parse');

const mammoth = require('mammoth');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
      'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  },
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Extract text from PDF
const extractTextFromPDF = async (buffer) => {
  try {
    if (!buffer || buffer.length === 0) {
      throw new Error('PDF buffer is empty or invalid');
    }

    // Ensure buffer is a proper Buffer
    const pdfBuffer = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
    
    // Verify it's actually a PDF by checking the header
    const pdfHeader = pdfBuffer.slice(0, 4).toString();
    if (pdfHeader !== '%PDF') {
      throw new Error('Invalid PDF file format (missing PDF header)');
    }

    console.log('Extracting text from PDF, buffer size:', pdfBuffer.length);
    console.log('pdfParse type:', typeof pdfParse);
    
    // Call pdf-parse - it should work even if typeof reports 'object'
    const data = await pdfParse(pdfBuffer, {
      // Options for better text extraction
      max: 0, // Parse all pages (0 = all pages)
    });

    if (!data) {
      throw new Error('PDF parsing returned no data');
    }

    if (!data.text || typeof data.text !== 'string') {
      throw new Error('No text content found in PDF (PDF may contain only images)');
    }

    const extractedText = data.text.trim();
    console.log('PDF text extracted, length:', extractedText.length);
    console.log('PDF pages:', data.numpages);
    
    if (extractedText.length === 0) {
      throw new Error('PDF appears to be empty or contains only images (no extractable text). Please use a PDF with selectable text or convert images to text using OCR.');
    }

    return extractedText;
  } catch (error) {
    console.error('PDF extraction error:', error.message);
    console.error('Error name:', error.name);
    if (error.stack) {
      console.error('Error stack:', error.stack);
    }
    throw new Error(`Failed to extract text from PDF: ${error.message}`);
  }
};

// Extract text from text file
const extractTextFromTXT = (buffer) => {
  return buffer.toString('utf-8');
};

// Extract text from DOCX file
const extractTextFromDOCX = async (buffer) => {
  try {
    const result = await mammoth.extractRawText({ buffer: buffer });
    return result.value;
  } catch (error) {
    throw new Error('Failed to extract text from DOCX file');
  }
};

// Extract text from file based on type
const extractTextFromFile = async (file) => {
  const mimeType = file.mimetype;
  
  // Validate buffer exists
  if (!file.buffer) {
    throw new Error('File buffer is missing');
  }

  // Ensure buffer is a Buffer object
  const buffer = Buffer.isBuffer(file.buffer) ? file.buffer : Buffer.from(file.buffer);
  
  if (buffer.length === 0) {
    throw new Error('File buffer is empty');
  }

  console.log(`Processing ${mimeType} file, buffer type: ${buffer.constructor.name}, size: ${buffer.length}`);
  
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  } else if (mimeType === 'text/plain') {
    return extractTextFromTXT(buffer);
  } else if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    return await extractTextFromDOCX(buffer);
  } else if (mimeType === 'application/msword') {
    // For older .doc files, suggest converting to DOCX or PDF
    throw new Error('DOC files are not supported. Please convert to DOCX, PDF, or TXT format.');
  } else {
    throw new Error(`Unsupported file type: ${mimeType}. Only PDF, DOCX, and TXT files are supported.`);
  }
};

// Analyze resume against job description using Groq API
const analyzeResumeWithGrok = async (resumeText, jobDescriptionText) => {
  const groqApiKey = process.env.GROQ_API_KEY || process.env.GROK_API_KEY;
  // Groq API endpoint (Groq uses OpenAI-compatible format)
  let groqApiUrl = process.env.GROQ_API_URL || process.env.GROK_API_URL || 'https://api.groq.com/openai/v1/chat/completions';
  
  // Remove trailing period or whitespace from URL if present
  groqApiUrl = groqApiUrl.trim().replace(/\.$/, '');

  // Groq API model names (updated 2024): llama-3.3-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma2-9b-it
  // Check https://console.groq.com/docs/models for current available models
  const groqModel = process.env.GROQ_MODEL || process.env.GROK_MODEL || 'llama-3.3-70b-versatile';
  
  console.log('Groq API Configuration:');
  console.log('API URL:', groqApiUrl);
  console.log('API Model:', groqModel);
  console.log('API Key exists:', !!groqApiKey);
  console.log('API Key length:', groqApiKey ? groqApiKey.length : 0);

  if (!groqApiKey) {
    throw new Error('Groq API key is not configured. Please set GROQ_API_KEY (or GROK_API_KEY) in your environment variables.');
  }

  // Prepare the prompt for Grok AI
  const prompt = `You are an expert resume analyzer. Analyze the following resume against the job description and provide a comprehensive analysis.

RESUME:
${resumeText.substring(0, 4000)} ${resumeText.length > 4000 ? '...(truncated)' : ''}

JOB DESCRIPTION:
${jobDescriptionText.substring(0, 4000)} ${jobDescriptionText.length > 4000 ? '...(truncated)' : ''}

Please provide a detailed analysis in the following JSON format:
{
  "jobFitScore": <number 0-100>,
  "analysis": "<detailed analysis text explaining how well the resume matches the job description>",
  "recommendations": "<numbered list of specific recommendations to improve the resume>",
  "matchedKeywords": ["keyword1", "keyword2", ...],
  "missingKeywords": ["keyword1", "keyword2", ...],
  "scoreDescription": "<brief description of the score>"
}

Focus on:
1. Skill alignment between resume and job requirements
2. Experience relevance
3. Keyword matching
4. Missing qualifications
5. Specific actionable recommendations

Return ONLY valid JSON, no additional text.`;

  try {
    console.log('Sending request to Groq API...');
    console.log('Resume text length:', resumeText.length);
    console.log('Job description text length:', jobDescriptionText.length);
    
    // Groq API request format (OpenAI-compatible)
    const requestBody = {
      model: groqModel,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      stream: false
    };

    console.log('Request body model:', requestBody.model);
    console.log('Prompt length:', prompt.length);
    console.log('Request URL:', groqApiUrl);

    const response = await axios.post(
      groqApiUrl,
      requestBody,
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: 60000, // 60 second timeout
        validateStatus: function (status) {
          // Don't throw error for 4xx/5xx, we'll handle it manually
          return status < 500;
        }
      }
    );

    // Check for error responses (status codes other than 200)
    if (response.status !== 200 && response.status !== 201) {
      const errorData = response.data || {};
      console.error('Groq API returned non-success status:', response.status);
      console.error('Full response data:', JSON.stringify(response.data, null, 2));
      
      // Try to extract meaningful error message
      let errorMsg = `Groq API returned status ${response.status}`;
      if (errorData.error?.message) {
        errorMsg += `: ${errorData.error.message}`;
      } else if (errorData.message) {
        errorMsg += `: ${errorData.message}`;
      } else if (errorData.error) {
        errorMsg += `: ${JSON.stringify(errorData.error)}`;
      }
      
      // Common 400 error causes for Groq API
      if (response.status === 400) {
        errorMsg += '. Common causes: invalid model name, malformed request, or missing required parameters.';
        console.error('Tip: Try setting GROQ_MODEL environment variable to a valid Groq model name like "llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", or "gemma2-9b-it"');
        console.error('Check https://console.groq.com/docs/models for current available models');
      }
      
      throw new Error(errorMsg);
    }

    console.log('Groq API response status:', response.status);
    console.log('Groq API response structure:', Object.keys(response.data || {}));

    // Extract the response content
    if (!response.data || !response.data.choices || !response.data.choices[0]) {
      console.error('Unexpected Groq API response structure:', JSON.stringify(response.data, null, 2));
      throw new Error('Invalid response structure from Groq API');
    }

    const groqResponse = response.data.choices[0].message?.content;
    
    if (!groqResponse) {
      console.error('No content in Groq API response:', response.data);
      throw new Error('No content in response from Groq API');
    }

    console.log('Groq response length:', groqResponse.length);
    console.log('Groq response preview:', groqResponse.substring(0, 200));
    
    // Try to parse JSON from the response
    let analysisResult;
    try {
      // Extract JSON from response if there's extra text
      const jsonMatch = groqResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysisResult = JSON.parse(jsonMatch[0]);
      } else {
        analysisResult = JSON.parse(groqResponse);
      }
    } catch (parseError) {
      // If JSON parsing fails, create a structured response from the text
      console.error('Failed to parse Groq response as JSON:', parseError);
      console.log('Groq response:', groqResponse);
      
      // Fallback: extract score if present, otherwise use default analysis
      const scoreMatch = groqResponse.match(/jobFitScore["\s:]*(\d+)/i) || 
                        groqResponse.match(/score["\s:]*(\d+)/i) ||
                        groqResponse.match(/(\d+)\s*\/\s*100/i);
      
      const jobFitScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
      
      analysisResult = {
        jobFitScore,
        analysis: groqResponse.substring(0, 500) || 'Analysis completed. See recommendations below.',
        recommendations: '1. Review the analysis above\n2. Improve keyword matching\n3. Enhance relevant experience',
        matchedKeywords: [],
        missingKeywords: [],
        scoreDescription: jobFitScore >= 80 ? 'Good match' : 'Needs improvement'
      };
    }

    // Validate and ensure all required fields exist
    return {
      jobFitScore: Math.min(100, Math.max(0, analysisResult.jobFitScore || 50)),
      analysis: analysisResult.analysis || 'Analysis completed. Please review your resume against the job requirements.',
      recommendations: analysisResult.recommendations || 'Consider tailoring your resume to better match the job description.',
      matchedKeywords: Array.isArray(analysisResult.matchedKeywords) ? analysisResult.matchedKeywords.slice(0, 20) : [],
      missingKeywords: Array.isArray(analysisResult.missingKeywords) ? analysisResult.missingKeywords.slice(0, 20) : [],
      scoreDescription: analysisResult.scoreDescription || (analysisResult.jobFitScore >= 80 ? 'Good match' : 'Needs improvement')
    };
  } catch (error) {
    console.error('Groq API error details:');
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      console.error('Response headers:', error.response.headers);
      console.error('Request URL:', error.config?.url);
      console.error('Request method:', error.config?.method);
      console.error('Request headers:', error.config?.headers);
      
      // Check for specific Groq API error messages
      const responseData = error.response.data;
      if (responseData?.error) {
        console.error('Groq API error object:', JSON.stringify(responseData.error, null, 2));
      }
    } else if (error.request) {
      console.error('No response received:', error.request);
    }
    
    // Provide more detailed error message
    let errorMessage = 'Groq API error: ';
    if (error.response?.data) {
      const responseData = error.response.data;
      if (responseData.error?.message) {
        errorMessage += responseData.error.message;
      } else if (responseData.message) {
        errorMessage += responseData.message;
      } else if (responseData.error) {
        errorMessage += JSON.stringify(responseData.error);
      } else {
        errorMessage += JSON.stringify(responseData);
      }
    } else if (error.response?.status === 400) {
      errorMessage += 'Bad Request (400) - Check request format, model name, or parameters. ';
      if (error.response.data) {
        errorMessage += JSON.stringify(error.response.data);
      }
      errorMessage += ' Tip: Valid Groq models include: llama-3.1-70b-versatile, llama-3.1-8b-instant, mixtral-8x7b-32768, gemma-7b-it';
    } else if (error.response?.status === 401) {
      errorMessage += 'Unauthorized - Please check your Groq API key';
    } else if (error.response?.status === 404) {
      errorMessage += 'API endpoint not found - Please check the GROQ_API_URL (should be https://api.groq.com/openai/v1/chat/completions)';
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage += 'Connection refused - Please check the API URL';
    } else {
      errorMessage += error.message || 'Unknown error occurred';
    }
    
    throw new Error(errorMessage);
  }
};

// Resume analysis route
router.post('/analyze', verifyToken, upload.fields([
  { name: 'resume', maxCount: 1 },
  { name: 'jobDescription', maxCount: 1 }
]), async (req, res) => {
  try {
    console.log('Analysis request received');
    console.log('Files received:', req.files ? Object.keys(req.files) : 'none');
    
    if (!req.files || !req.files.resume || !req.files.jobDescription) {
      console.error('Missing files in request');
      return res.status(400).json({ message: 'Both resume and job description files are required' });
    }

    const resumeFile = req.files.resume[0];
    const jobDescriptionFile = req.files.jobDescription[0];

    console.log('Resume file:', {
      name: resumeFile.originalname,
      mimetype: resumeFile.mimetype,
      size: resumeFile.size,
      hasBuffer: !!resumeFile.buffer,
      bufferType: resumeFile.buffer ? resumeFile.buffer.constructor.name : 'none',
      bufferLength: resumeFile.buffer ? resumeFile.buffer.length : 0
    });
    console.log('Job description file:', {
      name: jobDescriptionFile.originalname,
      mimetype: jobDescriptionFile.mimetype,
      size: jobDescriptionFile.size,
      hasBuffer: !!jobDescriptionFile.buffer,
      bufferType: jobDescriptionFile.buffer ? jobDescriptionFile.buffer.constructor.name : 'none',
      bufferLength: jobDescriptionFile.buffer ? jobDescriptionFile.buffer.length : 0
    });

    // Validate buffers exist
    if (!resumeFile.buffer) {
      console.error('Resume file buffer is missing!');
      return res.status(400).json({ 
        message: 'Resume file buffer is missing. Please ensure the file was uploaded correctly.',
        error: 'Missing file buffer'
      });
    }

    if (!jobDescriptionFile.buffer) {
      console.error('Job description file buffer is missing!');
      return res.status(400).json({ 
        message: 'Job description file buffer is missing. Please ensure the file was uploaded correctly.',
        error: 'Missing file buffer'
      });
    }

    // Extract text from both files
    console.log('Extracting text from files...');
    let resumeText, jobDescriptionText;
    
    try {
      resumeText = await extractTextFromFile(resumeFile);
      console.log('Resume text extracted successfully, length:', resumeText.length);
    } catch (error) {
      console.error('Resume extraction failed:', error.message);
      return res.status(400).json({ 
        message: `Failed to extract text from resume: ${error.message}`,
        error: error.message
      });
    }

    try {
      jobDescriptionText = await extractTextFromFile(jobDescriptionFile);
      console.log('Job description text extracted successfully, length:', jobDescriptionText.length);
    } catch (error) {
      console.error('Job description extraction failed:', error.message);
      return res.status(400).json({ 
        message: `Failed to extract text from job description: ${error.message}`,
        error: error.message
      });
    }
    
    console.log('Text extraction completed');

    if (!resumeText || !jobDescriptionText) {
      return res.status(400).json({ message: 'Failed to extract text from files' });
    }

    // Perform analysis using Groq API
    const analysisResult = await analyzeResumeWithGrok(resumeText, jobDescriptionText);

    res.json(analysisResult);
  } catch (error) {
    console.error('Analysis error:', error);
    const errorMessage = error.message || 'Failed to analyze resume';
    const errorDetails = error.response?.data || error.stack;
    console.error('Error details:', errorDetails);
    
    res.status(500).json({ 
      message: errorMessage,
      error: errorMessage,
      details: errorDetails
    });
  }
});

module.exports = router;

