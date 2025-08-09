import { storage } from "../storage.js";
import { insertProjectSchema } from "../../shared/schema.js";
import { analyzeJavaProject } from "./javaAnalyzer.js";
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

export async function analyzeGithubRepository(githubData) {
  try {
    // Parse GitHub URL to extract owner/repo
    const githubUrl = githubData.githubUrl;
    const urlMatch = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    
    if (!urlMatch) {
      throw new Error('Invalid GitHub URL format');
    }
    
    const [, owner, repoName] = urlMatch;
    const cleanRepoName = repoName.replace('.git', '');
    const githubRepo = `${owner}/${cleanRepoName}`;
    
    // Create project record
    const projectData = {
      name: githubData.name || cleanRepoName,
      githubUrl: githubUrl,
      githubRepo: githubRepo,
      githubBranch: githubData.githubBranch,
      sourceType: 'github',
      status: 'processing',
      originalFileName: null,
      analysisData: null,
      fileCount: 0,
      controllerCount: 0,
      serviceCount: 0,
      repositoryCount: 0,
      entityCount: 0,
    };

    const validatedData = insertProjectSchema.parse(projectData);
    const project = await storage.createProject(validatedData);

    // Clone repository in background
    cloneAndAnalyzeRepository(project.id, githubUrl, githubData.githubBranch).catch((error) => {
      console.error(`GitHub analysis failed for project ${project.id}:`, error);
      storage.updateProject(project.id, { 
        status: 'failed',
      });
    });

    return project.id;
  } catch (error) {
    console.error('GitHub analysis error:', error);
    throw error;
  }
}

async function cloneAndAnalyzeRepository(projectId, githubUrl, branch = 'main') {
  let tempDir = null;
  
  try {
    // Create temporary directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'github-analyzer-'));
    
    // Clone repository with fallback branch logic
    const cloneUrl = githubUrl.endsWith('.git') ? githubUrl : `${githubUrl}.git`;
    
    try {
      // Try with specified branch first
      await execAsync(`git clone --depth 1 --branch ${branch} ${cloneUrl} ${tempDir}/repo`);
    } catch (branchError) {
      console.log(`Branch ${branch} not found, trying main...`);
      try {
        await execAsync(`git clone --depth 1 --branch main ${cloneUrl} ${tempDir}/repo`);
      } catch (mainError) {
        console.log(`Main branch not found, trying master...`);
        await execAsync(`git clone --depth 1 --branch master ${cloneUrl} ${tempDir}/repo`);
      }
    }
    
    const repoPath = path.join(tempDir, 'repo');
    
    // Find Java files
    const javaFiles = await findJavaFiles(repoPath);
    
    if (javaFiles.length === 0) {
      await storage.updateProject(projectId, {
        status: 'failed',
      });
      return;
    }
    
    // Analyze the project using existing Java analyzer
    const analysisData = await analyzeProjectFromFiles(javaFiles, repoPath);
    
    // Update project with results
    await storage.updateProject(projectId, {
      status: 'completed',
      analysisData,
      fileCount: javaFiles.length,
      controllerCount: analysisData.classes.filter(c => c.type === 'controller').length,
      serviceCount: analysisData.classes.filter(c => c.type === 'service').length,
      repositoryCount: analysisData.classes.filter(c => c.type === 'repository').length,
      entityCount: analysisData.classes.filter(c => c.type === 'entity').length,
    });
    
  } catch (error) {
    console.error('Repository cloning/analysis error:', error);
    await storage.updateProject(projectId, {
      status: 'failed',
    });
  } finally {
    // Clean up
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

async function findJavaFiles(rootPath) {
  const javaFiles = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        // Skip common non-source directories
        if (!['node_modules', '.git', 'target', 'build', '.gradle'].includes(item)) {
          scanDirectory(itemPath);
        }
      } else if (item.endsWith('.java')) {
        javaFiles.push(itemPath);
      }
    }
  }
  
  scanDirectory(rootPath);
  return javaFiles;
}

async function analyzeProjectFromFiles(javaFiles, baseDir) {
  const classes = [];
  const relationships = [];
  const patterns = [];
  const entities = [];
  const packages = new Set();
  const sourceFiles = [];

  // Parse each Java file (similar to ZIP analyzer)
  for (const filePath of javaFiles) {
    try {
      const content = fs.readFileSync(filePath, 'utf-8');
      const relativePath = path.relative(baseDir, filePath);
      sourceFiles.push(relativePath);
      
      const classInfo = parseJavaFile(content, relativePath);
      if (classInfo) {
        classes.push(classInfo);
        packages.add(classInfo.package);
        
        // Extract relationships
        const classRelationships = extractRelationships(classInfo, content);
        relationships.push(...classRelationships);
        
        // Check if it's a JPA entity
        if (classInfo.annotations.some(ann => ann.includes('Entity'))) {
          const entity = extractEntityInfo(classInfo);
          if (entity) {
            entities.push(entity);
          }
        }
      }
    } catch (error) {
      console.warn(`Failed to parse GitHub file ${filePath}:`, error);
    }
  }

  // Detect architectural patterns
  const detectedPatterns = detectPatterns(classes);
  patterns.push(...detectedPatterns);

  return {
    classes,
    relationships,
    patterns,
    entities,
    structure: {
      packages: Array.from(packages),
      sourceFiles
    }
  };
}

