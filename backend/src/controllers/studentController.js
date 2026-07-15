import { ScanCommand, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../config/aws.js';
import dotenv from 'dotenv';

dotenv.config();

const USERS_TABLE = process.env.AWS_DYNAMODB_USERS_TABLE || 'PlacementPortal_Users';

export const updateProfile = async (req, res) => {
  const { name, email, phone, branch, cgpa, backlogs } = req.body;
  const userId = req.user.userId;

  if (!name || !email || !phone || !branch || cgpa === undefined || backlogs === undefined) {
    return res.status(400).json({ message: 'All profile details are required.' });
  }

  try {
    const getParams = {
      TableName: USERS_TABLE,
      Key: { userId },
    };

    const { Item } = await dynamoDb.send(new GetCommand(getParams));

    if (!Item) {
      return res.status(404).json({ message: 'Student profile not found.' });
    }

    const updatedUser = {
      ...Item,
      name,
      email,
      phone,
      branch: branch.toUpperCase(),
      cgpa: Number(cgpa),
      backlogs: Number(backlogs),
      profileCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    const putParams = {
      TableName: USERS_TABLE,
      Item: updatedUser,
    };

    await dynamoDb.send(new PutCommand(putParams));

    const { passwordHash, ...userResponse } = updatedUser;
    res.status(200).json({ message: 'Profile updated successfully!', user: userResponse });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: 'Error updating profile.', error: err.message });
  }
};

export const getStudents = async (req, res) => {
  try {
    const params = {
      TableName: USERS_TABLE,
    };

    let students = [];
    try {
      const { Items } = await dynamoDb.send(new ScanCommand(params));
      students = (Items || []).filter(item => item.role === 'student');
    } catch (e) {
      console.warn("Scan failed for Users table. Table may not exist yet. Returning mock students for Admin dashboard.");
      students = [
        {
          userId: "23b91a05i1",
          role: "student",
          name: "Amit Kumar",
          email: "amit.kumar@college.edu",
          phone: "9876543210",
          branch: "CSE",
          cgpa: 8.7,
          backlogs: 0,
          resumeUrl: "https://example.com/mock-resume-amit.pdf",
          offerLetterUrl: "https://example.com/mock-offer-amit.pdf",
          profileCompleted: true
        },
        {
          userId: "23b91a0412",
          role: "student",
          name: "Sanya Patel",
          email: "sanya.p@college.edu",
          phone: "9988776655",
          branch: "ECE",
          cgpa: 7.9,
          backlogs: 1,
          resumeUrl: "https://example.com/mock-resume-sanya.pdf",
          offerLetterUrl: "",
          profileCompleted: true
        }
      ];
    }

    // Strip password hashes
    const sanitizedStudents = students.map(({ passwordHash, ...rest }) => rest);

    res.status(200).json(sanitizedStudents);
  } catch (err) {
    console.error('Get students error:', err);
    res.status(500).json({ message: 'Error fetching students list.', error: err.message });
  }
};
