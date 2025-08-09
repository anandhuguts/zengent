import * as fs from 'fs';
import * as path from 'path';
import { type AnalysisData } from '@shared/schema';

export interface ProjectStructure {
  rootPath: string;
  directories: DirectoryNode[];
  fileCount: number;
  directoryCount: number;
  totalSize: number;
  buildFiles: BuildFile[];
  configFiles: ConfigFile[];
  sourceStructure: SourceStructure;
  testStructure: TestStructure;
  resourceStructure: ResourceStructure;
}

export interface DirectoryNode {
  name: string;
  path: string;
  type: 'directory' | 'file';
  size?: number;
  children?: DirectoryNode[];
  fileType?: string;
  description?: string;
  purpose?: string;
  importance: 'high' | 'medium' | 'low';
}

export interface BuildFile {
  name: string;
  path: string;
  type: 'maven' | 'gradle' | 'ant' | 'sbt';
  dependencies: string[];
  properties: Record<string, string>;
  plugins: string[];
  profiles?: string[];
}

export interface ConfigFile {
  name: string;
  path: string;
  type: 'properties' | 'yaml' | 'xml' | 'json';
  purpose: string;
  configurations: Record<string, any>;
}

export interface SourceStructure {
  mainJava: PackageStructure;
  testJava: PackageStructure;
  resources: ResourceFile[];
  webContent: WebFile[];
}

export interface PackageStructure {
  packages: PackageInfo[];
  totalClasses: number;
  totalMethods: number;
  totalLines: number;
}

export interface PackageInfo {
  name: string;
  path: string;
  classes: ClassInfo[];
  subPackages: PackageInfo[];
  purpose: string;
  description: string;
}

export interface ClassInfo {
  name: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'component' | 'configuration' | 'util' | 'dto' | 'exception';
  package: string;
  methods: number;
  fields: number;
  lines: number;
  complexity: number;
  responsibilities: string[];
  description: string;
}

export interface ResourceFile {
  name: string;
  path: string;
  type: 'properties' | 'yaml' | 'sql' | 'xml' | 'json';
  purpose: string;
  size: number;
}

export interface WebFile {
  name: string;
  path: string;
  type: 'html' | 'css' | 'js' | 'jsp' | 'thymeleaf';
  purpose: string;
  size: number;
}

export interface TestStructure {
  unitTests: TestFile[];
  integrationTests: TestFile[];
  testCoverage: TestCoverage;
  testFrameworks: string[];
}

export interface TestFile {
  name: string;
  path: string;
  testClass: string;
  testMethods: number;
  assertions: number;
  purpose: string;
}

export interface TestCoverage {
  linesCovered: number;
  linesTotal: number;
  branchesCovered: number;
  branchesTotal: number;
  methodsCovered: number;
  methodsTotal: number;
  classesCovered: number;
  classesTotal: number;
}

export interface ModuleAnalysis {
  modules: ProjectModule[];
  dependencies: ModuleDependency[];
  architecture: ArchitectureDescription;
  designPatterns: DesignPattern[];
}

export interface ProjectModule {
  name: string;
  type: 'controller' | 'service' | 'repository' | 'entity' | 'config' | 'security' | 'util' | 'dto';
  purpose: string;
  description: string;
  responsibilities: string[];
  classes: string[];
  methods: ModuleMethod[];
  dependencies: string[];
  exposedAPIs: string[];
  businessLogic: string;
  technicalDetails: string;
  qualityMetrics: {
    complexity: number;
    maintainability: string;
    testability: string;
    reusability: string;
  };
}

export interface ModuleMethod {
  name: string;
  purpose: string;
  parameters: string[];
  returnType: string;
  businessLogic: string;
  technicalImplementation: string;
}

export interface ModuleDependency {
  from: string;
  to: string;
  type: 'uses' | 'extends' | 'implements' | 'aggregates' | 'composes';
  description: string;
}

export interface ArchitectureDescription {
  pattern: string;
  layers: ArchitectureLayer[];
  dataFlow: string;
  communication: string;
  scalability: string;
  maintainability: string;
}

export interface ArchitectureLayer {
  name: string;
  purpose: string;
  components: string[];
  responsibilities: string[];
  interfaces: string[];
}

export interface DesignPattern {
  name: string;
  type: 'creational' | 'structural' | 'behavioral';
  description: string;
  implementation: string;
  benefits: string[];
  usageContext: string;
  examples: string[];
}

export class ProjectStructureAnalyzer {
  
