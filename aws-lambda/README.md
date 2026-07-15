# Deploying AWS Lambda & Nodemailer Notification Trigger

This guide explains how to set up the event-driven notification pipeline: when a new job is added to the database, AWS Lambda is triggered to fetch student emails and send custom HTML alerts via **Nodemailer (SMTP)**.

---

## Step 1: Enable DynamoDB Streams
To trigger Lambda on new entries in the jobs table, you must enable streams:

1. Open your AWS Console and search for **DynamoDB**.
2. Click **Tables** on the left menu and select your table: `PlacementPortal_Jobs`.
3. Navigate to the **Exports and streams** tab.
4. Locate the **DynamoDB stream details** section and click **Turn on**.
5. Under view type, select **New image** (this includes only the newly added attributes).
6. Click **Turn on stream**. Copy the **Latest stream ARN** (you will need it later).

---

## Step 2: Configure Lambda IAM Role Policies
The Lambda function needs permission to read the Jobs stream and scan your Users table.

1. Search for **IAM** in the AWS console.
2. In the left navigation pane, click **Roles** and search for your Lambda's execution role.
3. Click on the role name, click **Add permissions**, and select **Create inline policy**.
4. Switch to the **JSON** tab and paste the following policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:DescribeStream",
        "dynamodb:GetRecords",
        "dynamodb:GetShardIterator",
        "dynamodb:ListStreams"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/PlacementPortal_Jobs/stream/*"
    },
    {
      "Effect": "Allow",
      "Action": [
        "dynamodb:Scan"
      ],
      "Resource": "arn:aws:dynamodb:*:*:table/PlacementPortal_Users"
    }
  ]
}
```
5. Click **Review policy**, name it `PlacementPortal_LambdaPermissions`, and click **Create policy**.

---

## Step 3: Package and Deploy Nodemailer to Lambda
Because Nodemailer is a third-party module, you must bundle it inside a `.zip` file alongside the script to upload it to AWS:

1. Open a terminal on your computer and navigate to the `aws-lambda/` directory:
   ```bash
   cd aws-lambda
   ```
2. Download Nodemailer:
   ```bash
   npm install
   ```
3. Compress the files into a `.zip` archive:
   *   **On Windows (PowerShell)**:
       ```powershell
       Compress-Archive -Path index.mjs, package.json, node_modules -DestinationPath function.zip -Force
       ```
   *   **On macOS / Linux**:
       ```bash
       zip -r function.zip index.mjs package.json node_modules
       ```
4. Create the Lambda in AWS:
   *   Search for **Lambda** in the AWS console and click **Create function**.
   *   Name: `PlacementPortal_JobNotifier`.
   *   Runtime: **Node.js 18.x** or **Node.js 20.x**.
   *   Execution Role: Select the role configured in Step 2.
   *   Click **Create function**.
5. Upload the code:
   *   In the **Code** tab of your function, click **Upload from** on the right side.
   *   Select **.zip file** and select the `function.zip` created in Step 3. Click **Save**.

---

## Step 4: Configure SMTP Environment Variables

You must supply SMTP configurations so Nodemailer can login and dispatch emails (e.g. using Gmail, SES SMTP, Outlook, etc.):

1. In your Lambda dashboard, select the **Configuration** tab, then select **Environment variables**.
2. Click **Edit** -> **Add environment variable** and set:
   *   `SMTP_HOST` = e.g., `smtp.gmail.com`
   *   `SMTP_PORT` = e.g., `587` (TLS) or `465` (SSL)
   *   `SMTP_SECURE` = `true` if port is 465, otherwise `false`
   *   `SMTP_USER` = (Your email address, e.g. `career-office@college.edu`)
   *   `SMTP_PASS` = (Your email SMTP app password or email login password)
   *   `EMAIL_FROM` = (Display name, e.g., `"Placement Cell Office" <career-office@college.edu>`)
   *   `AWS_DYNAMODB_USERS_TABLE` = `PlacementPortal_Users`
   *   `AWS_REGION` = (Your AWS Region name, e.g., `us-east-1`)
3. Click **Save**.

---

## Step 5: Configure DynamoDB Trigger
Finally, hook up the stream trigger:

1. In your Lambda dashboard, click **Add trigger** at the top.
2. Select **DynamoDB** from the list.
3. Under **DynamoDB table**, select `PlacementPortal_Jobs`.
4. Set Batch size to `1`.
5. Set Starting position to **Latest**.
6. Click **Add**.

Now, when a job opportunity is uploaded, the DynamoDB Stream initiates the trigger, and Nodemailer dispatches an elegant HTML alert to all students directly.
