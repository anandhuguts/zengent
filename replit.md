# Code Lens - Enterprise Application Intelligence Platform

## Overview
Code Lens is an enterprise application intelligence platform that analyzes multi-language project architectures from ZIP uploads and GitHub repositories. It supports Java, Python, PySpark, and Mainframe codebases, extracting and parsing source files to identify architectural patterns, dependencies, and relationships. The platform provides interactive visual diagrams and AI-powered analysis using various LLMs, delivering intelligent insights and recommendations. It includes enterprise features such as Swagger API documentation, demographic field scanning with compliance reporting, and professional PDF report generation with corporate branding. The vision is to provide comprehensive, AI-driven insights into complex enterprise applications to aid development, refactoring, and strategic planning.

## User Preferences
Preferred communication style: Simple, everyday language.

### Critical Data Integrity Rules
**NEVER use mock values, dummy data, or placeholder content.** The system must ONLY display:
1. **Actual source code analysis results** from user-uploaded projects
2. **Real demographic scan data** from pattern matching or Excel field mapping
3. **Authentic AI-generated insights** from LLM analysis
4. **User-uploaded files and data** 

When no data is available, show appropriate empty state messages like "No analysis data available" or "No demographic fields found" instead of fake/sample data. This ensures users see only real, actionable information from their actual codebases.

## System Architecture

### Frontend
The client-side is built with React and TypeScript, using a component-based architecture. It leverages Tailwind CSS with shadcn/ui for consistent design, TanStack Query for state management, Wouter for routing, and Vite for fast builds. The user experience is structured in three phases: upload, processing with real-time indicators, and results with interactive diagrams.

### Backend
The server is built with Express.js and TypeScript, following a modular design. It handles file processing (ZIP uploads up to 50MB with Multer), GitHub integration, and intelligent code analysis. The API is designed with RESTful endpoints for project management and file uploads.

### Data Storage
The application uses a flexible storage abstraction. The current implementation uses in-memory storage, but the schema is designed for PostgreSQL with Drizzle ORM to store project metadata, analysis results (JSON format for parsed data), and user information.

### Authentication and Authorization
The system supports database-based user authentication with secure password encryption (bcrypt), session management, and registration/login endpoints. Projects can be associated with users for multi-tenant support.

### Multi-Language Code Analysis Engine
The core analysis processes Java (Spring Boot, JPA, MVC), Python (Django/Flask), PySpark (DataFrame, job flow), and Mainframe (COBOL, JCL) projects. It supports automatic ZIP extraction and validation. Users can choose between OpenAI GPT-4o (online) or local LLMs via Ollama (Code Llama, Deepseek Coder, StarCoder, Llama 3, Mistral) for privacy-first analysis. The engine builds dependency graphs, architectural relationships, and generates interactive UML-style diagrams with language-specific representations, producing professional PDF reports.

### AI Insights & Recommendations
The platform provides comprehensive AI-powered insights including project overview, architecture analysis, actionable recommendations, quality assessment scores, and module-level insights for individual classes with improvement opportunities.

### ZenVector Agent - Vector Database Intelligence
This advanced AI agent uses ChromaDB for persistent vector storage, enabling code similarity detection, semantic search across codebases, and demographic data analysis. It leverages multi-modal search and sentence transformer models for high-quality semantic understanding.

### Knowledge Agent - Document Intelligence & Q&A
This agent provides comprehensive document scraping (including Confluence integration, IBM Doclinq for PDF processing), intelligent Q&A, and enterprise AI integration. It uses LangChain for document processing, LangGraph for workflow orchestration, Langfuse for observability, and Redis for caching. ChromaDB stores the persistent knowledge base. It supports multi-model AI responses and a chat interface for context-aware interactions.

### ZenVector Agent - Advanced Code Intelligence
An enhanced AI agent for enterprise-grade code analysis. It integrates ChromaDB for persistent vector storage and HuggingFace CodeBERT for code quality analysis. Langfuse provides LLM monitoring and tracing for all AI operations.