  async analyzeProjectStructure(projectPath: string): Promise<ProjectStructure> {
    const rootStats = fs.statSync(projectPath);
    
    const structure: ProjectStructure = {
      rootPath: projectPath,
      directories: await this.buildDirectoryTree(projectPath),
      fileCount: 0,
      directoryCount: 0,
      totalSize: 0,
      buildFiles: await this.findBuildFiles(projectPath),
      configFiles: await this.findConfigFiles(projectPath),
      sourceStructure: await this.analyzeSourceStructure(projectPath),
      testStructure: await this.analyzeTestStructure(projectPath),
      resourceStructure: await this.analyzeResourceStructure(projectPath)
    };

    const stats = this.calculateStats(structure.directories);
    structure.fileCount = stats.fileCount;
    structure.directoryCount = stats.directoryCount;
    structure.totalSize = stats.totalSize;

    return structure;
  }

  async analyzeModules(analysisData: AnalysisData, projectPath: string): Promise<ModuleAnalysis> {
    const modules = await this.identifyModules(analysisData);
    const dependencies = this.analyzeDependencies(modules, analysisData);
    const architecture = this.analyzeArchitecture(analysisData);
    const designPatterns = this.identifyDesignPatterns(analysisData);

    return {
      modules,
      dependencies,
      architecture,
      designPatterns
    };
  }

