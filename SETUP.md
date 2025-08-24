# Setup Guide

## 1. Supabase Setup

### Create a Supabase Project
1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Create a new project
3. Wait for the project to be ready

### Configure Authentication
1. Go to Authentication > Settings
2. Add your domain to "Site URL" (e.g., `http://localhost:3002` for development)
3. Add your domain to "Redirect URLs" (e.g., `http://localhost:3002/auth/callback`)

### Set up Database Schema
1. Go to SQL Editor
2. Copy and paste the contents of `supabase-schema.sql`
3. Run the SQL to create all tables and policies

### Get API Keys
1. Go to Settings > API
2. Copy the following values:
   - Project URL
   - anon/public key
   - service_role key (keep this secret!)

## 2. Environment Variables

Create a `.env.local` file in the root directory with:

```bash
# OpenAI API Key
OPENAI_API_KEY=your_openai_api_key_here

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
```

## 3. Vercel Deployment

### Connect to GitHub
1. Go to [vercel.com](https://vercel.com) and sign up/login
2. Click "New Project"
3. Connect your GitHub repository
4. Select the repository

### Configure Environment Variables
1. In the Vercel project settings, go to "Environment Variables"
2. Add all the environment variables from your `.env.local` file
3. Make sure to set them for "Production", "Preview", and "Development"

### Deploy
1. Vercel will automatically deploy when you push to your main branch
2. You can also manually deploy from the Vercel dashboard

## 4. Domain Configuration

### Update Supabase Settings
1. Go back to Supabase Authentication > Settings
2. Update "Site URL" to your Vercel domain (e.g., `https://your-app.vercel.app`)
3. Update "Redirect URLs" to include your Vercel domain (e.g., `https://your-app.vercel.app/auth/callback`)

## 5. Test the Setup

1. Visit your deployed app
2. Try to sign in with magic link authentication
3. Create a brief and generate content
4. Verify that data is being saved to Supabase

## Troubleshooting

### Common Issues
- **Authentication not working**: Check that your domain is correctly configured in Supabase
- **Database errors**: Make sure you've run the schema SQL in Supabase
- **Environment variables**: Verify all keys are set correctly in Vercel

### Local Development
- Run `npm run dev` to start the development server
- Make sure your `.env.local` file is configured
- Test authentication and database operations locally first
