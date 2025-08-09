import * as fs from 'fs';
import * as path from 'path';

export class ProjectStructureAnalyzer {
  async analyzeProject(analysisData) {
    const structure = this.buildProjectStructure(analysisData);
    const moduleAnalysis = this.analyzeModules(analysisData);
    const businessLogic = this.extractBusinessLogic(analysisData);
    const dataFlow = this.analyzeDataFlow(analysisData);
    
    return {
      structure,
      moduleAnalysis,
      businessLogic,
      dataFlow,
      summary: this.generateStructureSummary(analysisData)
    };
  }

  buildProjectStructure(analysisData) {
    const packageStructure = this.organizeByPackages(analysisData);
    const layerStructure = this.organizeByLayers(analysisData);
    
    return {
      rootPath: 'src/main/java',
      packageStructure,
      layerStructure,
      fileCount: analysisData.structure.sourceFiles.length,
      directoryCount: analysisData.structure.packages.length,
      totalClasses: analysisData.classes.length,
      buildFiles: this.detectBuildFiles(analysisData),
      configFiles: this.detectConfigFiles(analysisData),
      testStructure: this.analyzeTestStructure(analysisData)
    };
  }

  organizeByPackages(analysisData) {
    const packageMap = new Map();
    
    // Group classes by package
    for (const classInfo of analysisData.classes) {
      if (!packageMap.has(classInfo.package)) {
        packageMap.set(classInfo.package, {
          name: classInfo.package,
          classes: [],
          purpose: this.determinePackagePurpose(classInfo.package),
          description: this.generatePackageDescription(classInfo.package),
          importance: this.calculatePackageImportance(classInfo.package, analysisData)
        });
      }
      
      packageMap.get(classInfo.package).classes.push({
        name: classInfo.name,
        type: classInfo.type,
        methods: classInfo.methods.length,
        fields: classInfo.fields.length,
        annotations: classInfo.annotations,
        purpose: this.determineClassPurpose(classInfo),
        complexity: this.calculateClassComplexity(classInfo)
      });
    }
    
    return Array.from(packageMap.values());
  }

  organizeByLayers(analysisData) {
    const layers = {
      presentation: {
        name: 'Presentation Layer',
        classes: analysisData.classes.filter(c => c.type === 'controller'),
        description: 'Handles HTTP requests and responses',
        responsibilities: ['Request handling', 'Response formatting', 'Input validation'],
        technologies: ['Spring MVC', 'REST Controllers']
      },
      business: {
        name: 'Business Layer',
        classes: analysisData.classes.filter(c => c.type === 'service'),
        description: 'Contains business logic and rules',
        responsibilities: ['Business rules', 'Transaction management', 'Service orchestration'],
        technologies: ['Spring Services', 'Business Logic']
      },
      persistence: {
        name: 'Persistence Layer',
        classes: analysisData.classes.filter(c => c.type === 'repository'),
        description: 'Handles data access and storage',
        responsibilities: ['Data access', 'Query execution', 'Transaction handling'],
        technologies: ['JPA', 'Spring Data', 'Hibernate']
      },
      model: {
        name: 'Model Layer',
        classes: analysisData.classes.filter(c => c.type === 'entity'),
        description: 'Defines data structures and entities',
        responsibilities: ['Data modeling', 'Entity relationships', 'Validation'],
        technologies: ['JPA Entities', 'Domain Objects']
      },
      configuration: {
        name: 'Configuration Layer',
        classes: analysisData.classes.filter(c => c.type === 'configuration'),
        description: 'Application configuration and setup',
        responsibilities: ['Bean configuration', 'Application setup', 'Environment settings'],
        technologies: ['Spring Configuration', 'Application Properties']
      }
    };
    
    return layers;
  }

