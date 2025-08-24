# Prompt-to-Blog Engine

A Next.js application that transforms briefs into engaging blog posts and social content using OpenAI and Supabase.

## Features

- **Brief Creation**: Structured form for creating content briefs
- **AI Content Generation**: Generate blog drafts and LinkedIn posts using OpenAI
- **Supabase Integration**: User authentication and data persistence
- **Draft Management**: Save, view, and manage your content drafts
- **Snippet Extraction**: Extract reusable content snippets

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (Magic Link)
- **AI**: OpenAI GPT-4
- **Deployment**: Vercel

## Local Development

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key

### Setup

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd prompt-to-blog-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file:
   ```bash
   # OpenAI API Configuration
   OPENAI_API_KEY=your_openai_api_key_here

   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

4. **Set up Supabase database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase-schema.sql`

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:3000`

## Deployment to Vercel

### Prerequisites

- Vercel account
- GitHub repository with your code
- Supabase project configured
- OpenAI API key

### Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Sign in with your GitHub account
   - Click "New Project"
   - Import your GitHub repository

3. **Configure environment variables**
   In your Vercel project settings, add these environment variables:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url_here
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
   ```

4. **Deploy**
   - Vercel will automatically detect it's a Next.js project
   - Click "Deploy"
   - Your app will be live at `https://your-project.vercel.app`

### Post-Deployment

1. **Update Supabase Auth settings**
   - Go to your Supabase project dashboard
   - Navigate to Authentication → URL Configuration
   - Add your Vercel domain to "Site URL"
   - Add `https://your-project.vercel.app/auth/callback` to "Redirect URLs"

2. **Test the deployment**
   - Visit your Vercel URL
   - Test the sign-in flow
   - Create a brief and generate content

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `OPENAI_API_KEY` | Your OpenAI API key | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key | Yes |

## Database Schema

The application uses two main tables:

- **`briefs`**: Stores user briefs with JSON data
- **`drafts`**: Stores generated content linked to briefs

See `supabase-schema.sql` for the complete schema.

## Troubleshooting

### Common Issues

1. **"Failed to generate content"**
   - Check your OpenAI API key is correct
   - Ensure you have sufficient OpenAI credits

2. **"Unauthorized" errors**
   - Verify Supabase environment variables
   - Check Supabase Auth settings
   - Ensure RLS policies are configured

3. **Deployment fails**
   - Check all environment variables are set in Vercel
   - Verify the build completes locally first

### Support

For issues specific to this application, check the GitHub repository issues or create a new one.

## License

This project is licensed under the MIT License.