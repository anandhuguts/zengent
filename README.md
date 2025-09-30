# Zengent AI - Enterprise Application Intelligence Platform

A comprehensive enterprise application intelligence platform designed to analyze multi-language project architectures through multiple input methods: ZIP file uploads and GitHub repository analysis. The system supports Java, Python, PySpark, and Mainframe codebases, extracting and parsing source files to identify architectural patterns, dependencies, and relationships between components.

The platform features a modern React frontend with an agent-like interface supporting multiple programming languages, backed by an Express.js server that handles file processing, GitHub integration, and intelligent code analysis with UML-style diagrams and AI-generated recommendations.

## Technology Stack

### Frontend Technologies
- **React 18.3.1** - Modern UI library with TypeScript
- **TypeScript 5.6.3** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - High-quality React component library
- **Radix UI** - Accessible component primitives
- **React Flow 11.11.4** - Interactive diagram visualization
- **TanStack Query 5.60.5** - Server state management
- **Wouter 3.3.5** - Lightweight routing
- **Vite 5.4.19** - Fast build tool and dev server
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library

### Backend Technologies
- **Node.js** - Runtime environment
- **Express.js 4.21.2** - Web application framework
- **TypeScript** - Type-safe backend code
- **Passport.js** - Authentication middleware
- **bcrypt** - Password hashing
- **express-session** - Session management
- **Multer** - File upload handling (50MB ZIP limit)
- **JSZip 3.10.1** - ZIP file processing

### Database & ORM
- **PostgreSQL** - Primary database (Neon-backed)
- **Drizzle ORM 0.39.1** - Type-safe database queries
- **connect-pg-simple** - PostgreSQL session store

### AI & Machine Learning Stack

#### Core AI Integration
- **OpenAI API 5.12.1** - GPT-4o for online AI analysis
- **Ollama 0.5.17** - Local LLM integration
- **HuggingFace Transformers** - Local AI models
  - CodeBERT - Code quality analysis
  - DialoGPT - Conversational AI
  - Sentence Transformers - Embeddings

#### Advanced AI Framework
- **LangChain** - Document processing and QA chains
  - PyPDFLoader - PDF document loading
  - RecursiveCharacterTextSplitter - Text chunking
  - HuggingFaceEmbeddings - Vector embeddings
  - RetrievalQA - Question answering chains
- **LangGraph** - Workflow orchestration for complex AI pipelines
- **Langfuse** - LLM observability and monitoring

#### Vector Database & Search
- **ChromaDB** - Persistent vector storage
- **Sentence Transformers** - Semantic embeddings
- **Redis** - Caching layer for performance

#### Enterprise Integration
- **IBM Doclinq** - Enterprise PDF processing
- **SonarQube** - Code quality and security analysis
- **Swagger** - API documentation

### Development Tools
- **tsx** - TypeScript execution
- **esbuild** - JavaScript bundler
- **drizzle-kit** - Database migrations
- **Autoprefixer** - CSS vendor prefixing

### Python Dependencies (Auto-installed)
- `chromadb` - Vector database
- `sentence-transformers` - Embeddings
- `langchain` - AI framework
- `langgraph` - Workflow orchestration
- `langfuse` - LLM monitoring
- `transformers` - HuggingFace models
- `torch` - PyTorch framework
- `redis` - Cache client
- `beautifulsoup4` - Web scraping
- `PyPDF2` - PDF processing
- `requests` - HTTP library

## Key Features

### Multi-Language Support
- **Java Projects**: Spring Boot patterns, JPA entities, MVC architecture, Maven/Gradle dependencies
- **Python Applications**: Django/Flask frameworks, module dependencies, API endpoint mapping  
- **PySpark Workflows**: DataFrame analysis, job flow visualization, performance metrics
- **Mainframe Systems**: COBOL program flow, JCL job dependencies, database connections

### AI-Powered Analysis
Choose between two powerful AI analysis options:

#### 🌐 Online AI (OpenAI GPT-4o)
- Advanced natural language understanding
- Sophisticated code pattern recognition
- Business context analysis
- High-quality architectural insights

#### 🖥️ Local AI (Privacy-Focused)
- **Ollama Integration** with models:
  - Llama 2/3 - General purpose
  - Code Llama - Code specialist
  - Mistral - Efficient analysis
  - Deepseek Coder - Advanced comprehension
  - StarCoder - Programming specialist
- Complete data privacy (no external API calls)
- Local inference processing

### Enterprise AI Agents

#### ZenVector Agent
- Code similarity detection using ChromaDB
- Semantic search across codebases
- Demographic data pattern analysis
- HuggingFace CodeBERT integration
- Langfuse monitoring

#### Knowledge Agent
- Confluence page scraping
- PDF document processing with IBM Doclinq
- LangChain QA chains
- LangGraph workflow orchestration
- Redis caching

### Interactive Visualizations
- **React Flow Diagrams**: Interactive UML-style visualizations
- **5 Diagram Types**: Flow Chart, Component, Class, Sequence, and ER diagrams
- **Export Capabilities**: PNG and SVG format exports
- **Real-time Interaction**: Zoom, pan, and explore architectural relationships

### Comprehensive Analysis Reports
- Project description and business problem analysis
- Technical architecture with patterns and dependencies
- AI-powered quality metrics and recommendations
- Professional PDF export with diagrams

## Railway Deployment

