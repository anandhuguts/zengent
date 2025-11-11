# Code Lens v2 - Local Setup Guide

## Prerequisites

Before running the application locally, ensure you have:

1. **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for cloning)

## Installation Steps

### 1. Download the Project

If you have the project files, skip this step. Otherwise:
```bash
# Download or copy all project files to your local directory
cd /path/to/your/code-lens-folder
```

### 2. Install Dependencies

Open a terminal in the project directory and run:

```bash
npm install
```

This will install all required packages (React, Express, TypeScript, etc.)

### 3. Environment Setup (Optional)

The application works without any environment variables thanks to hardcoded credentials. However, if you want to use AI features:

Create a `.env` file in the project root (optional):

```env
# Optional: For OpenAI AI Analysis
OPENAI_API_KEY=your-openai-api-key-here

# Optional: For PostgreSQL (currently using in-memory storage)
DATABASE_URL=postgresql://user:password@localhost:5432/codelens

# Session secret (already hardcoded in the app)
SESSION_SECRET=code-lens-session-secret-2024
```

**Note:** The app will work fine without these - AI analysis will use local mode, and authentication uses the hardcoded user (amex/zensar).

### 4. Start the Application

Run the development server:

```bash
npm run dev
```

You should see:
```
🚀 Server running in development mode on port 5000
✓ Loaded 0 custom demographic patterns
```

### 5. Access the Application

Open your web browser and go to:
```
http://localhost:5000
```

### 6. Login

Use these credentials:
- **Username:** `amex`
- **Password:** `zensar`

## Project Structure

```
code-lens/
├── client/          # Frontend React application
│   └── src/
│       ├── pages/   # Application pages
│       └── components/
├── server/          # Backend Express server
│   ├── routes.ts    # API endpoints
│   ├── auth.ts      # Authentication (hardcoded user)
│   └── services/    # Analysis services
├── shared/          # Shared types and schemas
└── package.json     # Dependencies
```

## Features Available Locally

✅ **Code Analysis** - Upload ZIP files (Java, Python, PySpark, Mainframe)
✅ **Dependency Graphs** - Interactive visualizations
✅ **Demographic Scanning** - Compliance field detection
✅ **Data Flow Analysis** - Track data through your codebase
✅ **Impact Analysis** - See change impacts
✅ **PDF Reports** - Generate professional reports
✅ **Local AI** - Use Ollama for offline AI analysis
✅ **GitHub Integration** - Analyze repositories

## Troubleshooting

### Port 5000 Already in Use
If port 5000 is occupied, modify `server/index.ts`:
```typescript
const PORT = process.env.PORT || 3000; // Change to 3000 or any free port
```

### Dependencies Not Installing
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Application Not Starting
```bash
# Check Node.js version
node --version  # Should be v18 or higher

# Try running with verbose logging
npm run dev
```

### Cannot Upload Files
Ensure the `uploads/` directory exists or Multer is using memory storage (current setup uses memory storage, so this shouldn't be an issue).

## Optional: PostgreSQL Setup

If you want to use a real database instead of in-memory storage:

1. Install PostgreSQL locally
2. Create a database:
   ```sql
   CREATE DATABASE codelens;
   ```
3. Update the `.env` file with your DATABASE_URL
4. Run migrations:
   ```bash
   npm run db:push
   ```
5. Modify `server/storage.ts` to use `DatabaseStorage` instead of `MemStorage`

## Optional: Local AI with Ollama

For offline AI analysis:

1. Install [Ollama](https://ollama.ai/)
2. Pull a model:
   ```bash
   ollama pull codellama
   ```
3. In the app, select "Local LLM" when running AI analysis

## Stopping the Application

Press `Ctrl + C` in the terminal where the app is running.

## Next Steps

- Upload a ZIP file of your Java/Python project
- Try the demographic scanner with an Excel file
- Explore different analysis views (Dependency Graph, Data Flow, Impact Analysis)
- Generate PDF reports

## Support

For issues or questions, check the console logs in your terminal for error messages.

---

**Developed by Diamond Zensar Team**
