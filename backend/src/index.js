import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import os from 'os';

// Import controllers
import { register, login, getMe } from './controllers/authController.js';
import { createJob, getAllJobs } from './controllers/jobController.js';
import { updateProfile, getStudents } from './controllers/studentController.js';
import { uploadResume, uploadOfferLetter, streamResume, streamOfferLetter } from './controllers/uploadController.js';

// Import middlewares
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Host IP / Hostname detection for Load Balancer demo (resolving Public IP)
let serverHostAddress = '127.0.0.1';

const resolveHostAddress = async () => {
  // First, get private IP as a fallback
  try {
    const interfaces = os.networkInterfaces();
    for (const devName in interfaces) {
      const iface = interfaces[devName];
      for (let i = 0; i < iface.length; i++) {
        const alias = iface[i];
        if (alias.family === 'IPv4' && !alias.internal) {
          serverHostAddress = alias.address;
        }
      }
    }
  } catch (err) {
    console.error('Error resolving private interface addresses:', err);
    serverHostAddress = os.hostname() || 'Unknown EC2';
  }

  // Next, query AWS checkip to get the public IP of the EC2 instance
  try {
    const response = await fetch('http://checkip.amazonaws.com');
    if (response.ok) {
      const text = await response.text();
      const ip = text.trim();
      if (ip) {
        serverHostAddress = ip;
        console.log(`Resolved EC2 Public IP: ${serverHostAddress}`);
      }
    }
  } catch (err) {
    console.warn('Failed to resolve public IP. Defaulting to private IP. Error:', err.message);
  }
};

resolveHostAddress();

// Setup Multer memory storage (files stored in memory buffer before upload to S3)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware
app.use(cors({
  origin: '*',
  exposedHeaders: ['X-Server-IP'] // Expose server IP header so frontend client can read it
}));
app.use(express.json());

// Inject Server IP Header middleware on all HTTP responses
app.use((req, res, next) => {
  res.setHeader('X-Server-IP', serverHostAddress);
  next();
});

// Server Info Endpoint
app.get('/api/server-info', (req, res) => {
  res.json({ serverIp: serverHostAddress });
});

// Authentication Endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getMe);

// Job / Placement Event Endpoints
app.post('/api/jobs', authenticateToken, requireRole('admin'), createJob);
app.get('/api/jobs', authenticateToken, getAllJobs);

// Profile Management Endpoints
app.put('/api/students/profile', authenticateToken, requireRole('student'), updateProfile);
app.get('/api/students', authenticateToken, requireRole('admin'), getStudents);

// S3 Storage File Upload Endpoints
app.post('/api/uploads/resume', authenticateToken, requireRole('student'), upload.single('resume'), uploadResume);
app.post('/api/uploads/offer-letter', authenticateToken, requireRole('student'), upload.single('offer_letter'), uploadOfferLetter);

// S3 File Streaming Endpoints (Access Denied bypass)
app.get('/api/uploads/resume/:userId', streamResume);
app.get('/api/uploads/offer-letter/:userId', streamOfferLetter);

// Base Checkpoint API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Placement Cell Automation API is running.',
    host: serverHostAddress
  });
});

// Boot listening
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT} [Host: ${serverHostAddress}]`);
});
