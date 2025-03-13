# Todo App

A full-stack todo application built with Next.js, MongoDB, and NextAuth.js.

## Features

- User authentication with email/password and Google OAuth
- Create, read, update, and delete todos
- Mark todos as completed
- Responsive design

## Deployment to Vercel

### Prerequisites

1. A [Vercel](https://vercel.com) account
2. A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
3. A [Google Cloud Platform](https://console.cloud.google.com) project with OAuth credentials

### Step 1: Update Google OAuth Configuration

1. Go to the [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" > "Credentials"
3. Edit your OAuth 2.0 Client ID
4. Add your Vercel deployment URL to the "Authorized JavaScript origins" and "Authorized redirect URIs"
   - JavaScript origins: `https://your-app-name.vercel.app`
   - Redirect URI: `https://your-app-name.vercel.app/api/auth/callback/google`

### Step 2: Deploy to Vercel

1. Push your code to a GitHub repository
2. Log in to [Vercel](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure the following environment variables:
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT signing
   - `JWT_LIFETIME`: 30d
   - `NEXTAUTH_SECRET`: A secure random string for NextAuth.js
   - `GOOGLE_CLIENT_ID`: Your Google OAuth client ID
   - `GOOGLE_CLIENT_SECRET`: Your Google OAuth client secret
6. Click "Deploy"

### Step 3: Update NEXTAUTH_URL

After deployment:

1. Go to your project settings in Vercel
2. Add a new environment variable:
   - `NEXTAUTH_URL`: Your Vercel deployment URL (e.g., `https://your-app-name.vercel.app`)
3. Redeploy your application

## Local Development

1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
4. Run the development server: `npm run dev`

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT signing
- `JWT_LIFETIME`: JWT token lifetime
- `NEXTAUTH_URL`: URL of your application
- `NEXTAUTH_SECRET`: Secret for NextAuth.js
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret

## Tech Stack

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Express.js, MongoDB
- **Authentication**: NextAuth.js
- **Database**: MongoDB

## Project Structure

- `/api`: Backend API with Express.js
  - `/controllers`: API controllers
  - `/middleware`: Middleware functions
  - `/models`: MongoDB models
  - `/routes`: API routes
- `/app`: Next.js frontend
  - `/api`: Next.js API routes
  - `/auth`: Authentication pages
  - `/components`: Reusable components
  - `/dashboard`: Dashboard pages
  - `/providers`: Context providers

## Time Complexity

- Task Addition: O(1) - Constant time operation for adding a new task
- Task Deletion: O(1) - Constant time operation for deleting a task
- Task Update: O(1) - Constant time operation for updating a task
- Task Listing: O(n) - Linear time operation for listing all tasks

## License

MIT 