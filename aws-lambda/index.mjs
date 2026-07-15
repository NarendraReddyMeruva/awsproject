import { DynamoDBClient, ScanCommand } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import nodemailer from "nodemailer";

const REGION = process.env.AWS_REGION || "us-east-1";
const USERS_TABLE = process.env.AWS_DYNAMODB_USERS_TABLE || "PlacementPortal_Users";

// Instantiate DynamoDB Clients (pre-installed in Node.js Lambda runtime)
const ddbClient = new DynamoDBClient({ region: REGION });
const docClient = DynamoDBDocumentClient.from(ddbClient);

// Setup Nodemailer SMTP Transporter from environment variables
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || "smtp.gmail.com",
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true", // true for port 465 (SSL), false for other ports (TLS/STARTTLS)
    auth: {
      user: process.env.SMTP_USER, // Your SMTP login email
      pass: process.env.SMTP_PASS, // Your SMTP app password
    },
  });
};

export const handler = async (event) => {
  console.log("DynamoDB Stream Event received:", JSON.stringify(event, null, 2));

  const transporter = createTransporter();

  // Verify SMTP connection configuration on boot
  try {
    await transporter.verify();
    console.log("SMTP connection verified successfully.");
  } catch (verifyErr) {
    console.error("SMTP verification failed. Check environment credentials:", verifyErr);
    return { statusCode: 500, message: "SMTP configuration error", error: verifyErr.message };
  }

  for (const record of event.Records) {
    // Only execute on INSERT (new job opportunity posted)
    if (record.eventName !== "INSERT") {
      console.log(`Skipping event type: ${record.eventName}`);
      continue;
    }

    const newJob = record.dynamodb.NewImage;
    if (!newJob) {
      console.warn("NewImage is missing in stream record.");
      continue;
    }

    // Extract fields (DynamoDB Stream records are marshalled)
    const title = newJob.title?.S || "N/A";
    const company = newJob.company?.S || "N/A";
    const packageDetail = newJob.packageDetail?.S || "N/A";
    const deadline = newJob.deadline?.S || "N/A";

    console.log(`Processing new job: ${title} at ${company}`);

    // 1. Fetch all student emails from users table
    let studentEmails = [];
    try {
      const scanParams = {
        TableName: USERS_TABLE,
        FilterExpression: "#role = :role",
        ExpressionAttributeNames: {
          "#role": "role"
        },
        ExpressionAttributeValues: {
          ":role": { S: "student" }
        },
        ProjectionExpression: "email"
      };

      const result = await ddbClient.send(new ScanCommand(scanParams));
      studentEmails = (result.Items || [])
        .map(item => item.email?.S)
        .filter(email => !!email);

      console.log(`Retrieved student emails: ${JSON.stringify(studentEmails)}`);
    } catch (dbErr) {
      console.error(`Error querying DynamoDB table '${USERS_TABLE}':`, dbErr);
      continue;
    }

    if (studentEmails.length === 0) {
      console.log("No student emails found. Skipping email notifications.");
      continue;
    }

    // 2. Prepare Email Details
    const subject = `New Job Opportunity: ${title} at ${company}`;
    
    // HTML Email body with custom layout matching the portal's design aesthetics
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; background-color: #fafafa;">
        <h2 style="color: #16a34a; border-bottom: 2px solid #16a34a; padding-bottom: 10px; margin-top: 0;">New Job Drive Posted!</h2>
        <p>Dear Candidate,</p>
        <p>A new job opportunity has been posted on the <strong>Placement Cell Automation</strong> portal:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eaeaea; width: 120px;">Role:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${title}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eaeaea;">Company:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${company}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eaeaea;">Package:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; color: #16a34a; font-weight: bold;">${packageDetail}</td>
          </tr>
          <tr>
            <td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eaeaea;">Deadline:</td>
            <td style="padding: 8px; border-bottom: 1px solid #eaeaea; color: #ef4444; font-weight: bold;">${deadline}</td>
          </tr>
        </table>
        <p>Please log in to your account dashboard to check your eligibility criteria and submit your application.</p>
        <p style="margin-top: 30px; font-size: 0.85em; color: #777;">This is an automated notification. Please do not reply directly to this email.<br/>Best regards,<br/><strong>Placement Cell Office</strong></p>
      </div>
    `;

    // Send emails in parallel (using Promise.allSettled to track each execution)
    try {
      console.log(`Sending email notifications to ${studentEmails.length} candidates...`);
      
      const mailPromises = studentEmails.map((email) => {
        return transporter.sendMail({
          from: process.env.EMAIL_FROM || '"Placement Cell" <no-reply@college.edu>',
          to: email,
          subject: subject,
          html: htmlBody,
          text: `A new job opportunity has been posted: ${title} at ${company}. Package: ${packageDetail}. Apply before: ${deadline}. Log in to your portal to apply.`
        });
      });

      const results = await Promise.allSettled(mailPromises);
      
      const successful = results.filter(r => r.status === "fulfilled").length;
      const failed = results.filter(r => r.status === "rejected").length;
      
      console.log(`Emails delivery summary: ${successful} sent successfully, ${failed} failed.`);
      if (failed > 0) {
        results.forEach((r, index) => {
          if (r.status === "rejected") {
            console.error(`Failed to send to ${studentEmails[index]}:`, r.reason);
          }
        });
      }
    } catch (sendErr) {
      console.error("General error during Nodemailer batch email delivery:", sendErr);
    }
  }

  return { statusCode: 200, message: "Lambda completed processing job stream" };
};

export default handler;
