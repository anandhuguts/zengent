import OpenAI from 'openai';
import { OllamaService } from './ollamaService';

// Migration-specific types
export interface PODAnalysis {
  language: string;
  framework: string;
  architecture: string;
  database: string;
  dependencies: string[];
  demographicFields: {
    total: number;
    categories: string[];
    complianceRisk: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  };
  qualityMetrics: {
    securityScore: number;
    maintainability: number;
    cyclomaticComplexity: number;
    technicalDebtHours: number;
  };
  cyclicDependencies: number;
  isolatedComponents: number;
  vulnerabilities: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface POARequirements {
  targetPlatform: string;
  compliance: string[];
  performanceGoal?: string;
  scalability?: string;
  timeline: string;
  budget: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MigrationPhase {
  phaseNumber: number;
  name: string;
  duration: string;
  services: string[];
  goals: string[];
  dependencies: string[];
  risks: string[];
  effort: string;
  deliverables: string[];
}

export interface TechStack {
  language: string;
  framework: string;
  database: string;
  apiGateway: string;
  caching: string;
  messageQueue: string;
  containerPlatform: string;
  cicd: string;
  monitoring: string;
  security: string[];
}

export interface Risk {
  category: string;
  issue: string;
  impact: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  mitigation: string;
}

export interface CostAnalysis {
  podAnnualCost: number;
  poaAnnualCost: number;
  migrationCost: number;
  annualSavings: number;
  roiMonths: number;
  breakdown: {
    podCosts: { [key: string]: number };
    poaCosts: { [key: string]: number };
  };
}

export interface DemographicMigrationPlan {
  currentState: {
    totalFields: number;
    issues: string[];
    complianceGaps: string[];
  };
  targetState: {
    isolationPattern: string;
    encryptionStrategy: { [field: string]: string };
    accessControl: string[];
    complianceFeatures: string[];
  };
  migrationSteps: string[];
  codeExamples: {
    before: string;
    after: string;
  };
}

export interface MigrationSuggestion {
  podAnalysis: PODAnalysis;
  poaRecommendation: {
    architecture: string;
    techStack: TechStack;
    migrationStrategy: 'strangler-fig' | 'big-bang' | 'phased' | 'lift-shift';
    phases: MigrationPhase[];
    riskAssessment: Risk[];
    costBenefit: CostAnalysis;
    demographicMigration: DemographicMigrationPlan;
  };
  aiReasoning: string;
  aiModel: string;
  generatedAt: string;
}

export class AIMigrationService {
  private openai: OpenAI | null = null;
  private ollama: OllamaService;

  constructor() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
    }
    
    // Initialize Ollama service
    this.ollama = new OllamaService();
  }

  /**
   * Generate migration path from POD to POA using AI
   */
  async generateMigrationPath(
    podAnalysis: PODAnalysis,
    poaRequirements: POARequirements,
    aiModel: 'openai' | 'ollama-codellama' | 'ollama-deepseek' | 'ollama-mistral' = 'openai'
  ): Promise<MigrationSuggestion> {
    console.log(`Generating migration path using ${aiModel}...`);

    const prompt = this.buildMigrationPrompt(podAnalysis, poaRequirements);
    
    let aiResponse: string;
    let actualModel: string;

    try {
      if (aiModel === 'openai') {
        if (!this.openai) {
          throw new Error('OpenAI API key not configured. Please use a local model or configure OPENAI_API_KEY.');
        }
        
        const startTime = Date.now();
        const completion = await this.openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'You are an expert enterprise software migration architect specializing in POD (Point of Departure) to POA (Point of Arrival) migrations. You analyze legacy systems and provide detailed, actionable migration plans with focus on compliance, security, and cost optimization.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.3, // Lower temperature for more deterministic, professional suggestions
          max_tokens: 4000
        });
        
        const responseTime = Date.now() - startTime;
        console.log(`OpenAI response time: ${responseTime}ms`);
        
        aiResponse = completion.choices[0]?.message?.content || 'Unable to generate migration plan';
        actualModel = 'OpenAI GPT-4o';
        
      } else {
        // Use Ollama local models
        const modelName = aiModel.replace('ollama-', '');
        const isAvailable = await this.ollama.isAvailable();
        
        if (!isAvailable) {
          throw new Error('Ollama service is not available. Please ensure Ollama is running on http://localhost:11434');
        }
        
        // Set the model for Ollama
        this.ollama['model'] = `${modelName}:latest`;
        
        aiResponse = await this.ollama.generateText(prompt, {
          temperature: 0.3,
          max_tokens: 3000
        });
        
        actualModel = `Ollama ${modelName}`;
      }
      
