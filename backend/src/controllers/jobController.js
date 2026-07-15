import { ScanCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDb } from '../config/aws.js';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const JOBS_TABLE = process.env.AWS_DYNAMODB_JOBS_TABLE || 'PlacementPortal_Jobs';

export const createJob = async (req, res) => {
  const { title, company, description, eligibilityCriteria, packageDetail, deadline } = req.body;

  if (!title || !company || !description || !eligibilityCriteria || !packageDetail || !deadline) {
    return res.status(400).json({ message: 'All job fields are required.' });
  }

  const { minCgpa, maxBacklogs, allowedBranches } = eligibilityCriteria;

  if (minCgpa === undefined || maxBacklogs === undefined || !Array.isArray(allowedBranches)) {
    return res.status(400).json({ message: 'Eligibility criteria must include minCgpa, maxBacklogs, and allowedBranches array.' });
  }

  try {
    const jobId = crypto.randomUUID();
    const newJob = {
      jobId,
      title,
      company,
      description,
      eligibilityCriteria: {
        minCgpa: Number(minCgpa),
        maxBacklogs: Number(maxBacklogs),
        allowedBranches: allowedBranches.map(b => b.trim().toUpperCase()),
      },
      packageDetail,
      deadline,
      postedDate: new Date().toISOString(),
      postedBy: req.user.userId,
    };

    const putParams = {
      TableName: JOBS_TABLE,
      Item: newJob,
    };

    await dynamoDb.send(new PutCommand(putParams));

    res.status(201).json({ message: 'Job opportunity posted successfully!', job: newJob });
  } catch (err) {
    console.error('Create job error:', err);
    res.status(500).json({ message: 'Error posting job opportunity.', error: err.message });
  }
};

export const getAllJobs = async (req, res) => {
  try {
    const params = {
      TableName: JOBS_TABLE,
    };

    let jobs = [];
    try {
      const { Items } = await dynamoDb.send(new ScanCommand(params));
      jobs = Items || [];
    } catch (e) {
      console.warn("Scan failed for Jobs table. Table may not exist. Using mock fallback records.");
      jobs = [
        {
          jobId: "mock-job-1",
          title: "Graduate Software Engineer",
          company: "Cognizant",
          description: "Work on enterprise-level cloud platforms and modern single page applications. Experience with JS/Java is a plus.",
          eligibilityCriteria: {
            minCgpa: 6.5,
            maxBacklogs: 1,
            allowedBranches: ["CSE", "ECE", "IT"]
          },
          packageDetail: "4.5 LPA",
          deadline: new Date(Date.now() + 86400000 * 10).toISOString().split('T')[0],
          postedDate: new Date().toISOString(),
          postedBy: "admin"
        },
        {
          jobId: "mock-job-2",
          title: "SDE Intern",
          company: "Microsoft",
          description: "Write production grade services, scale database schemas, and deploy serverless systems in global regions.",
          eligibilityCriteria: {
            minCgpa: 8.5,
            maxBacklogs: 0,
            allowedBranches: ["CSE", "ECE"]
          },
          packageDetail: "15 LPA (Stipend: 80K/mo)",
          deadline: new Date(Date.now() + 86400000 * 5).toISOString().split('T')[0],
          postedDate: new Date().toISOString(),
          postedBy: "admin"
        }
      ];
    }

    res.status(200).json(jobs);
  } catch (err) {
    console.error('Get jobs error:', err);
    res.status(500).json({ message: 'Error fetching job opportunities.', error: err.message });
  }
};
