# Production Deployment Secrets

## Required Environment Variables for Deployment

### Essential Secrets (Required)
- `DATABASE_URL` - PostgreSQL connection string for production database
- `SESSION_SECRET` - Random secret key for session encryption (minimum 32 characters)

### Optional AI Integration Secrets
- `OPENAI_API_KEY` - OpenAI API key for GPT-4o analysis (if using OpenAI)
- `OLLAMA_ENDPOINT` - Local LLM endpoint URL (if using local AI models)
- `OLLAMA_MODEL` - Model name for local LLM (e.g., mistral:7b)

### System Environment Variables (Auto-configured)
- `NODE_ENV` - Set to "production" for deployment
- `PORT` - Server port (auto-configured by Replit)

## How to Add Secrets in Replit Deployments

1. Go to your Replit project
2. Click on "Deploy" tab
3. Navigate to "Environment Variables" section
4. Add each required secret with its value
5. Click "Deploy" to redeploy with new secrets

## Security Notes

- Never commit actual secret values to code
- Use strong, randomly generated values for SESSION_SECRET
- Keep API keys secure and rotate them regularly
- Test deployment with minimal required secrets first