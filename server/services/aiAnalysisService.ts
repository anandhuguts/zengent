import { type AnalysisData } from '@shared/schema';
import OpenAI from 'openai';

interface JavaClass {
  name: string;
  package: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'component' | 'configuration' | 'other';
  annotations: string[];
  methods: JavaMethod[];
  fields: JavaField[];
  extends?: string;
  implements: string[];
}

interface JavaMethod {
  name: string;
  annotations: string[];
  parameters: string[];
  returnType: string;
}

interface JavaField {
  name: string;
  type: string;
  annotations: string[];
}

interface AIInsight {
  id: string;
  type: 'overview' | 'module_description' | 'function_description' | 'architecture_suggestion';
  title: string;
  content: string;
  confidence: number;
  tags: string[];
  relatedComponents: string[];
}

interface AIAnalysisResult {
  projectOverview: string;
  architectureInsights: string[];
  moduleInsights: Record<string, AIInsight>;
  suggestions: string[];
  qualityScore: number;
}

export class AIAnalysisService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async analyzeProject(analysisData: AnalysisData): Promise<AIAnalysisResult> {
    console.log('Starting AI analysis with OpenAI...');
    
    const moduleInsights: Record<string, AIInsight> = {};
    
    // Generate project overview
    const projectOverview = await this.generateProjectOverview(analysisData);
    
    // Analyze key modules (limit to first 5 to manage API costs)
    const keyClasses = analysisData.classes.slice(0, 5);
    for (const javaClass of keyClasses) {
      const insight = await this.analyzeModule(javaClass, analysisData);
      moduleInsights[javaClass.name] = insight;
    }
    
    // Generate architecture insights
    const architectureInsights = await this.generateArchitectureInsights(analysisData);
    
    // Generate improvement suggestions
    const suggestions = await this.generateSuggestions(analysisData);
    
    // Calculate quality score
    const qualityScore = this.calculateQualityScore(analysisData);
    
