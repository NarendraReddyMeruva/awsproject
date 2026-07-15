import { S3Client } from '@aws-sdk/client-s3';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import dotenv from 'dotenv';

dotenv.config();

const awsConfig = {
  region: process.env.AWS_REGION || 'us-east-1',
};

// Only add credentials block if custom credentials are provided and not placeholders
if (
  process.env.AWS_ACCESS_KEY_ID && 
  process.env.AWS_ACCESS_KEY_ID !== 'YOUR_AWS_ACCESS_KEY_ID' &&
  process.env.AWS_SECRET_ACCESS_KEY &&
  process.env.AWS_SECRET_ACCESS_KEY !== 'YOUR_AWS_SECRET_ACCESS_KEY'
) {
  awsConfig.credentials = {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  };
} else {
  console.warn('AWS credentials are not fully configured in environment variables. Falling back to default provider chain.');
}

export const s3Client = new S3Client(awsConfig);

const baseDbClient = new DynamoDBClient(awsConfig);
export const dynamoDb = DynamoDBDocumentClient.from(baseDbClient, {
  marshallOptions: {
    convertEmptyValues: true,
    removeUndefinedValues: true,
    convertClassInstanceToMap: true,
  },
});
