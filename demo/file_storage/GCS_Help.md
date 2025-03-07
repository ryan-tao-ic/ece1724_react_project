## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click on the **project dropdown** at the top-left corner.
3. Click **"New Project"**.
4. Enter a **Project Name** (e.g., `next-gcs-upload`) and click **"Create"**.

---

## Step 2: Enable Cloud Storage API

1. Ensure your newly created project is selected in the top-left dropdown.
2. Navigate to the [Cloud Storage API page](https://console.cloud.google.com/apis/library/storage.googleapis.com).
3. Click **"Enable"** to activate the Cloud Storage API for your project.

---

## Step 3: Create a Cloud Storage Bucket

1. In the Google Cloud Console, navigate to **Cloud Storage**: [https://console.cloud.google.com/storage](https://console.cloud.google.com/storage).
2. Click **"Create Bucket"**.
3. Follow the bucket creation wizard:
   - **Bucket Name**: Choose a globally unique bucket name (e.g., `next-gcs-upload-bucket-123`).
   - **Location Type**: Choose "Region" for lowest latency.
   - **Location**: Select a region close to your users (e.g., `us-central1`).
   - **Storage Class**: Choose "Standard" for frequent access.
   - **Access Control**: Select "Fine-grained" (recommended for flexibility).
   - **Protection Tools**: Leave defaults (optional).
4. Click **"Create"**.

---

## Step 4: Set Bucket Permissions (Make Files Publicly Accessible)

Since we want to preview files directly in the browser, we'll make uploaded files publicly accessible by default:

1. In your bucket page, click the **"Permissions"** tab.
2. Click **"Grant Access"**.
3. In the "New principals" field, enter:  
   ```
   allUsers
   ```
4. In the "Role" dropdown, select:  
   ```
   Cloud Storage → Storage Object Viewer
   ```
5. Click **"Save"**.  
   *(Note: This makes files publicly readable. Ensure no sensitive data is uploaded.)*

---

## Step 5: Create a Service Account for Secure Access

To securely access your bucket from your Next.js app, create a service account:

1. Navigate to **IAM & Admin → Service Accounts**: [https://console.cloud.google.com/iam-admin/serviceaccounts](https://console.cloud.google.com/iam-admin/serviceaccounts).
2. Click **"Create Service Account"**.
3. Enter a **Service Account Name** (e.g., `file_storage`), then click **"Create and Continue"**.
4. Assign the following role:
   ```
   Cloud Storage → Storage Object Admin
   ```
   *(This allows your app to upload, list, and manage files.)*
5. Click **"Continue"**, then **"Done"**.

---

## Step 6: Generate and Download Service Account Key

1. Click on your newly created service account.
2. Navigate to the **"Keys"** tab.
3. Click **"Add Key" → "Create New Key"**.
4. Select **JSON** and click **"Create"**.  
   *(A JSON file will download automatically.)*

---

## Step 7: Configure Environment Variables in Your Next.js Project

Open the downloaded JSON file and copy the following values into your `.env.local` file in your Next.js project:

```env
GCS_PROJECT_ID=your-google-cloud-project-id
GCS_BUCKET_NAME=your-bucket-name
GCS_CLIENT_EMAIL=your-service-account-email
GCS_PRIVATE_KEY="your-private-key"
```

- Replace `your-google-cloud-project-id` with your actual project ID.
- Replace `your-bucket-name` with the bucket name you created.
- Replace `your-service-account-email` with the `client_email` from the JSON file.
- Replace `your-private-key` with the `private_key` from the JSON file.  
  *(Make sure to wrap the private key in quotes and replace all `\n` with actual newlines or handle it in code as shown previously.)*

Example:

```env
GCS_PROJECT_ID=next-gcs-upload
GCS_BUCKET_NAME=next-gcs-upload-bucket-123
GCS_CLIENT_EMAIL=next-gcs-uploader@next-gcs-upload.iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
```

---

## ✅ **Done!**

Your Google Cloud Storage bucket is now set up and ready to use with your Next.js file upload project.