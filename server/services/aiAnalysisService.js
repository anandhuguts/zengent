import OpenAI from 'openai';

export class AIAnalysisService {
  constructor(config) {
    this.openai = null;
    this.modelConfig = config || {
      type: 'openai',
      openaiApiKey: process.env.OPENAI_API_KEY
    };
    
    if (this.modelConfig.type === 'openai' && this.modelConfig.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: this.modelConfig.openaiApiKey,
      });
    }
  }

  setModelConfig(config) {
    this.modelConfig = config;
    
    if (config.type === 'openai' && config.openaiApiKey) {
      this.openai = new OpenAI({
        apiKey: config.openaiApiKey,
      });
    } else {
      this.openai = null;
    }
  }

  async analyzeProject(analysisData) {
    console.log('Starting AI analysis with OpenAI...');
    
    const moduleInsights = {};
    
    // Generate comprehensive project details
    const projectDetails = await this.generateProjectDetails(analysisData);
    
    // Generate project overview
    const projectOverview = await this.generateProjectOverview(analysisData);
    
    // Analyze key modules (limit to first 5 to manage API costs)
    const keyClasses = analysisData.classes.slice(0, 5);
    for (const javaClass of keyClasses) {
      try {
        const insight = await this.analyzeClass(javaClass, analysisData);
        if (insight) {
          moduleInsights[javaClass.name] = insight;
        }
      } catch (error) {
        console.warn(`Failed to analyze class ${javaClass.name}:`, error);
      }
    }
    
    // Generate architecture insights
    const architectureInsights = await this.generateArchitectureInsights(analysisData);
    
    // Generate suggestions
    const suggestions = await this.generateSuggestions(analysisData);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(analysisData);
    
    return {
      projectOverview,
      projectDetails,
      architectureInsights,
      moduleInsights,
      suggestions,
      qualityScore
    };
  }

  async generateProjectDetails(analysisData) {
    if (!this.openai) {
      return this.generateFallbackProjectDetails(analysisData);
    }

    try {
      const prompt = `Analyze this Java project and provide comprehensive project details in JSON format:

Classes: ${JSON.stringify(analysisData.classes.slice(0, 10), null, 2)}
Patterns: ${JSON.stringify(analysisData.patterns, null, 2)}

Please provide a JSON response with:
- projectDescription: A detailed description of what this application does
- businessProblem: What business problem this application solves
- keyObjective: The main objective of the application
- functionalitySummary: Summary of key functionalities
- implementedFeatures: Array of implemented features
- modulesServices: Array of main modules/services`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert Java architect. Analyze the project structure and provide detailed insights in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 1000
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        projectDescription: result.projectDescription || "Enterprise Java application",
        businessProblem: result.businessProblem || "Business process automation",
        keyObjective: result.keyObjective || "Provide efficient business operations",
        functionalitySummary: result.functionalitySummary || "Core business functionality implementation",
        implementedFeatures: result.implementedFeatures || ["REST API", "Data Management"],
        modulesServices: result.modulesServices || ["Core Service Layer"]
      };

    } catch (error) {
      console.error('Error generating project details:', error);
      return this.generateFallbackProjectDetails(analysisData);
    }
  }

  async generateProjectOverview(analysisData) {
    if (!this.openai) {
      return this.generateFallbackOverview(analysisData);
    }

    try {
      const prompt = `Provide a comprehensive overview of this Java project based on its architecture:

Classes (${analysisData.classes.length}): ${analysisData.classes.map(c => `${c.name} (${c.type})`).slice(0, 10).join(', ')}
Patterns: ${analysisData.patterns.map(p => p.name).join(', ')}
Packages: ${analysisData.structure.packages.slice(0, 5).join(', ')}

Write a detailed paragraph describing this application's architecture, purpose, and technical approach.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system", 
            content: "You are an expert software architect. Provide clear, professional project analysis."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500
      });

      return response.choices[0].message.content;

    } catch (error) {
      console.error('Error generating project overview:', error);
      return this.generateFallbackOverview(analysisData);
    }
  }

  async analyzeClass(javaClass, analysisData) {
    if (!this.openai) {
      return this.generateFallbackClassAnalysis(javaClass);
    }

    try {
      const prompt = `Analyze this Java class and provide insights:

Class: ${javaClass.name}
Type: ${javaClass.type}
Package: ${javaClass.package}
Annotations: ${javaClass.annotations.join(', ')}
Methods: ${javaClass.methods.map(m => m.name).join(', ')}
Fields: ${javaClass.fields.map(f => f.name).join(', ')}

Provide a JSON response with:
- title: Brief descriptive title for this class
- content: Detailed analysis of the class purpose and functionality
- confidence: Confidence score (0-1)
- tags: Array of relevant tags
- relatedComponents: Array of related component names`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert Java developer. Analyze class structure and provide insights in valid JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 400
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      return {
        id: `insight_${javaClass.name.toLowerCase()}`,
        type: 'module_description',
        title: result.title || `${javaClass.name} Analysis`,
        content: result.content || `Analysis of ${javaClass.name} ${javaClass.type}`,
        confidence: result.confidence || 0.8,
        tags: result.tags || [javaClass.type],
        relatedComponents: result.relatedComponents || []
      };

    } catch (error) {
      console.error(`Error analyzing class ${javaClass.name}:`, error);
      return this.generateFallbackClassAnalysis(javaClass);
    }
  }

  async generateArchitectureInsights(analysisData) {
    if (!this.openai) {
      return this.generateFallbackArchitectureInsights(analysisData);
    }

    try {
      const prompt = `Analyze this Java application architecture and provide insights:

Controllers: ${analysisData.classes.filter(c => c.type === 'controller').length}
Services: ${analysisData.classes.filter(c => c.type === 'service').length}
Repositories: ${analysisData.classes.filter(c => c.type === 'repository').length}
Entities: ${analysisData.classes.filter(c => c.type === 'entity').length}

Patterns Found: ${analysisData.patterns.map(p => p.name).join(', ')}

Provide 3-5 key architectural insights as a JSON array of strings.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert software architect. Provide concise architectural insights in JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 400
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.insights || result.architectureInsights || this.generateFallbackArchitectureInsights(analysisData);

    } catch (error) {
      console.error('Error generating architecture insights:', error);
      return this.generateFallbackArchitectureInsights(analysisData);
    }
  }

  async generateSuggestions(analysisData) {
    if (!this.openai) {
      return this.generateFallbackSuggestions(analysisData);
    }

    try {
      const prompt = `Based on this Java application analysis, provide improvement suggestions:

Architecture: ${analysisData.classes.length} classes, ${analysisData.patterns.length} patterns
Structure: ${analysisData.structure.packages.length} packages

Provide 3-5 specific suggestions for improvement as a JSON array of strings.`;

      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are an expert software architect. Provide actionable improvement suggestions in JSON array format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" },
        max_tokens: 400
      });

      const result = JSON.parse(response.choices[0].message.content);
      return result.suggestions || this.generateFallbackSuggestions(analysisData);

    } catch (error) {
      console.error('Error generating suggestions:', error);
      return this.generateFallbackSuggestions(analysisData);
    }
  }

  calculateQualityScore(analysisData) {
    let score = 70; // Base score
    
    // Add points for good architecture
    if (analysisData.classes.some(c => c.type === 'controller')) score += 5;
    if (analysisData.classes.some(c => c.type === 'service')) score += 5;
    if (analysisData.classes.some(c => c.type === 'repository')) score += 5;
    if (analysisData.classes.some(c => c.type === 'entity')) score += 5;
    
    // Add points for patterns
    score += Math.min(analysisData.patterns.length * 2, 10);
    
    return Math.min(score, 100);
  }

  // Fallback methods for when AI is not available
  generateFallbackProjectDetails(analysisData) {
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    const entities = analysisData.classes.filter(c => c.type === 'entity');

    return {
      projectDescription: `Enterprise Java application with ${analysisData.classes.length} classes implementing ${analysisData.patterns.length} design patterns`,
      businessProblem: "Business process automation and data management",
      keyObjective: "Provide efficient and scalable business operations",
      functionalitySummary: "Core business functionality with REST APIs and data persistence",
      implementedFeatures: [
        controllers.length > 0 ? "REST API Layer" : null,
        services.length > 0 ? "Business Logic Layer" : null,
        entities.length > 0 ? "Data Model" : null,
        "Enterprise Architecture"
      ].filter(Boolean),
      modulesServices: [
        ...controllers.map(c => `${c.name} API`),
        ...services.map(s => `${s.name} Service`),
        "Core Business Logic"
      ].slice(0, 5)
    };
  }

  generateFallbackOverview(analysisData) {
    const typesCounts = analysisData.classes.reduce((acc, c) => {
      acc[c.type] = (acc[c.type] || 0) + 1;
      return acc;
    }, {});

    return `This Java application follows enterprise architecture patterns with ${analysisData.classes.length} classes distributed across ${analysisData.structure.packages.length} packages. The application implements ${Object.keys(typesCounts).join(', ')} layers with ${analysisData.patterns.length} design patterns including ${analysisData.patterns.map(p => p.name).slice(0, 3).join(', ')}. The architecture demonstrates separation of concerns and follows industry best practices for maintainable enterprise applications.`;
  }

  generateFallbackClassAnalysis(javaClass) {
    return {
      id: `insight_${javaClass.name.toLowerCase()}`,
      type: 'module_description',
      title: `${javaClass.name} - ${javaClass.type.charAt(0).toUpperCase() + javaClass.type.slice(1)}`,
      content: `${javaClass.name} is a ${javaClass.type} class with ${javaClass.methods.length} methods and ${javaClass.fields.length} fields. It uses annotations: ${javaClass.annotations.join(', ')}. This component handles ${javaClass.type}-specific functionality within the application architecture.`,
      confidence: 0.7,
      tags: [javaClass.type, 'enterprise'],
      relatedComponents: []
    };
  }

  generateFallbackArchitectureInsights(analysisData) {
    return [
      `Application contains ${analysisData.classes.length} classes following enterprise patterns`,
      `Implements ${analysisData.patterns.length} design patterns for maintainability`,
      `Organized into ${analysisData.structure.packages.length} packages for separation of concerns`,
      "Follows layered architecture with clear separation of responsibilities",
      "Uses annotation-based configuration for framework integration"
    ];
  }

  generateFallbackSuggestions(analysisData) {
    return [
      "Consider implementing comprehensive unit tests for all service classes",
      "Add proper exception handling and error responses",
      "Implement caching strategies for frequently accessed data",
      "Consider adding API documentation with OpenAPI/Swagger",
      "Implement proper logging and monitoring throughout the application"
    ];
  }
}

export const aiAnalysisService = new AIAnalysisService();