### POD→POA Migration AI Suggester
An intelligent migration planning system that analyzes POD (Point of Departure - legacy systems) and generates comprehensive POA (Point of Arrival - modern target systems) migration roadmaps. This AI-powered feature leverages existing Code Lens analysis (dependencies, demographic data, quality metrics, security vulnerabilities) to provide:

**Migration Analysis:**
- Automated POD assessment using dependency graphs, demographic field scanning, ISO-5055 quality metrics, and CWE vulnerability data
- AI-powered POA architecture recommendations (microservices, cloud-native, serverless)
- Technology stack suggestions (language upgrades, frameworks, databases, cloud platforms)
- Migration strategy selection (Strangler Fig, Phased, Big Bang, Lift & Shift) with AI reasoning

**Phased Migration Roadmap:**
- Multi-phase migration plans (typically 3-4 phases over 6 months)
- Service-by-service extraction prioritizing compliance-critical components
- Effort estimation (person-months), timeline, and deliverables per phase
- Dependency tracking and risk assessment for each phase

**Demographic Data Migration:**
- Security-first approach for migrating sensitive data (SSN, credit cards, PII)
- Encryption strategies (AES-256-GCM with cloud KMS, PCI-DSS tokenization)
- Data isolation patterns (dedicated PII vault microservices)
- Compliance features for GDPR, HIPAA, PCI-DSS with code transformation examples

**Cost-Benefit Analysis:**
- POD annual operating cost estimation (on-premise infrastructure, licenses, compliance risk)
- POA annual operating cost projection (cloud services, pay-as-you-go pricing)
- Migration investment calculation (development effort, tools, training)
- ROI break-even analysis and annual savings projections

**AI Model Support:**
- OpenAI GPT-4o for strategic migration planning and architecture recommendations
- Ollama local models (Code Llama, Deepseek Coder, Mistral) for privacy-first offline analysis
- HuggingFace CodeBERT for code pattern matching and transformation suggestions
- Multi-AI approach combining strategic planning (OpenAI) with tactical execution (local models)

**Risk Management:**
- Automated risk identification across security, compliance, data loss, performance, and downtime categories
- Impact assessment (CRITICAL, HIGH, MEDIUM, LOW) with detailed mitigation strategies
- Breaking cyclic dependencies with event-driven architecture recommendations
- Zero-downtime migration strategies using gradual traffic shifting

This feature transforms Code Lens from a static analysis tool into a complete migration intelligence platform, providing actionable, AI-driven migration paths from legacy systems to modern cloud-native architectures.

### Enterprise AI Technology Stack
The platform integrates advanced AI and ML technologies: IBM Doclinq for PDF processing, LangChain for document handling, LangGraph for workflow orchestration, Langfuse for LLM observability, HuggingFace Models (CodeBERT, DialoGPT, transformers) for local AI, and multi-LLM support (OpenAI, Claude, Gemini, local). ChromaDB serves as the vector database, and Redis is used for performance optimization.

## External Dependencies

### Database and ORM
- **PostgreSQL**: Primary database.
- **Drizzle ORM**: Type-safe database queries.
- **Neon Database**: Serverless PostgreSQL integration.

### Frontend Libraries
- **shadcn/ui**: React component library.
- **Radix UI**: Headless UI primitives.
- **Tailwind CSS**: Utility-first CSS framework.
- **React Flow**: Interactive diagram rendering.
- **Lucide React**: Icon library.

### File Processing
- **Multer**: Express middleware for file uploads.
- **JSZip**: JavaScript library for ZIP file extraction.

### AI & Analysis Integration
- **OpenAI API**: GPT-4o integration for online AI analysis.
- **Ollama Integration**: Local LLM server support for offline analysis.
- **IBM Doclinq**: Enterprise-grade PDF processing.
- **LangChain**: AI application development framework.
- **LangGraph**: Orchestration for complex AI workflows.
- **Langfuse**: LLM observability platform.
- **HuggingFace Models**: Local AI processing models.

### Development Tools
- **Vite**: Frontend build tool.
- **TypeScript**: Static type checking.
- **ESBuild**: Fast JavaScript bundler.

### Validation and Utilities
- **Zod**: Schema validation.
- **date-fns**: Date utility library.
- **clsx**: Utility for className strings.