// Helper functions (reused from javaAnalyzer)
function parseJavaFile(content, filePath) {
  try {
    // Extract package
    const packageMatch = content.match(/package\s+([a-zA-Z][a-zA-Z0-9_.]*)\s*;/);
    const packageName = packageMatch ? packageMatch[1] : 'default';

    // Extract class name
    const classMatch = content.match(/(?:public\s+)?(?:abstract\s+)?(?:final\s+)?(?:class|interface|enum)\s+(\w+)/);
    if (!classMatch) return null;

    const className = classMatch[1];

    // Extract annotations
    const annotations = [];
    const annotationMatches = content.match(/@\w+(?:\([^)]*\))?/g);
    if (annotationMatches) {
      annotations.push(...annotationMatches);
    }

    // Determine class type
    const type = determineClassType(className, annotations, content);

    // Extract methods
    const methods = extractMethods(content);

    // Extract fields
    const fields = extractFields(content);

    // Extract extends/implements
    const extendsMatch = content.match(/extends\s+(\w+)/);
    const extendsClass = extendsMatch ? extendsMatch[1] : undefined;

    const implementsMatches = content.match(/implements\s+([^{]+)/);
    const implementsClasses = implementsMatches 
      ? implementsMatches[1].split(',').map(s => s.trim()) 
      : [];

    return {
      name: className,
      package: packageName,
      type,
      annotations,
      methods,
      fields,
      extends: extendsClass,
      implements: implementsClasses
    };
  } catch (error) {
    console.warn(`Failed to parse Java file ${filePath}:`, error);
    return null;
  }
}

function determineClassType(className, annotations, content) {
  const name = className.toLowerCase();
  const annotationStr = annotations.join(' ').toLowerCase();
  
  if (annotationStr.includes('@controller') || 
      annotationStr.includes('@restcontroller') ||
      name.includes('controller')) {
    return 'controller';
  }
  
  if (annotationStr.includes('@service') || 
      name.includes('service') ||
      name.includes('manager')) {
    return 'service';
  }
  
  if (annotationStr.includes('@repository') || 
      name.includes('repository') ||
      name.includes('dao')) {
    return 'repository';
  }
  
  if (annotationStr.includes('@entity') || 
      annotationStr.includes('@document') ||
      name.includes('entity') ||
      name.includes('model')) {
    return 'entity';
  }
  
  if (annotationStr.includes('@component') || 
      annotationStr.includes('@configuration')) {
    return 'component';
  }
  
  if (annotationStr.includes('@configuration') ||
      name.includes('config')) {
    return 'configuration';
  }
  
  return 'other';
}

function extractMethods(content) {
  const methods = [];
  const methodRegex = /(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]+>)?)\s+(\w+)\s*\(([^)]*)\)/g;
  
  let match;
  while ((match = methodRegex.exec(content)) !== null) {
    const returnType = match[1];
    const methodName = match[2];
    const params = match[3];
    
    if (methodName.charAt(0).toUpperCase() === methodName.charAt(0) && 
        returnType === methodName) {
      continue;
    }
    
    const methodStart = match.index;
    const beforeMethod = content.substring(Math.max(0, methodStart - 200), methodStart);
    const methodAnnotations = (beforeMethod.match(/@\w+(?:\([^)]*\))?/g) || [])
      .slice(-3);
    
    methods.push({
      name: methodName,
      annotations: methodAnnotations,
      parameters: params ? params.split(',').map(p => p.trim()) : [],
      returnType
    });
  }
  
  return methods;
}

function extractFields(content) {
  const fields = [];
  const fieldRegex = /(?:@\w+(?:\([^)]*\))?\s*)*(?:private|protected|public)?\s*(?:static\s+)?(?:final\s+)?(\w+(?:<[^>]*>)?)\s+(\w+)(?:\s*=\s*[^;]+)?;/g;
  
  let match;
  while ((match = fieldRegex.exec(content)) !== null) {
    const fieldType = match[1];
    const fieldName = match[2];
    
    const fieldStart = match.index;
    const beforeField = content.substring(Math.max(0, fieldStart - 200), fieldStart);
    const fieldAnnotations = (beforeField.match(/@\w+(?:\([^)]*\))?/g) || [])
      .slice(-3);
    
    fields.push({
      name: fieldName,
      type: fieldType,
      annotations: fieldAnnotations
    });
  }
  
  return fields;
}