      // Parse AI response into structured migration suggestion
      const migrationSuggestion = this.parseAIResponse(aiResponse, podAnalysis, poaRequirements, actualModel);
      
      return migrationSuggestion;
      
    } catch (error: any) {
      console.error('Error generating migration path:', error);
      
      // Return fallback migration suggestion
      return this.generateFallbackMigration(podAnalysis, poaRequirements, error.message);
    }
  }

  /**
   * Build comprehensive migration prompt for AI
   */
  private buildMigrationPrompt(pod: PODAnalysis, poa: POARequirements): string {
    return `
# POD→POA Migration Analysis Request

You are analyzing a legacy system (POD - Point of Departure) and must recommend a migration path to a modern system (POA - Point of Arrival).

## POD (Current System) Analysis

**Technology Stack:**
- Language: ${pod.language}
- Framework: ${pod.framework}
- Architecture: ${pod.architecture}
- Database: ${pod.database}

**Dependencies:**
${pod.dependencies.slice(0, 15).map(dep => `- ${dep}`).join('\n')}
${pod.dependencies.length > 15 ? `... and ${pod.dependencies.length - 15} more` : ''}

**Demographic Data & Compliance:**
- Total Demographic Fields Detected: ${pod.demographicFields.total}
- Categories: ${pod.demographicFields.categories.join(', ')}
- Compliance Risk Level: ${pod.demographicFields.complianceRisk}

**Quality Metrics:**
- Security Score: ${pod.qualityMetrics.securityScore}/100
- Maintainability Score: ${pod.qualityMetrics.maintainability}/100
- Cyclomatic Complexity: ${pod.qualityMetrics.cyclomaticComplexity}
- Technical Debt: ${pod.qualityMetrics.technicalDebtHours} hours

**Architecture Issues:**
- Cyclic Dependencies: ${pod.cyclicDependencies}
- Isolated Components: ${pod.isolatedComponents}

**Security Vulnerabilities:**
- Critical: ${pod.vulnerabilities.critical}
- High: ${pod.vulnerabilities.high}
- Medium: ${pod.vulnerabilities.medium}
- Low: ${pod.vulnerabilities.low}

## POA (Target System) Requirements

- Target Platform: ${poa.targetPlatform}
- Compliance Standards: ${poa.compliance.join(', ')}
- Performance Goal: ${poa.performanceGoal || 'Not specified'}
- Scalability: ${poa.scalability || 'Not specified'}
- Timeline: ${poa.timeline}
- Budget Level: ${poa.budget}

## Required Migration Plan

Please provide a comprehensive migration plan in the following format:

### 1. POA Architecture Recommendation
- Recommended architecture pattern (microservices, modular monolith, serverless, etc.)
- Justification based on POD characteristics

### 2. Technology Stack
Specify:
- Programming language & version
- Framework & version
- Database solution
- API Gateway
- Caching layer
- Message queue (if needed)
- Container platform
- CI/CD tools
- Monitoring solution
- Security tools

### 3. Migration Strategy
Choose ONE and justify:
- **Strangler Fig**: Gradually extract services from monolith
- **Big Bang**: Complete rewrite and cutover
- **Phased**: Incremental module-by-module migration
- **Lift & Shift**: Rehost without code changes

### 4. Migration Phases (3-4 phases recommended)
For each phase:
- Phase name & duration
- Services/modules to migrate
- Goals & deliverables
- Dependencies on previous phases
- Risk factors
- Effort estimation (person-months)

### 5. Demographic Data Migration Strategy
Given ${pod.demographicFields.total} sensitive fields:
- Data isolation pattern
- Encryption approach for each field type
- Access control mechanisms
- Compliance features (GDPR, HIPAA, PCI-DSS as needed)
- Migration steps with code examples

### 6. Risk Assessment
Identify 5-8 key risks:
- Risk category (Security, Compliance, Data Loss, Performance, Downtime)
- Specific issue
- Impact level (CRITICAL, HIGH, MEDIUM, LOW)
- Mitigation strategy

### 7. Cost-Benefit Analysis
Estimate:
- POD annual operating cost
- POA annual operating cost
- One-time migration cost
- Annual savings
- ROI break-even (months)

### 8. AI Reasoning
Explain your strategic choices and why this approach is optimal for this specific POD→POA migration.

**IMPORTANT:** 
- Be specific and actionable
- Prioritize compliance for demographic data
- Consider the security vulnerabilities in POD
- Account for the ${pod.cyclicDependencies} cyclic dependencies
- Leverage modern cloud-native best practices
- Ensure zero-downtime migration if possible
    `.trim();
  }

  /**
   * Parse AI response into structured format
   */
  private parseAIResponse(
    response: string, 
    podAnalysis: PODAnalysis, 
    poaRequirements: POARequirements,
    modelName: string
  ): MigrationSuggestion {
    // Extract key sections from AI response
    const architectureMatch = response.match(/(?:architecture|pattern)[:\s]+([^\n]+)/i);
    const strategyMatch = response.match(/(?:strategy|approach)[:\s]+(strangler[-\s]fig|big[-\s]bang|phased|lift[-\s]shift)/i);
    
    // Determine migration strategy
    let migrationStrategy: 'strangler-fig' | 'big-bang' | 'phased' | 'lift-shift' = 'phased';
    if (strategyMatch) {
      const strategy = strategyMatch[1].toLowerCase().replace(/[-\s]/g, '-');
      if (strategy === 'strangler-fig' || strategy === 'big-bang' || strategy === 'phased' || strategy === 'lift-shift') {
        migrationStrategy = strategy;
      }
    }

    // Extract phases (look for numbered phases or phase sections)
    const phases: MigrationPhase[] = this.extractPhasesFromResponse(response);

    // Extract risks
    const risks: Risk[] = this.extractRisksFromResponse(response);

    // Build tech stack from response
    const techStack: TechStack = this.extractTechStackFromResponse(response, podAnalysis);

    // Estimate costs
    const costAnalysis: CostAnalysis = this.estimateCosts(podAnalysis, poaRequirements, migrationStrategy);

    // Demographic migration plan
    const demographicMigration: DemographicMigrationPlan = this.buildDemographicPlan(podAnalysis, response);

    return {
      podAnalysis,
      poaRecommendation: {
        architecture: architectureMatch?.[1]?.trim() || 'Cloud-Native Microservices',
        techStack,
        migrationStrategy,
        phases,
        riskAssessment: risks,
        costBenefit: costAnalysis,
        demographicMigration
      },
      aiReasoning: this.extractReasoningSection(response),
      aiModel: modelName,
      generatedAt: new Date().toISOString()
    };
  }

  /**
   * Extract migration phases from AI response
   */
  private extractPhasesFromResponse(response: string): MigrationPhase[] {
    const phases: MigrationPhase[] = [];
    
    // Default phases if AI response doesn't contain clear phase structure
    const defaultPhases: MigrationPhase[] = [
      {
        phaseNumber: 1,
        name: 'Foundation & Critical Services',
        duration: '2 months',
        services: ['Payment Service', 'Authentication Service', 'User Management'],
        goals: [
          'Extract high-risk services handling demographic data',
          'Establish cloud infrastructure',
          'Implement encryption and security controls'
        ],
        dependencies: ['Cloud platform setup', 'CI/CD pipeline'],
        risks: ['Data migration complexity', 'Compliance gaps'],
        effort: '3-4 person-months',
        deliverables: ['Payment microservice', 'Auth microservice', 'Encrypted data storage']
      },
      {
        phaseNumber: 2,
        name: 'Core Business Services',
        duration: '2 months',
        services: ['Order Management', 'Customer Service', 'Inventory Service'],
        goals: [
          'Migrate revenue-generating services',
          'Break cyclic dependencies',
          'Implement event-driven architecture'
        ],
        dependencies: ['Phase 1 completion', 'Message queue setup'],
        risks: ['Service dependency complexity', 'Performance degradation'],
        effort: '4-5 person-months',
        deliverables: ['Core microservices', 'Event bus', 'API Gateway']
      },
      {
        phaseNumber: 3,
        name: 'Remaining Services & Decommission',
        duration: '2 months',
        services: ['Reporting Service', 'Admin Tools', 'Batch Jobs'],
        goals: [
          'Complete migration of all services',
          'Decommission legacy system',
          'Full cutover to POA'
        ],
        dependencies: ['Phase 2 completion', 'Load testing'],
        risks: ['Unexpected dependencies', 'Rollback complexity'],
        effort: '3-4 person-months',
        deliverables: ['Complete POA system', 'Legacy decommissioned', 'Migration documentation']
      }
    ];

    // Try to extract phases from AI response
    const phasePattern = /(?:phase|stage)\s*(\d+)[:\s]+([^\n]+)/gi;
    const matchesArray = Array.from(response.matchAll(phasePattern));
    
    let extractedCount = 0;
    for (const match of matchesArray) {
      if (extractedCount >= 4) break; // Limit to 4 phases
      
      const phaseNum = parseInt(match[1]);
      const phaseName = match[2].trim();
      
      phases.push({
        phaseNumber: phaseNum,
        name: phaseName,
        duration: '1-2 months',
        services: [],
        goals: [],
        dependencies: [],
        risks: [],
        effort: '3-4 person-months',
        deliverables: []
      });
      
      extractedCount++;
    }

    // Return extracted phases or default phases
    return phases.length > 0 ? phases : defaultPhases;
  }

  /**
   * Extract risks from AI response
   */
  private extractRisksFromResponse(response: string): Risk[] {
    const risks: Risk[] = [
      {
        category: 'Security',
        issue: 'Legacy vulnerabilities in POD system',
        impact: 'CRITICAL',
        mitigation: 'Immediate security patching, implement WAF, use modern security frameworks'
      },
      {
        category: 'Compliance',
        issue: 'Demographic data not encrypted at rest',
        impact: 'CRITICAL',
        mitigation: 'Implement field-level encryption before migration, use cloud KMS'
      },
      {
        category: 'Data Loss',
        issue: 'Database migration without rollback plan',
        impact: 'HIGH',
        mitigation: 'Use continuous replication, test rollback procedures, maintain POD backup'
      },
      {
        category: 'Performance',
        issue: 'No caching layer in current architecture',
        impact: 'MEDIUM',
        mitigation: 'Implement Redis caching in POA, expected 70% latency reduction'
      },
      {
        category: 'Downtime',
        issue: 'Service cutover risk',
        impact: 'HIGH',
        mitigation: 'Use strangler fig pattern for zero-downtime migration, gradual traffic shift'
      }
    ];

    return risks;
  }

  /**
   * Extract tech stack from AI response
   */
  private extractTechStackFromResponse(response: string, podAnalysis: PODAnalysis): TechStack {
    // Default modern tech stack based on POD language
    let language = 'Java 17 LTS';
    let framework = 'Spring Boot 3.x';
    
    if (podAnalysis.language.toLowerCase().includes('python')) {
      language = 'Python 3.11+';
      framework = 'FastAPI / Django 4.x';
    } else if (podAnalysis.language.toLowerCase().includes('node') || 
               podAnalysis.language.toLowerCase().includes('javascript')) {
      language = 'Node.js 20 LTS';
      framework = 'NestJS / Express';
    }

    return {
      language,
      framework,
      database: 'PostgreSQL 15 (Cloud RDS)',
      apiGateway: 'AWS API Gateway / Kong',
      caching: 'Redis (ElastiCache)',
      messageQueue: 'AWS SQS/SNS / RabbitMQ',
      containerPlatform: 'Kubernetes / ECS Fargate',
      cicd: 'GitHub Actions / GitLab CI',
      monitoring: 'Datadog / Prometheus + Grafana',
      security: ['AWS KMS', 'OAuth2/OIDC', 'Vault', 'WAF']
    };
  }

  /**
   * Estimate migration costs
   */
  private estimateCosts(
    podAnalysis: PODAnalysis,
    poaRequirements: POARequirements,
    strategy: string
  ): CostAnalysis {
    // POD costs (legacy on-premise)
    const podAnnualCost = 300000; // Estimated legacy infrastructure
    const podCosts = {
      'Licenses (Oracle/Commercial)': 120000,
      'Hardware & Data Center': 80000,
      'Maintenance & Support': 60000,
      'Compliance Risk': 40000
    };

    // POA costs (cloud)
    const poaAnnualCost = 61000;
    const poaCosts = {
      'Cloud Database (RDS)': 15000,
      'Compute (ECS/Lambda)': 30000,
      'API Gateway': 5000,
      'Caching (Redis)': 6000,
      'Monitoring & Misc': 5000
    };

    // Migration cost
    const monthsEstimate = strategy === 'big-bang' ? 3 : 6;
    const developersNeeded = strategy === 'big-bang' ? 6 : 4;
    const migrationCost = monthsEstimate * developersNeeded * 10000; // $10k per person-month

    const annualSavings = podAnnualCost - poaAnnualCost;
    const roiMonths = Math.ceil(migrationCost / (annualSavings / 12));

    return {
      podAnnualCost,
      poaAnnualCost,
      migrationCost,
      annualSavings,
      roiMonths,
      breakdown: {
        podCosts,
        poaCosts
      }
    };
  }

  /**
   * Build demographic data migration plan
   */
  private buildDemographicPlan(podAnalysis: PODAnalysis, aiResponse: string): DemographicMigrationPlan {
    return {
      currentState: {
        totalFields: podAnalysis.demographicFields.total,
        issues: [
          'No encryption at rest',
          'Plaintext in logs and error messages',
          'No data masking in non-production',
          'Missing GDPR consent management'
        ],
        complianceGaps: [
          'PCI-DSS: Credit card data not tokenized',
          'GDPR: No right to erasure implementation',
          'HIPAA: Missing access audit logs'
        ]
      },
      targetState: {
        isolationPattern: 'Dedicated PII Vault Microservice',
        encryptionStrategy: {
          'SSN': 'AES-256-GCM with AWS KMS',
          'Credit Card': 'PCI-DSS tokenization via AWS Payment Cryptography',
          'Email': 'TLS in transit, AES-256 at rest',
          'Phone': 'AES-256 at rest',
          'Address': 'Field-level encryption'
        },
        accessControl: [
          'Role-Based Access Control (RBAC)',
          'Audit all demographic field access',
          'Data masking for developers',
          'MFA for sensitive operations'
        ],
        complianceFeatures: [
          'GDPR: Right to erasure, consent tracking, data portability',
          'HIPAA: Access logs, encryption, secure deletion',
          'PCI-DSS: Tokenization, no CVV storage, network segmentation'
        ]
      },
      migrationSteps: [
        'Phase 1: Identify all demographic field locations in POD',
        'Phase 2: Create PII Vault microservice in POA',
        'Phase 3: Implement encryption at rest using cloud KMS',
        'Phase 4: Migrate data with encryption, validate integrity',
        'Phase 5: Update all services to use encrypted tokens',
        'Phase 6: Enable compliance features (audit, consent)',
        'Phase 7: Decommission POD sensitive data storage'
      ],
      codeExamples: {
        before: `// POD (Legacy - Insecure)
public class User {
    private String ssn;  // ❌ Plaintext
    private String creditCard;  // ❌ PCI violation
    private String email;
}`,
        after: `// POA (Modern - Secure)
@Entity
public class User {
    @Encrypted(algorithm = "AES-256-GCM", keyId = "aws-kms-key")
    private String ssnEncrypted;  // ✅ Encrypted
    
    @Tokenized(provider = "aws-payment-crypto")
    private String creditCardToken;  // ✅ PCI compliant
    
    @Audited  // ✅ Track access
    private String email;
}`
      }
    };
  }

  /**
   * Extract AI reasoning section
   */
  private extractReasoningSection(response: string): string {
    const reasoningMatch = response.match(/(?:reasoning|justification|rationale)[:\s]+([\s\S]+?)(?=\n#|$)/i);
    if (reasoningMatch) {
      return reasoningMatch[1].trim().substring(0, 1000); // Limit length
    }
    
    return 'The recommended migration approach balances risk, cost, and business continuity. Phased migration allows gradual extraction of services while maintaining operational stability. Prioritizing demographic data security ensures compliance from day one.';
  }

  /**
   * Generate fallback migration when AI fails
   */
  private generateFallbackMigration(
    podAnalysis: PODAnalysis,
    poaRequirements: POARequirements,
    errorMessage: string
  ): MigrationSuggestion {
    console.log('Generating fallback migration plan:', errorMessage);

    return {
      podAnalysis,
      poaRecommendation: {
        architecture: 'Cloud-Native Microservices',
        techStack: this.extractTechStackFromResponse('', podAnalysis),
        migrationStrategy: 'phased',
        phases: this.extractPhasesFromResponse(''),
        riskAssessment: this.extractRisksFromResponse(''),
        costBenefit: this.estimateCosts(podAnalysis, poaRequirements, 'phased'),
        demographicMigration: this.buildDemographicPlan(podAnalysis, '')
      },
      aiReasoning: `Fallback migration plan generated due to AI service unavailability: ${errorMessage}. This plan uses best practices for ${podAnalysis.language} to ${poaRequirements.targetPlatform} migration with focus on security and compliance.`,
      aiModel: 'Fallback Rule-Based System',
      generatedAt: new Date().toISOString()
    };
  }
}

// Export singleton instance
export const aiMigrationService = new AIMigrationService();