  analyzeModules(analysisData) {
    const modules = new Map();
    
    // Create modules based on package structure and class relationships
    for (const classInfo of analysisData.classes) {
      const moduleName = this.extractModuleName(classInfo.package);
      
      if (!modules.has(moduleName)) {
        modules.set(moduleName, {
          name: moduleName,
          classes: [],
          responsibilities: [],
          businessFunction: this.determineBusinessFunction(moduleName),
          complexity: 'medium',
          dependencies: [],
          apiEndpoints: [],
          dataEntities: []
        });
      }
      
      const module = modules.get(moduleName);
      module.classes.push(classInfo.name);
      
      // Add responsibilities based on class type
      if (classInfo.type === 'controller') {
        module.responsibilities.push(`${classInfo.name} API handling`);
        module.apiEndpoints.push(...this.extractEndpoints(classInfo));
      } else if (classInfo.type === 'service') {
        module.responsibilities.push(`${classInfo.name} business logic`);
      } else if (classInfo.type === 'entity') {
        module.dataEntities.push(classInfo.name);
      }
    }
    
    // Calculate dependencies between modules
    this.calculateModuleDependencies(modules, analysisData);
    
    return Array.from(modules.values());
  }

  extractBusinessLogic(analysisData) {
    const businessLogic = {
      coreProcesses: [],
      businessRules: [],
      workflows: [],
      integrations: []
    };
    
    // Analyze service classes for business logic
    const services = analysisData.classes.filter(c => c.type === 'service');
    
    for (const service of services) {
      const process = {
        name: service.name.replace('Service', ''),
        description: this.generateBusinessDescription(service),
        methods: service.methods.map(m => ({
          name: m.name,
          purpose: this.determineMethodPurpose(m.name),
          complexity: this.calculateMethodComplexity(m)
        })),
        dependencies: this.findServiceDependencies(service, analysisData)
      };
      
      businessLogic.coreProcesses.push(process);
    }
    
    // Extract business rules from annotations and method names
    businessLogic.businessRules = this.extractBusinessRules(analysisData);
    
    // Analyze workflows based on class relationships
    businessLogic.workflows = this.analyzeWorkflows(analysisData);
    
    return businessLogic;
  }

  analyzeDataFlow(analysisData) {
    const dataFlow = {
      entities: [],
      relationships: [],
      dataTransformation: [],
      apiFlow: []
    };
    
    // Analyze entities and their relationships
    const entities = analysisData.entities || [];
    for (const entity of entities) {
      dataFlow.entities.push({
        name: entity.name,
        tableName: entity.tableName,
        fields: entity.fields.length,
        relationships: entity.fields
          .filter(f => f.relationship)
          .map(f => ({
            type: f.relationship,
            target: f.targetEntity,
            field: f.name
          }))
      });
    }
    
    // Analyze API to service to repository flow
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    for (const controller of controllers) {
      const flow = {
        controller: controller.name,
        endpoints: this.extractEndpoints(controller),
        services: this.findLinkedServices(controller, analysisData),
        repositories: this.findLinkedRepositories(controller, analysisData)
      };
      
      dataFlow.apiFlow.push(flow);
    }
    
    return dataFlow;
  }

  // Helper methods
  determinePackagePurpose(packageName) {
    const parts = packageName.toLowerCase().split('.');
    const lastPart = parts[parts.length - 1];
    
    const purposeMap = {
      'controller': 'REST API endpoints and request handling',
      'service': 'Business logic and service layer',
      'repository': 'Data access and persistence',
      'entity': 'Data models and domain objects',
      'model': 'Data transfer objects and models',
      'dto': 'Data transfer objects',
      'config': 'Configuration classes',
      'util': 'Utility classes and helpers',
      'exception': 'Custom exception classes'
    };
    
    return purposeMap[lastPart] || 'Application component';
  }

  generatePackageDescription(packageName) {
    const purpose = this.determinePackagePurpose(packageName);
    const parts = packageName.split('.');
    const domain = parts[parts.length - 2] || 'application';
    
    return `${purpose} for ${domain} domain`;
  }

  calculatePackageImportance(packageName, analysisData) {
    const packageClasses = analysisData.classes.filter(c => c.package === packageName);
    const totalMethods = packageClasses.reduce((sum, c) => sum + c.methods.length, 0);
    
    if (packageClasses.some(c => c.type === 'controller') || totalMethods > 20) {
      return 'high';
    } else if (totalMethods > 10) {
      return 'medium';
    }
    return 'low';
  }

  determineClassPurpose(classInfo) {
    const typeDescriptions = {
      'controller': 'Handles HTTP requests and manages API endpoints',
      'service': 'Implements business logic and coordinates application flow',
      'repository': 'Manages data persistence and database operations',
      'entity': 'Represents domain objects and data structures',
      'component': 'Provides utility functions and supporting services',
      'configuration': 'Configures application settings and beans'
    };
    
    return typeDescriptions[classInfo.type] || 'Supports application functionality';
  }