function extractRelationships(classInfo, content) {
  const relationships = [];
  
  const methodCallRegex = /(\w+)\.(\w+)\(/g;
  let match;
  
  while ((match = methodCallRegex.exec(content)) !== null) {
    const targetClass = match[1];
    const method = match[2];
    
    if (!targetClass.match(/^[A-Z]/) || 
        ['System', 'String', 'Object', 'List', 'Map', 'Set'].includes(targetClass)) {
      continue;
    }
    
    relationships.push({
      from: classInfo.name,
      to: targetClass,
      type: 'calls',
      method: method
    });
  }
  
  if (classInfo.extends) {
    relationships.push({
      from: classInfo.name,
      to: classInfo.extends,
      type: 'extends'
    });
  }
  
  classInfo.implements.forEach(impl => {
    relationships.push({
      from: classInfo.name,
      to: impl,
      type: 'implements'
    });
  });
  
  return relationships;
}

function extractEntityInfo(classInfo) {
  const entity = {
    name: classInfo.name,
    tableName: extractTableName(classInfo.annotations),
    fields: []
  };
  
  classInfo.fields.forEach(field => {
    const entityField = {
      name: field.name,
      type: field.type,
      columnName: extractColumnName(field.annotations),
      relationship: extractRelationshipType(field.annotations),
      targetEntity: extractTargetEntity(field.annotations, field.type)
    };
    
    entity.fields.push(entityField);
  });
  
  return entity;
}

function extractTableName(annotations) {
  const tableAnnotation = annotations.find(ann => ann.includes('@Table'));
  if (tableAnnotation) {
    const nameMatch = tableAnnotation.match(/name\s*=\s*"([^"]+)"/);
    return nameMatch ? nameMatch[1] : undefined;
  }
  return undefined;
}

function extractColumnName(annotations) {
  const columnAnnotation = annotations.find(ann => ann.includes('@Column'));
  if (columnAnnotation) {
    const nameMatch = columnAnnotation.match(/name\s*=\s*"([^"]+)"/);
    return nameMatch ? nameMatch[1] : undefined;
  }
  return undefined;
}

function extractRelationshipType(annotations) {
  const relationshipAnnotations = ['@OneToMany', '@ManyToOne', '@OneToOne', '@ManyToMany'];
  const found = annotations.find(ann => 
    relationshipAnnotations.some(rel => ann.includes(rel))
  );
  
  if (found) {
    const match = found.match(/@(OneToMany|ManyToOne|OneToOne|ManyToMany)/);
    return match ? match[1] : undefined;
  }
  
  return undefined;
}

function extractTargetEntity(annotations, fieldType) {
  const relationshipAnnotation = annotations.find(ann => 
    ['@OneToMany', '@ManyToOne', '@OneToOne', '@ManyToMany'].some(rel => ann.includes(rel))
  );
  
  if (relationshipAnnotation) {
    const targetMatch = relationshipAnnotation.match(/targetEntity\s*=\s*(\w+)\.class/);
    if (targetMatch) {
      return targetMatch[1];
    }
  }
  
  const genericMatch = fieldType.match(/<(\w+)>/);
  return genericMatch ? genericMatch[1] : undefined;
}

function detectPatterns(classes) {
  const patterns = [];
  
  const controllers = classes.filter(c => c.type === 'controller');
  const services = classes.filter(c => c.type === 'service');
  
  if (controllers.length > 0 && services.length > 0) {
    patterns.push({
      name: 'Model-View-Controller (MVC)',
      type: 'Architectural Pattern',
      classes: [...controllers.map(c => c.name), ...services.map(c => c.name)],
      description: 'Separation of concerns with controllers handling requests and services managing business logic'
    });
  }
  
  const repositories = classes.filter(c => c.type === 'repository');
  if (repositories.length > 0) {
    patterns.push({
      name: 'Repository Pattern',
      type: 'Data Access Pattern',
      classes: repositories.map(c => c.name),
      description: 'Encapsulates data access logic and provides a uniform interface for accessing data'
    });
  }
  
  const autowiredClasses = classes.filter(c => 
    c.annotations.some(ann => ann.includes('@Autowired')) ||
    c.fields.some(f => f.annotations.some(ann => ann.includes('@Autowired')))
  );
  
  if (autowiredClasses.length > 0) {
    patterns.push({
      name: 'Dependency Injection',
      type: 'Design Pattern',
      classes: autowiredClasses.map(c => c.name),
      description: 'Inversion of Control with Spring dependency injection'
    });
  }
  
  return patterns;
}

export function isValidGithubUrl(url) {
  const githubUrlRegex = /^https:\/\/github\.com\/[^\/]+\/[^\/]+(?:\.git)?(?:\/)?$/;
  return githubUrlRegex.test(url);
}