### Prerequisites
1. Railway account ([railway.app](https://railway.app))
2. OpenAI API key (for online AI analysis)
3. PostgreSQL database (provided by Railway)

### Step 1: Initial Setup

**Add New Service:**
1. Create new project in Railway
2. Click "New Service" → "GitHub Repo"
3. Select your Zengent AI repository

### Step 2: Configure Build Settings

**Build Configuration:**
```
Build Command: npm install && npm run build
Start Command: npm start
```

### Step 3: Environment Variables

Add these environment variables in Railway:

#### Required Variables
```bash
# Node Environment
NODE_ENV=production

# Database (Auto-provided by Railway PostgreSQL)
DATABASE_URL=${DATABASE_URL}
PGHOST=${PGHOST}
PGPORT=${PGPORT}
PGUSER=${PGUSER}
PGPASSWORD=${PGPASSWORD}
PGDATABASE=${PGDATABASE}

# Session Secret
SESSION_SECRET=your-secure-random-string-here

# AI Configuration (Optional - for OpenAI)
OPENAI_API_KEY=your-openai-api-key

# Ollama Configuration (Optional - for local LLM)
VITE_OLLAMA_ENDPOINT=http://localhost:11434
```

### Step 4: Add PostgreSQL Database

1. Click "New" → "Database" → "Add PostgreSQL"
2. Railway automatically creates and links DATABASE_URL
3. Database schema is auto-created on first run

### Step 5: Install Python Dependencies

Railway automatically detects and installs Python dependencies when:
- Python runtime is available in the environment
- Code imports trigger auto-installation of:
  - ChromaDB, LangChain, LangGraph
  - Sentence Transformers, HuggingFace
  - Langfuse, Redis clients

### Step 6: Configure Python Runtime (Optional)

For advanced AI features, add to Railway settings:

**Nixpacks Configuration** (create `nixpacks.toml`):
```toml
[phases.setup]
nixPkgs = ["nodejs-20", "python311", "python311Packages.pip"]

[phases.install]
cmds = [
  "npm install",
  "pip install chromadb sentence-transformers langchain langgraph langfuse transformers torch redis beautifulsoup4 PyPDF2 --user"
]

[phases.build]
cmds = ["npm run build"]

[start]
cmd = "npm start"
```

### Step 7: Port Configuration

Railway automatically assigns PORT. The application binds to:
```javascript
const PORT = process.env.PORT || 5000
```

### Step 8: Deploy

1. Commit changes to GitHub
2. Railway auto-deploys on push
3. Monitor logs in Railway dashboard
4. Access via generated Railway URL: `https://your-app.railway.app`

### Step 9: Custom Domain (Optional)

1. Go to Settings → Domains
2. Click "Generate Domain" or add custom domain
3. Configure DNS if using custom domain

## Local Development

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL (or use in-memory storage)
- Python 3.11+ (for AI features)
- Ollama (optional, for local LLM)

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd zengent-ai

# Install Node.js dependencies
npm install

# Install Python dependencies (optional, for AI features)
pip install chromadb sentence-transformers langchain langgraph langfuse transformers torch redis beautifulsoup4 PyPDF2

# Set up environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations (if using PostgreSQL)
npm run db:push

# Start development server
npm run dev
```

The application will be available at `http://localhost:5000`

### Local LLM Setup (Optional)

**Installing Ollama:**
```bash
# Linux/macOS
curl -fsSL https://ollama.ai/install.sh | sh

# Windows - Download from https://ollama.ai/download
```

**Install Models:**
```bash
ollama pull codellama:7b
ollama pull deepseek-coder:6.7b
ollama pull mistral:7b
```

**Start Ollama:**
```bash
ollama serve
```

## Environment Variables Reference

```bash
# Application
NODE_ENV=development|production
PORT=5000

# Database
DATABASE_URL=postgresql://user:password@host:port/database
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_password
PGDATABASE=zengent

# Authentication
SESSION_SECRET=your-secure-random-secret

# AI Services
OPENAI_API_KEY=sk-...
VITE_OLLAMA_ENDPOINT=http://localhost:11434

# Advanced Features (Optional)
LANGFUSE_PUBLIC_KEY=pk-...
LANGFUSE_SECRET_KEY=sk-...
REDIS_URL=redis://localhost:6379
SONARQUBE_URL=http://sonarqube:9000
SONARQUBE_TOKEN=your-token
```

## Project Structure

```
zengent-ai/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Route pages
│   │   ├── lib/           # Utilities
│   │   └── services/      # API services
├── server/                # Express backend
│   ├── routes/           # API routes
│   ├── services/         # Business logic
│   │   ├── knowledgeAgent.py    # LangChain/LangGraph
│   │   ├── zenVectorService.py  # ChromaDB/Vector search
│   │   ├── aiAnalysisService.ts # AI integration
│   │   └── githubService.ts     # GitHub analysis
│   ├── auth.ts           # Authentication
│   └── index.ts          # Server entry
├── shared/               # Shared types
│   └── schema.ts         # Database schema
└── package.json          # Dependencies
```

## Supported Project Types

| Language | Frameworks | Analysis Features |
|----------|------------|-------------------|
| **Java** | Spring Boot, Spring MVC, JPA | Controllers, Services, Repositories, Entities |
| **Python** | Django, Flask, FastAPI | Modules, Views, Models, API endpoints |
| **PySpark** | Apache Spark | DataFrames, Jobs, Transformations |
| **Mainframe** | COBOL, JCL | Program flow, Job dependencies |

## API Documentation

Once deployed, Swagger documentation is available at:
```
https://your-app.railway.app/api-docs
```

## Troubleshooting

### Railway Deployment Issues

**Build Failures:**
- Ensure all environment variables are set
- Check Railway build logs for specific errors
- Verify Node.js version compatibility

**Python Dependencies:**
- Python packages auto-install on first use
- Check deployment logs for installation errors
- May need to increase deployment timeout for large packages

**Database Connection:**
- Verify DATABASE_URL is set correctly
- Ensure PostgreSQL service is running
- Check firewall/network settings

### Local Development Issues

**Port Already in Use:**
```bash
# Change port in .env
PORT=3000
```

**Database Connection:**
```bash
# Verify PostgreSQL is running
pg_isready

# Check connection string
psql $DATABASE_URL
```

## Contributing

This project follows modern development practices with TypeScript, comprehensive error handling, and modular architecture. Contributions are welcome!

## License

MIT License

---

**Zengent AI** - Transforming enterprise code into actionable insights with advanced AI and vector intelligence.