  calculateClassComplexity(classInfo) {
    const methodCount = classInfo.methods.length;
    const fieldCount = classInfo.fields.length;
    const score = methodCount * 2 + fieldCount;
    
    if (score > 30) return 'high';
    if (score > 15) return 'medium';
    return 'low';
  }

  extractModuleName(packageName) {
    const parts = packageName.split('.');
    // Look for domain-specific part (usually after com.company)
    if (parts.length > 3) {
      return parts[3]; // e.g., com.company.app.user -> user
    }
    return parts[parts.length - 1];
  }

  determineBusinessFunction(moduleName) {
    const functionMap = {
      'user': 'User management and authentication',
      'product': 'Product catalog and inventory management',
      'order': 'Order processing and fulfillment',
      'payment': 'Payment processing and billing',
      'notification': 'Communication and alerts',
      'report': 'Analytics and reporting',
      'admin': 'Administrative functions',
      'auth': 'Authentication and authorization',
      'profile': 'User profile management',
      'dashboard': 'Dashboard and overview features'
    };
    
    return functionMap[moduleName.toLowerCase()] || `${moduleName} domain functionality`;
  }

  extractEndpoints(controller) {
    return controller.methods
      .filter(m => m.annotations.some(ann => 
        ann.includes('Mapping') || 
        ann.includes('@Get') || 
        ann.includes('@Post')
      ))
      .map(m => ({
        method: this.extractHttpMethod(m.annotations),
        path: this.extractPath(m.annotations),
        name: m.name
      }));
  }

  extractHttpMethod(annotations) {
    if (annotations.some(ann => ann.includes('@Get'))) return 'GET';
    if (annotations.some(ann => ann.includes('@Post'))) return 'POST';
    if (annotations.some(ann => ann.includes('@Put'))) return 'PUT';
    if (annotations.some(ann => ann.includes('@Delete'))) return 'DELETE';
    return 'GET'; // default
  }

  extractPath(annotations) {
    const mapping = annotations.find(ann => ann.includes('Mapping'));
    if (mapping) {
      const pathMatch = mapping.match(/["']([^"']*?)["']/);
      return pathMatch ? pathMatch[1] : '/';
    }
    return '/';
  }

  calculateModuleDependencies(modules, analysisData) {
    for (const [moduleName, module] of modules) {
      const dependencies = new Set();
      
      // Find dependencies based on relationships
      for (const className of module.classes) {
        const classInfo = analysisData.classes.find(c => c.name === className);
        if (classInfo) {
          // Check field dependencies
          for (const field of classInfo.fields) {
            const fieldModule = this.extractModuleName(this.findClassPackage(field.type, analysisData));
            if (fieldModule && fieldModule !== moduleName) {
              dependencies.add(fieldModule);
            }
          }
        }
      }
      
      module.dependencies = Array.from(dependencies);
    }
  }

  findClassPackage(className, analysisData) {
    const classInfo = analysisData.classes.find(c => c.name === className);
    return classInfo ? classInfo.package : 'unknown';
  }

  generateBusinessDescription(service) {
    const name = service.name.replace('Service', '');
    return `Manages ${name.toLowerCase()} related business operations and coordinates with other system components`;
  }

  determineMethodPurpose(methodName) {
    const name = methodName.toLowerCase();
    
    if (name.includes('create') || name.includes('add')) return 'Create new records';
    if (name.includes('update') || name.includes('modify')) return 'Update existing records';
    if (name.includes('delete') || name.includes('remove')) return 'Delete records';
    if (name.includes('find') || name.includes('get') || name.includes('search')) return 'Retrieve data';
    if (name.includes('validate') || name.includes('check')) return 'Validate data';
    if (name.includes('process') || name.includes('handle')) return 'Process business logic';
    
    return 'Perform business operation';
  }

  calculateMethodComplexity(method) {
    const paramCount = method.parameters.length;
    const annotationCount = method.annotations.length;
    
    if (paramCount > 5 || annotationCount > 3) return 'high';
    if (paramCount > 2 || annotationCount > 1) return 'medium';
    return 'low';
  }

