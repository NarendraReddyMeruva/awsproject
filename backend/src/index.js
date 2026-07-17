import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';

// Import controllers
import { register, login, getMe } from './controllers/authController.js';
import { createJob, getAllJobs, deleteJob } from './controllers/jobController.js';
import { updateProfile, getStudents } from './controllers/studentController.js';
import { uploadResume, uploadOfferLetter, streamResume, streamOfferLetter } from './controllers/uploadController.js';

// Import middlewares
import { authenticateToken, requireRole } from './middleware/authMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;



// Setup Multer memory storage (files stored in memory buffer before upload to S3)
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
});

// Middleware
app.use(cors());
app.use(express.json());

// Authentication Endpoints
app.post('/api/auth/register', register);
app.post('/api/auth/login', login);
app.get('/api/auth/me', authenticateToken, getMe);

// Job / Placement Event Endpoints
app.post('/api/jobs', authenticateToken, requireRole('admin'), createJob);
app.get('/api/jobs', authenticateToken, getAllJobs);
app.delete('/api/jobs/:jobId', authenticateToken, requireRole('admin'), deleteJob);

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
    message: 'Placement Cell Automation API is running.'
  });
});

// Boot listening
app.listen(PORT, () => {
  console.log(`Server successfully started on port ${PORT}`);
});
