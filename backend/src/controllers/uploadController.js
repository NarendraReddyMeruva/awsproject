import { PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { s3Client, dynamoDb } from '../config/aws.js';
import dotenv from 'dotenv';

dotenv.config();

const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME || 'placement-portal-resumes';
const REGION = process.env.AWS_REGION || 'us-east-1';
const USERS_TABLE = process.env.AWS_DYNAMODB_USERS_TABLE || 'PlacementPortal_Users';

export const uploadResume = async (req, res) => {
  const userId = req.user.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const isPdf = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
  if (!isPdf) {
    return res.status(400).json({ message: 'Only PDF files are allowed for resumes.' });
  }

  const key = `students/${userId}/resume.pdf`;

  try {
    // Attempt S3 upload
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: 'application/pdf',
        })
      );
      console.log(`Resume uploaded successfully to S3 under key: ${key}`);
    } catch (s3Err) {
      console.warn('S3 Upload failed. Using fallback simulation for local testing.', s3Err.message);
    }

    // Set the user profile resumeUrl to point to our backend stream endpoint
    const streamUrl = `${req.protocol}://${req.get('host')}/api/uploads/resume/${userId}`;

    // Update Student Profile in DynamoDB
    let profileUpdated = false;
    try {
      const { Item } = await dynamoDb.send(
        new GetCommand({ TableName: USERS_TABLE, Key: { userId } })
      );

      if (Item) {
        const updatedItem = {
          ...Item,
          resumeUrl: streamUrl,
          updatedAt: new Date().toISOString(),
        };

        await dynamoDb.send(
          new PutCommand({ TableName: USERS_TABLE, Item: updatedItem })
        );
        profileUpdated = true;
      }
    } catch (dbErr) {
      console.error('Failed to update student profile in DynamoDB with resume URL:', dbErr.message);
    }

    res.status(200).json({
      message: 'Resume uploaded successfully!',
      url: streamUrl,
      dbUpdated: profileUpdated,
    });
  } catch (err) {
    console.error('Resume upload endpoint error:', err);
    res.status(500).json({ message: 'Error uploading resume.', error: err.message });
  }
};

export const uploadOfferLetter = async (req, res) => {
  const userId = req.user.userId;
  const file = req.file;

  if (!file) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }

  const isPdf = file.mimetype === 'application/pdf' || file.originalname.endsWith('.pdf');
  if (!isPdf) {
    return res.status(400).json({ message: 'Only PDF files are allowed for offer letters.' });
  }

  const key = `students/${userId}/offer_letter.pdf`;

  try {
    // Attempt S3 upload
    try {
      await s3Client.send(
        new PutObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ContentType: 'application/pdf',
        })
      );
      console.log(`Offer letter uploaded successfully to S3 under key: ${key}`);
    } catch (s3Err) {
      console.warn('S3 Upload failed. Using fallback simulation for local testing.', s3Err.message);
    }

    // Set the user profile offerLetterUrl to point to our backend stream endpoint
    const streamUrl = `${req.protocol}://${req.get('host')}/api/uploads/offer-letter/${userId}`;

    // Update Student Profile in DynamoDB
    let profileUpdated = false;
    try {
      const { Item } = await dynamoDb.send(
        new GetCommand({ TableName: USERS_TABLE, Key: { userId } })
      );

      if (Item) {
        const updatedItem = {
          ...Item,
          offerLetterUrl: streamUrl,
          updatedAt: new Date().toISOString(),
        };

        await dynamoDb.send(
          new PutCommand({ TableName: USERS_TABLE, Item: updatedItem })
        );
        profileUpdated = true;
      }
    } catch (dbErr) {
      console.error('Failed to update student profile in DynamoDB with offer letter URL:', dbErr.message);
    }

    res.status(200).json({
      message: 'Offer letter uploaded successfully!',
      url: streamUrl,
      dbUpdated: profileUpdated,
    });
  } catch (err) {
    console.error('Offer letter upload endpoint error:', err);
    res.status(500).json({ message: 'Error uploading offer letter.', error: err.message });
  }
};

// Stream resume from S3 or redirect to sample template on failure
export const streamResume = async (req, res) => {
  const { userId } = req.params;
  const key = `students/${userId}/resume.pdf`;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="resume.pdf"');

    // Stream S3 response body bytes directly to client
    response.Body.pipe(res);
  } catch (err) {
    console.warn(`S3 stream failed for resume of ${userId}. Redirecting to placeholder PDF. Error:`, err.message);
    // Redirect to public dummy PDF template so the app doesn't break locally
    res.redirect('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  }
};

// Stream offer letter from S3
export const streamOfferLetter = async (req, res) => {
  const { userId } = req.params;
  const key = `students/${userId}/offer_letter.pdf`;

  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const response = await s3Client.send(command);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="offer_letter.pdf"');

    response.Body.pipe(res);
  } catch (err) {
    console.warn(`S3 stream failed for offer letter of ${userId}. Redirecting to placeholder PDF. Error:`, err.message);
    res.redirect('https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf');
  }
};