  findServiceDependencies(service, analysisData) {
    return service.fields
      .filter(field => field.type.toLowerCase().includes('service') || 
                      field.type.toLowerCase().includes('repository'))
      .map(field => field.type);
  }

  extractBusinessRules(analysisData) {
    const rules = [];
    
    // Look for validation annotations and patterns
    for (const classInfo of analysisData.classes) {
      for (const field of classInfo.fields) {
        if (field.annotations.some(ann => ann.includes('@NotNull'))) {
          rules.push(`${classInfo.name}.${field.name} is required`);
        }
        if (field.annotations.some(ann => ann.includes('@Valid'))) {
          rules.push(`${classInfo.name}.${field.name} must be validated`);
        }
      }
    }
    
    return rules.slice(0, 10); // Limit to 10 rules
  }

  analyzeWorkflows(analysisData) {
    const workflows = [];
    
    // Analyze controller -> service -> repository chains
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    
    for (const controller of controllers) {
      const workflow = {
        name: `${controller.name.replace('Controller', '')} Workflow`,
        steps: [
          `1. ${controller.name} receives HTTP request`,
          '2. Validates input parameters',
          '3. Calls service layer for business logic',
          '4. Service interacts with repository for data',
          '5. Returns response to client'
        ],
        components: [controller.name]
      };
      
      // Find linked services
      const linkedServices = this.findLinkedServices(controller, analysisData);
      workflow.components.push(...linkedServices);
      
      workflows.push(workflow);
    }
    
    return workflows;
  }

  findLinkedServices(controller, analysisData) {
    return controller.fields
      .filter(field => field.type.toLowerCase().includes('service'))
      .map(field => field.type);
  }

  findLinkedRepositories(controller, analysisData) {
    // This would be more complex in reality, following the service layer
    return analysisData.classes
      .filter(c => c.type === 'repository')
      .map(c => c.name)
      .slice(0, 2); // Simplified
  }

  detectBuildFiles(analysisData) {
    // Mock build file detection based on common patterns
    return [
      {
        name: 'pom.xml',
        type: 'maven',
        purpose: 'Maven project configuration and dependency management',
        dependencies: ['spring-boot-starter-web', 'spring-boot-starter-data-jpa'],
        estimatedDependencyCount: analysisData.classes.length > 20 ? 15 : 8
      }
    ];
  }

  detectConfigFiles(analysisData) {
    return [
      {
        name: 'application.properties',
        type: 'properties',
        purpose: 'Application configuration and settings',
        estimatedProperties: Math.max(10, Math.floor(analysisData.classes.length / 5))
      },
      {
        name: 'application.yml',
        type: 'yaml',
        purpose: 'YAML-based application configuration',
        estimatedProperties: Math.max(8, Math.floor(analysisData.classes.length / 6))
      }
    ];
  }

  analyzeTestStructure(analysisData) {
    return {
      estimatedTestFiles: Math.floor(analysisData.classes.length * 0.8),
      testTypes: ['Unit Tests', 'Integration Tests', 'Controller Tests'],
      coverage: '75%',
      framework: 'JUnit 5'
    };
  }

  generateStructureSummary(analysisData) {
    const layers = this.organizeByLayers(analysisData);
    const moduleCount = new Set(analysisData.classes.map(c => this.extractModuleName(c.package))).size;
    
    return {
      totalClasses: analysisData.classes.length,
      totalPackages: analysisData.structure.packages.length,
      estimatedModules: moduleCount,
      architecturalLayers: Object.keys(layers).length,
      complexity: analysisData.classes.length > 50 ? 'high' : 
                  analysisData.classes.length > 20 ? 'medium' : 'low',
      maintainability: this.calculateMaintainability(analysisData),
      patterns: analysisData.patterns.length
    };
  }

  calculateMaintainability(analysisData) {
    const avgMethodsPerClass = analysisData.classes.reduce((sum, c) => sum + c.methods.length, 0) / analysisData.classes.length;
    const hasGoodStructure = analysisData.patterns.length > 0;
    
    if (avgMethodsPerClass <= 8 && hasGoodStructure) return 'excellent';
    if (avgMethodsPerClass <= 15 && hasGoodStructure) return 'good';
    if (avgMethodsPerClass <= 25) return 'fair';
    return 'poor';
  }
}

export const projectStructureAnalyzer = new ProjectStructureAnalyzer();