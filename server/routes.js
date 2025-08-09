import { createServer } from "http";
import { storage } from "./storage.js";
import { insertProjectSchema, githubProjectSchema } from "../shared/schema.js";
import { analyzeJavaProject } from "./services/javaAnalyzer.js";
import { analyzeGithubRepository, isValidGithubUrl } from "./services/githubService.js";
import { aiAnalysisService } from "./services/aiAnalysisService.js";
import { sonarAnalyzer } from "./services/sonarAnalyzer.js";
import { swaggerGenerator } from "./services/swaggerGenerator.js";
import { projectStructureAnalyzer } from "./services/projectStructureAnalyzer.js";
import swaggerUi from "swagger-ui-express";
import multer from "multer";
import { z } from "zod";

const aiModelConfigSchema = z.object({
  type: z.enum(['openai', 'local']),
  openaiApiKey: z.string().optional(),
  localEndpoint: z.string().optional(),
  modelName: z.string().optional(),
});

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const isZip = file.mimetype === 'application/zip' || 
                  file.originalname.endsWith('.zip') ||
                  file.mimetype === 'application/x-zip-compressed';
    
    if (isZip) {
      cb(null, true);
    } else {
      cb(new Error('Only ZIP files are allowed'));
    }
  }
});

export async function registerRoutes(app) {
  
  // Get all projects
  app.get("/api/projects", async (req, res) => {
    try {
      const projects = await storage.listProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Failed to fetch projects" });
    }
  });

  // Get a specific project
  app.get("/api/projects/:id", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      console.error("Error fetching project:", error);
      res.status(500).json({ message: "Failed to fetch project" });
    }
  });

  // Upload and analyze Java project
  app.post("/api/projects/upload", upload.single('zipFile'), async (req, res) => {
    try {
      console.log('Upload request received:', {
        file: req.file ? req.file.originalname : 'No file',
        size: req.file ? req.file.size : 'N/A',
        mimetype: req.file ? req.file.mimetype : 'N/A'
      });
      
      if (!req.file) {
        return res.status(400).json({ message: "No ZIP file provided" });
      }

      const { originalname, buffer } = req.file;
      
      // Create project record
      const projectData = {
        name: originalname.replace('.zip', ''),
        originalFileName: originalname,
        status: 'processing',
        analysisData: null,
        fileCount: 0,
        controllerCount: 0,
        serviceCount: 0,
        repositoryCount: 0,
        entityCount: 0,
      };

      const validatedData = insertProjectSchema.parse(projectData);
      const project = await storage.createProject(validatedData);

      // Start analysis in background
      analyzeJavaProject(project.id, buffer).catch((error) => {
        console.error(`Analysis failed for project ${project.id}:`, error);
        storage.updateProject(project.id, { 
          status: 'failed',
        });
      });

      res.json(project);
    } catch (error) {
      console.error("Error uploading project:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      
      if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: "File size too large. Maximum allowed size is 50MB." 
          });
        }
      }
      
      res.status(500).json({ message: "Failed to upload project" });
    }
  });

  // GitHub repository analysis
  app.post("/api/projects/github", async (req, res) => {
    try {
      console.log('GitHub analysis request received:', req.body);
      
      const validatedData = githubProjectSchema.parse(req.body);
      
      if (!isValidGithubUrl(validatedData.githubUrl)) {
        return res.status(400).json({ 
          message: "Invalid GitHub URL format" 
        });
      }

      const projectId = await analyzeGithubRepository(validatedData);
      const project = await storage.getProject(projectId);
      
      res.json(project);
    } catch (error) {
      console.error("Error analyzing GitHub repository:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid GitHub data", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to analyze GitHub repository" });
    }
  });

  // AI Model configuration
  app.post("/api/ai/configure", async (req, res) => {
    try {
      const validatedConfig = aiModelConfigSchema.parse(req.body);
      
      // Configure the AI analysis service
      aiAnalysisService.setModelConfig(validatedConfig);
      
      res.json({ 
        message: "AI model configuration updated successfully",
        config: {
          type: validatedConfig.type,
          modelName: validatedConfig.modelName
        }
      });
    } catch (error) {
      console.error("Error configuring AI model:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid AI configuration", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to configure AI model" });
    }
  });

  // SonarQube analysis endpoint
  app.get("/api/projects/:id/sonar", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.analysisData) {
        return res.status(400).json({ message: "Project analysis data not available" });
      }

      const sonarResults = await sonarAnalyzer.analyzeProject(project.analysisData);
      res.json(sonarResults);
    } catch (error) {
      console.error("Error performing SonarQube analysis:", error);
      res.status(500).json({ message: "Failed to perform SonarQube analysis" });
    }
  });

  // Swagger documentation generation
  app.get("/api/projects/:id/swagger", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.analysisData) {
        return res.status(400).json({ message: "Project analysis data not available" });
      }

      const swaggerSpec = await swaggerGenerator.generateSwaggerSpec(project.analysisData);
      res.json(swaggerSpec);
    } catch (error) {
      console.error("Error generating Swagger documentation:", error);
      res.status(500).json({ message: "Failed to generate Swagger documentation" });
    }
  });

  // Project structure analysis
  app.get("/api/projects/:id/structure", async (req, res) => {
    try {
      const project = await storage.getProject(req.params.id);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (!project.analysisData) {
        return res.status(400).json({ message: "Project analysis data not available" });
      }

      const structureAnalysis = await projectStructureAnalyzer.analyzeProject(project.analysisData);
      res.json(structureAnalysis);
    } catch (error) {
      console.error("Error analyzing project structure:", error);
      res.status(500).json({ message: "Failed to analyze project structure" });
    }
  });

  // Swagger UI endpoint
  const swaggerSpec = {
    openapi: '3.0.0',
    info: {
      title: 'Zengent AI Analysis API',
      version: '1.0.0',
      description: 'Enterprise Application Intelligence Platform API'
    },
    paths: {
      '/api/projects': {
        get: {
          summary: 'List all projects',
          responses: {
            '200': {
              description: 'List of projects',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { type: 'object' }
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Helper function to extract business domain from class names
  function extractBusinessDomain(analysisData) {
    if (!analysisData || !analysisData.classes) {
      return 'application';
    }

    // Collect class names for domain analysis
    const classNames = analysisData.classes.map(c => c.name);
    
    // Common business domain keywords
    const domainKeywords = ['User', 'Customer', 'Product', 'Order', 'Payment', 'Booking', 'Task', 'Project', 'Account'];
    
    for (const keyword of domainKeywords) {
      if (classNames.some(name => name.includes(keyword))) {
        return keyword.toLowerCase();
      }
    }
    
    // Fallback: use most common package name (excluding framework packages)
    const packages = analysisData.classes
      .map(c => c.package)
      .filter(pkg => !pkg.includes('springframework') && !pkg.includes('hibernate'))
      .map(pkg => pkg.split('.').pop())
      .filter(Boolean);
    
    if (packages.length > 0) {
      // Find most common package suffix
      const packageCounts = packages.reduce((acc, pkg) => {
        acc[pkg] = (acc[pkg] || 0) + 1;
        return acc;
      }, {});
      
      const mostCommon = Object.keys(packageCounts).reduce((a, b) => 
        packageCounts[a] > packageCounts[b] ? a : b
      );
      
      return mostCommon;
    }
    
    return 'application';
  }

  function getDomainFromClassName(className) {
    // Remove common suffixes and prefixes
    let domain = className
      .replace(/^.*\./, '') // Remove package
      .replace(/Controller$/, '')
      .replace(/Service$/, '')
      .replace(/Repository$/, '')
      .replace(/Entity$/, '')
      .replace(/Impl$/, '');
    
    // Convert from PascalCase to readable format
    domain = domain.replace(/([A-Z])/g, ' $1').trim().toLowerCase();
    
    return domain || 'application';
  }

  const server = createServer(app);
  return server;
}