  private async buildDirectoryTree(dirPath: string, depth = 0): Promise<DirectoryNode[]> {
    if (depth > 10) return []; // Prevent infinite recursion

    const items = fs.readdirSync(dirPath);
    const nodes: DirectoryNode[] = [];

    for (const item of items) {
      if (item.startsWith('.') && !['src', 'main', 'test', 'resources'].includes(item)) {
        continue; // Skip hidden files except important ones
      }

      const fullPath = path.join(dirPath, item);
      const stats = fs.statSync(fullPath);

      if (stats.isDirectory()) {
        const children = await this.buildDirectoryTree(fullPath, depth + 1);
        nodes.push({
          name: item,
          path: fullPath,
          type: 'directory',
          children,
          description: this.getDirectoryDescription(item, fullPath),
          purpose: this.getDirectoryPurpose(item, fullPath),
          importance: this.getDirectoryImportance(item, fullPath)
        });
      } else {
        nodes.push({
          name: item,
          path: fullPath,
          type: 'file',
          size: stats.size,
          fileType: path.extname(item),
          description: this.getFileDescription(item, fullPath),
          purpose: this.getFilePurpose(item, fullPath),
          importance: this.getFileImportance(item, fullPath)
        });
      }
    }

    return nodes.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === 'directory' ? -1 : 1;
      }
      return a.name.localeCompare(b.name);
    });
  }

  private async findBuildFiles(projectPath: string): Promise<BuildFile[]> {
    const buildFiles: BuildFile[] = [];
    const files = this.findFilesRecursively(projectPath, ['pom.xml', 'build.gradle', 'build.xml', 'build.sbt']);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const buildFile = this.parseBuildFile(file, content);
      if (buildFile) {
        buildFiles.push(buildFile);
      }
    }

    return buildFiles;
  }

  private async findConfigFiles(projectPath: string): Promise<ConfigFile[]> {
    const configFiles: ConfigFile[] = [];
    const patterns = ['application.properties', 'application.yml', 'application.yaml', 'web.xml', 'persistence.xml'];
    const files = this.findFilesRecursively(projectPath, patterns);

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const configFile = this.parseConfigFile(file, content);
      if (configFile) {
        configFiles.push(configFile);
      }
    }

    return configFiles;
  }

  private async analyzeSourceStructure(projectPath: string): Promise<SourceStructure> {
    const mainJavaPath = path.join(projectPath, 'src', 'main', 'java');
    const testJavaPath = path.join(projectPath, 'src', 'test', 'java');
    const resourcesPath = path.join(projectPath, 'src', 'main', 'resources');
    const webContentPath = path.join(projectPath, 'src', 'main', 'webapp');

    return {
      mainJava: fs.existsSync(mainJavaPath) ? await this.analyzePackageStructure(mainJavaPath) : { packages: [], totalClasses: 0, totalMethods: 0, totalLines: 0 },
      testJava: fs.existsSync(testJavaPath) ? await this.analyzePackageStructure(testJavaPath) : { packages: [], totalClasses: 0, totalMethods: 0, totalLines: 0 },
      resources: fs.existsSync(resourcesPath) ? await this.analyzeResources(resourcesPath) : [],
      webContent: fs.existsSync(webContentPath) ? await this.analyzeWebContent(webContentPath) : []
    };
  }

  private async analyzeTestStructure(projectPath: string): Promise<TestStructure> {
    const testPath = path.join(projectPath, 'src', 'test', 'java');
    
    if (!fs.existsSync(testPath)) {
      return {
        unitTests: [],
        integrationTests: [],
        testCoverage: { linesCovered: 0, linesTotal: 0, branchesCovered: 0, branchesTotal: 0, methodsCovered: 0, methodsTotal: 0, classesCovered: 0, classesTotal: 0 },
        testFrameworks: []
      };
    }

    const testFiles = this.findFilesRecursively(testPath, [], '.java');
    const unitTests: TestFile[] = [];
    const integrationTests: TestFile[] = [];

    for (const file of testFiles) {
      const content = fs.readFileSync(file, 'utf-8');
      const testFile = this.analyzeTestFile(file, content);
      
      if (file.includes('IT.java') || file.includes('IntegrationTest')) {
        integrationTests.push(testFile);
      } else {
        unitTests.push(testFile);
      }
    }

    return {
      unitTests,
      integrationTests,
      testCoverage: this.calculateTestCoverage(testFiles),
      testFrameworks: this.identifyTestFrameworks(testFiles)
    };
  }

  private async analyzeResourceStructure(projectPath: string): Promise<ResourceStructure> {
    const resourcesPath = path.join(projectPath, 'src', 'main', 'resources');
    
    if (!fs.existsSync(resourcesPath)) {
      return {
        configFiles: [],
        staticFiles: [],
        templates: [],
        i18nFiles: [],
        sqlFiles: []
      };
    }

    return {
      configFiles: await this.findConfigFiles(resourcesPath),
      staticFiles: this.findStaticFiles(resourcesPath),
      templates: this.findTemplateFiles(resourcesPath),
      i18nFiles: this.findI18nFiles(resourcesPath),
      sqlFiles: this.findSQLFiles(resourcesPath)
    };
  }

  private async identifyModules(analysisData: AnalysisData): Promise<ProjectModule[]> {
    const modules: ProjectModule[] = [];
    
    // Group classes by type to form modules
    const controllerClasses = analysisData.classes.filter(c => c.type === 'controller');
    const serviceClasses = analysisData.classes.filter(c => c.type === 'service');
    const repositoryClasses = analysisData.classes.filter(c => c.type === 'repository');
    const entityClasses = analysisData.classes.filter(c => c.type === 'entity');

    // Analyze controller modules
    for (const controller of controllerClasses) {
      modules.push(await this.analyzeControllerModule(controller, analysisData));
    }

    // Analyze service modules
    for (const service of serviceClasses) {
      modules.push(await this.analyzeServiceModule(service, analysisData));
    }

    // Analyze repository modules
    for (const repository of repositoryClasses) {
      modules.push(await this.analyzeRepositoryModule(repository, analysisData));
    }

    // Analyze entity modules
    for (const entity of entityClasses) {
      modules.push(await this.analyzeEntityModule(entity, analysisData));
    }

    return modules;
  }

  private async analyzeControllerModule(controller: any, analysisData: AnalysisData): Promise<ProjectModule> {
    const relatedServices = this.findRelatedServices(controller, analysisData);
    
    return {
      name: controller.name,
      type: 'controller',
      purpose: 'Handle HTTP requests and manage web layer interactions',
      description: `${controller.name} manages web requests for ${this.extractDomainFromClassName(controller.name)} operations. It handles HTTP request/response processing, input validation, and coordinates with service layer components.`,
      responsibilities: [
        'Process incoming HTTP requests',
        'Validate request parameters and data',
        'Delegate business logic to service layer',
        'Format and return HTTP responses',
        'Handle web-specific concerns (sessions, cookies, etc.)'
      ],
      classes: [controller.name],
      methods: controller.methods.map((m: any) => this.analyzeMethod(m, 'controller')),
      dependencies: relatedServices.map((s: any) => s.name),
      exposedAPIs: this.extractAPIEndpoints(controller),
      businessLogic: `Orchestrates ${this.extractDomainFromClassName(controller.name)} business processes through service layer delegation`,
      technicalDetails: `Implemented using Spring MVC annotations, handles RESTful endpoints, supports JSON/XML content negotiation`,
      qualityMetrics: {
        complexity: this.calculateModuleComplexity(controller),
        maintainability: this.assessMaintainability(controller),
        testability: this.assessTestability(controller),
        reusability: this.assessReusability(controller)
      }
    };
  }

  private async analyzeServiceModule(service: any, analysisData: AnalysisData): Promise<ProjectModule> {
    const relatedRepositories = this.findRelatedRepositories(service, analysisData);
    
    return {
      name: service.name,
      type: 'service',
      purpose: 'Implement core business logic and coordinate business operations',
      description: `${service.name} encapsulates business rules and orchestrates complex operations for ${this.extractDomainFromClassName(service.name)}. It provides a clean interface for business operations and manages transactional boundaries.`,
      responsibilities: [
        'Implement business rules and logic',
        'Coordinate multiple repository operations',
        'Manage transaction boundaries',
        'Enforce business constraints and validations',
        'Provide reusable business operations'
      ],
      classes: [service.name],
      methods: service.methods.map((m: any) => this.analyzeMethod(m, 'service')),
      dependencies: relatedRepositories.map((r: any) => r.name),
      exposedAPIs: service.methods.map((m: any) => `${service.name}.${m.name}()`),
      businessLogic: `Manages ${this.extractDomainFromClassName(service.name)} business processes including validation, calculation, and coordination of data operations`,
      technicalDetails: `Implemented with Spring Service annotations, supports declarative transactions, integrates with repository layer`,
      qualityMetrics: {
        complexity: this.calculateModuleComplexity(service),
        maintainability: this.assessMaintainability(service),
        testability: this.assessTestability(service),
        reusability: this.assessReusability(service)
      }
    };
  }

  private async analyzeRepositoryModule(repository: any, analysisData: AnalysisData): Promise<ProjectModule> {
    const relatedEntities = this.findRelatedEntities(repository, analysisData);
    
    return {
      name: repository.name,
      type: 'repository',
      purpose: 'Manage data access and persistence operations',
      description: `${repository.name} provides data access abstraction for ${this.extractDomainFromClassName(repository.name)} entities. It handles CRUD operations, custom queries, and database interactions.`,
      responsibilities: [
        'Perform CRUD operations on entities',
        'Execute custom database queries',
        'Manage database connections and transactions',
        'Handle data mapping and conversion',
        'Provide data access abstraction'
      ],
      classes: [repository.name],
      methods: repository.methods.map((m: any) => this.analyzeMethod(m, 'repository')),
      dependencies: relatedEntities.map((e: any) => e.name),
      exposedAPIs: repository.methods.map((m: any) => `${repository.name}.${m.name}()`),
      businessLogic: `Manages persistence and retrieval of ${this.extractDomainFromClassName(repository.name)} data with optimized queries and data integrity`,
      technicalDetails: `Implemented using Spring Data JPA, supports named queries, custom repositories, and transaction management`,
      qualityMetrics: {
        complexity: this.calculateModuleComplexity(repository),
        maintainability: this.assessMaintainability(repository),
        testability: this.assessTestability(repository),
        reusability: this.assessReusability(repository)
      }
    };
  }

  private async analyzeEntityModule(entity: any, analysisData: AnalysisData): Promise<ProjectModule> {
    return {
      name: entity.name,
      type: 'entity',
      purpose: 'Define data model and domain objects',
      description: `${entity.name} represents a core domain object that encapsulates ${this.extractDomainFromClassName(entity.name)} data and business rules. It defines the structure and relationships of persistent data.`,
      responsibilities: [
        'Define data structure and constraints',
        'Encapsulate domain-specific data',
        'Maintain data integrity and relationships',
        'Provide data validation rules',
        'Support object-relational mapping'
      ],
      classes: [entity.name],
      methods: entity.methods.map((m: any) => this.analyzeMethod(m, 'entity')),
      dependencies: this.findEntityDependencies(entity, analysisData),
      exposedAPIs: entity.methods.filter((m: any) => m.name.startsWith('get') || m.name.startsWith('set')).map((m: any) => `${entity.name}.${m.name}()`),
      businessLogic: `Represents ${this.extractDomainFromClassName(entity.name)} domain concept with encapsulated data and business rules`,
      technicalDetails: `JPA entity with annotations for persistence mapping, validation constraints, and relationship definitions`,
      qualityMetrics: {
        complexity: this.calculateModuleComplexity(entity),
        maintainability: this.assessMaintainability(entity),
        testability: this.assessTestability(entity),
        reusability: this.assessReusability(entity)
      }
    };
  }

  // Helper methods for various analysis tasks...
  
  private getDirectoryDescription(name: string, fullPath: string): string {
    const descriptions: Record<string, string> = {
      'src': 'Source code root directory containing all application code',
      'main': 'Main application source code and resources',
      'test': 'Test source code and test resources',
      'java': 'Java source code files organized by packages',
      'resources': 'Application resources including configuration files, static content, and templates',
      'webapp': 'Web application content including JSPs, HTML, CSS, and JavaScript files',
      'config': 'Configuration classes and files',
      'controller': 'REST controllers and web controllers',
      'service': 'Business logic and service layer components',
      'repository': 'Data access layer and repository implementations',
      'entity': 'Domain models and JPA entities',
      'dto': 'Data Transfer Objects for API communication',
      'util': 'Utility classes and helper functions',
      'exception': 'Custom exception classes and error handling',
      'security': 'Security configuration and authentication components',
      'target': 'Maven build output directory',
      'build': 'Gradle build output directory',
      '.mvn': 'Maven wrapper configuration',
      '.gradle': 'Gradle configuration and cache'
    };
    
    return descriptions[name.toLowerCase()] || `${name} directory containing project files`;
  }

  private getDirectoryPurpose(name: string, fullPath: string): string {
    if (name === 'src') return 'Organize source code structure';
    if (name === 'main') return 'Contains production code';
    if (name === 'test') return 'Contains test code';
    if (name === 'resources') return 'Store configuration and static resources';
    if (name === 'controller') return 'Handle HTTP requests and responses';
    if (name === 'service') return 'Implement business logic';
    if (name === 'repository') return 'Manage data persistence';
    if (name === 'entity') return 'Define domain models';
    
    return 'Support application functionality';
  }

  private getDirectoryImportance(name: string, fullPath: string): 'high' | 'medium' | 'low' {
    const highImportance = ['src', 'main', 'java', 'controller', 'service', 'repository', 'entity'];
    const mediumImportance = ['test', 'resources', 'config', 'dto', 'util'];
    
    if (highImportance.includes(name.toLowerCase())) return 'high';
    if (mediumImportance.includes(name.toLowerCase())) return 'medium';
    return 'low';
  }

  private getFileDescription(name: string, fullPath: string): string {
    const ext = path.extname(name).toLowerCase();
    
    if (ext === '.java') return 'Java source code file';
    if (ext === '.xml') return 'XML configuration file';
    if (ext === '.properties') return 'Properties configuration file';
    if (ext === '.yml' || ext === '.yaml') return 'YAML configuration file';
    if (ext === '.json') return 'JSON configuration or data file';
    if (ext === '.sql') return 'SQL script file';
    if (ext === '.html') return 'HTML template or page';
    if (ext === '.css') return 'Cascading Style Sheet';
    if (ext === '.js') return 'JavaScript file';
    
    if (name === 'pom.xml') return 'Maven project configuration';
    if (name === 'build.gradle') return 'Gradle build script';
    if (name === 'application.properties') return 'Spring Boot application configuration';
    if (name === 'application.yml') return 'Spring Boot YAML configuration';
    
    return `${name} file`;
  }

  private getFilePurpose(name: string, fullPath: string): string {
    if (name === 'pom.xml') return 'Define project dependencies and build configuration';
    if (name === 'build.gradle') return 'Configure Gradle build process';
    if (name.startsWith('application.')) return 'Configure application properties and settings';
    if (name.endsWith('Controller.java')) return 'Handle web requests and responses';
    if (name.endsWith('Service.java')) return 'Implement business logic';
    if (name.endsWith('Repository.java')) return 'Manage data access';
    if (name.endsWith('Entity.java')) return 'Define data models';
    
    return 'Support application functionality';
  }

  private getFileImportance(name: string, fullPath: string): 'high' | 'medium' | 'low' {
    if (name === 'pom.xml' || name === 'build.gradle') return 'high';
    if (name.startsWith('application.')) return 'high';
    if (name.endsWith('Controller.java') || name.endsWith('Service.java')) return 'high';
    if (name.endsWith('Repository.java') || name.endsWith('Entity.java')) return 'high';
    if (name.endsWith('.java')) return 'medium';
    
    return 'low';
  }

  // Additional helper methods would be implemented here...
  private findFilesRecursively(dirPath: string, patterns: string[], extension?: string): string[] {
    const files: string[] = [];
    // Implementation for recursive file finding
    return files;
  }

  private parseBuildFile(filePath: string, content: string): BuildFile | null {
    // Implementation for parsing build files
    return null;
  }

  private parseConfigFile(filePath: string, content: string): ConfigFile | null {
    // Implementation for parsing config files
    return null;
  }

  private calculateStats(directories: DirectoryNode[]): { fileCount: number; directoryCount: number; totalSize: number } {
    // Implementation for calculating statistics
    return { fileCount: 0, directoryCount: 0, totalSize: 0 };
  }

  // ... Additional helper methods would continue here
}

export const projectStructureAnalyzer = new ProjectStructureAnalyzer();