    return {
      projectOverview,
      architectureInsights,
      moduleInsights,
      suggestions,
      qualityScore
    };
  }

  private async generateProjectOverview(analysisData: AnalysisData): Promise<string> {
    const prompt = this.buildProjectOverviewPrompt(analysisData);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert Java architect analyzing project structure. Provide clear, concise insights about the project's architecture, patterns, and overall design."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return response.choices[0].message.content || this.generateRuleBasedOverview(analysisData);
    } catch (error) {
      console.error('OpenAI API error:', error);
      return this.generateRuleBasedOverview(analysisData);
    }
  }

  private async analyzeModule(javaClass: JavaClass, context: AnalysisData): Promise<AIInsight> {
    const prompt = this.buildModuleAnalysisPrompt(javaClass, context);
    
    try {
      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert Java developer analyzing individual classes. Provide specific insights about the class's role, responsibilities, and potential improvements."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 300,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || `Analysis for ${javaClass.name}`;
      
      return {
        id: `${javaClass.name}-analysis`,
        type: this.determineInsightType(javaClass),
        title: `${javaClass.name} Analysis`,
        content,
        confidence: 0.85,
        tags: this.extractTags(javaClass),
        relatedComponents: this.findRelatedComponents(javaClass, context)
      };
    } catch (error) {
      console.error('OpenAI API error for module analysis:', error);
      return this.generateRuleBasedModuleInsight(javaClass, context);
    }
  }

  private async generateArchitectureInsights(analysisData: AnalysisData): Promise<string[]> {
    try {
      const prompt = `Analyze this Java project architecture and provide 3-5 key architectural insights:

Classes breakdown:
- Controllers: ${analysisData.classes.filter(c => c.type === 'controller').length}
- Services: ${analysisData.classes.filter(c => c.type === 'service').length}
- Repositories: ${analysisData.classes.filter(c => c.type === 'repository').length}
- Entities: ${analysisData.entities.length}

Please provide specific insights about architecture patterns, design quality, and structural observations.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are an expert software architect. Provide 3-5 specific, actionable insights about the project architecture. Each insight should be a single sentence."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('OpenAI API error for architecture insights:', error);
      return this.generateRuleBasedArchitectureInsights(analysisData);
    }
  }

  private async generateSuggestions(analysisData: AnalysisData): Promise<string[]> {
    try {
      const prompt = `Review this Java project and provide 3-5 specific improvement suggestions:

Project structure:
- Total classes: ${analysisData.classes.length}
- Controllers: ${analysisData.classes.filter(c => c.type === 'controller').length}
- Services: ${analysisData.classes.filter(c => c.type === 'service').length}
- Repositories: ${analysisData.classes.filter(c => c.type === 'repository').length}
- Entities: ${analysisData.entities.length}

Provide actionable suggestions for code quality, architecture, and best practices.`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a senior Java developer providing code review feedback. Give specific, actionable suggestions for improvement."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 400,
        temperature: 0.7,
      });

      const content = response.choices[0].message.content || '';
      return content.split('\n').filter(line => line.trim().length > 0).slice(0, 5);
    } catch (error) {
      console.error('OpenAI API error for suggestions:', error);
      return this.generateRuleBasedSuggestions(analysisData);
    }
  }

  private buildProjectOverviewPrompt(analysisData: AnalysisData): string {
    const classCount = analysisData.classes.length;
    const controllerCount = analysisData.classes.filter(c => c.type === 'controller').length;
    const serviceCount = analysisData.classes.filter(c => c.type === 'service').length;
    const repositoryCount = analysisData.classes.filter(c => c.type === 'repository').length;
    const entityCount = analysisData.entities.length;
    
    return `Analyze this Java project and provide a comprehensive overview:

Project Statistics:
- Total Classes: ${classCount}
- Controllers: ${controllerCount}
- Services: ${serviceCount}
- Repositories: ${repositoryCount}
- Entities: ${entityCount}
- Relationships: ${analysisData.relationships.length}

Key Classes:
${analysisData.classes.slice(0, 5).map(c => `- ${c.name} (${c.type}): ${c.methods.length} methods`).join('\n')}

Please provide a detailed overview of the project's architecture, main patterns used, and overall design quality.`;
  }

  private buildModuleAnalysisPrompt(javaClass: JavaClass, context: AnalysisData): string {
    const relatedClasses = this.findRelatedComponents(javaClass, context);
    
    return `Analyze this Java class in detail:

Class: ${javaClass.name}
Package: ${javaClass.package}
Type: ${javaClass.type}
Annotations: ${javaClass.annotations.join(', ')}
Methods: ${javaClass.methods.length}
Fields: ${javaClass.fields.length}

Key Methods:
${javaClass.methods.slice(0, 3).map(m => `- ${m.name}(${m.parameters.join(', ')}): ${m.returnType}`).join('\n')}

Related Classes: ${relatedClasses.slice(0, 3).join(', ')}

Please provide specific insights about this class's role, responsibilities, design patterns used, and potential improvements.`;
  }

  private generateRuleBasedOverview(analysisData: AnalysisData): string {
    const controllerCount = analysisData.classes.filter(c => c.type === 'controller').length;
    const serviceCount = analysisData.classes.filter(c => c.type === 'service').length;
    const repositoryCount = analysisData.classes.filter(c => c.type === 'repository').length;
    
    const hasSpringFramework = analysisData.classes.some(c => 
      c.annotations.some(a => a.includes('Controller') || a.includes('Service') || a.includes('Repository'))
    );
    
    const hasJPA = analysisData.entities.length > 0;
    
    let overview = `This appears to be a Java application with ${analysisData.classes.length} classes. `;
    
    if (hasSpringFramework) {
      overview += `The project uses Spring Framework with ${controllerCount} controllers, ${serviceCount} services, and ${repositoryCount} repositories, following a layered architecture pattern. `;
    }
    
    if (hasJPA) {
      overview += `It includes ${analysisData.entities.length} JPA entities for data persistence. `;
    }
    
    overview += `The codebase demonstrates ${analysisData.relationships.length} inter-class relationships, indicating a well-connected system.`;
    
    return overview;
  }

  private generateRuleBasedArchitectureInsights(analysisData: AnalysisData): string[] {
    const insights: string[] = [];
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const services = analysisData.classes.filter(c => c.type === 'service');
    const repositories = analysisData.classes.filter(c => c.type === 'repository');
    
    if (controllers.length > 0 && services.length > 0 && repositories.length > 0) {
      insights.push("Well-structured Spring MVC architecture with clear separation of concerns");
    }
    
    const hasRestControllers = controllers.some(c => 
      c.annotations.some(a => a.includes('RestController'))
    );
    if (hasRestControllers) {
      insights.push("RESTful API architecture implemented with Spring REST controllers");
    }
    
    if (analysisData.entities.length > 0) {
      insights.push("Data persistence layer implemented using JPA entities");
    }
    
    if (analysisData.relationships.length > analysisData.classes.length * 1.5) {
      insights.push("High coupling detected - consider reducing inter-class dependencies");
    }
    
    return insights;
  }

  private generateRuleBasedSuggestions(analysisData: AnalysisData): string[] {
    const suggestions: string[] = [];
    
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    
    if (hasControllers && !hasServices) {
      suggestions.push("Consider adding a service layer to separate business logic from controllers");
    }
    
    if (hasServices && !hasRepositories) {
      suggestions.push("Consider adding repository layer for better data access abstraction");
    }
    
    const largeClasses = analysisData.classes.filter(c => c.methods.length > 20);
    if (largeClasses.length > 0) {
      suggestions.push(`Consider refactoring large classes: ${largeClasses.map(c => c.name).join(', ')}`);
    }
    
    return suggestions;
  }

  private generateRuleBasedModuleInsight(javaClass: JavaClass, context: AnalysisData): AIInsight {
    let content = `${javaClass.name} is a ${javaClass.type} class in the ${javaClass.package} package. `;
    
    if (javaClass.annotations.length > 0) {
      content += `It uses annotations: ${javaClass.annotations.join(', ')}. `;
    }
    
    content += `This class contains ${javaClass.methods.length} methods and ${javaClass.fields.length} fields.`;
    
    return {
      id: `${javaClass.name}-analysis`,
      type: this.determineInsightType(javaClass),
      title: `${javaClass.name} Analysis`,
      content,
      confidence: 0.7,
      tags: this.extractTags(javaClass),
      relatedComponents: this.findRelatedComponents(javaClass, context)
    };
  }

  private determineInsightType(javaClass: JavaClass): AIInsight['type'] {
    if (javaClass.type === 'controller' || javaClass.type === 'service') {
      return 'module_description';
    }
    return 'function_description';
  }

  private extractTags(javaClass: JavaClass): string[] {
    const tags: string[] = [javaClass.type];
    
    if (javaClass.annotations.some(a => a.includes('Controller'))) {
      tags.push('web-layer');
    }
    if (javaClass.annotations.some(a => a.includes('Service'))) {
      tags.push('business-logic');
    }
    if (javaClass.annotations.some(a => a.includes('Repository'))) {
      tags.push('data-access');
    }
    if (javaClass.annotations.some(a => a.includes('Entity'))) {
      tags.push('data-model');
    }
    
    return tags;
  }

  private findRelatedComponents(javaClass: JavaClass, context: AnalysisData): string[] {
    const related: string[] = [];
    
    // Find classes that this class depends on or that depend on it
    context.relationships.forEach(rel => {
      if (rel.from === javaClass.name && !related.includes(rel.to)) {
        related.push(rel.to);
      }
      if (rel.to === javaClass.name && !related.includes(rel.from)) {
        related.push(rel.from);
      }
    });
    
    return related.slice(0, 5);
  }

  private calculateQualityScore(analysisData: AnalysisData): number {
    let score = 50; // Base score
    
    // Architecture completeness
    const hasControllers = analysisData.classes.some(c => c.type === 'controller');
    const hasServices = analysisData.classes.some(c => c.type === 'service');
    const hasRepositories = analysisData.classes.some(c => c.type === 'repository');
    
    if (hasControllers && hasServices && hasRepositories) {
      score += 20; // Good layered architecture
    }
    
    // Class size distribution
    const averageMethodsPerClass = analysisData.classes.reduce((sum, c) => sum + c.methods.length, 0) / analysisData.classes.length;
    if (averageMethodsPerClass <= 15) {
      score += 15; // Reasonable class sizes
    }
    
    // Annotation usage (Spring patterns)
    const annotatedClasses = analysisData.classes.filter(c => c.annotations.length > 0).length;
    const annotationRatio = annotatedClasses / analysisData.classes.length;
    if (annotationRatio > 0.7) {
      score += 15; // Good use of annotations
    }
    
    return Math.min(100, Math.max(0, score));
  }
}

export const aiAnalysisService = new AIAnalysisService();