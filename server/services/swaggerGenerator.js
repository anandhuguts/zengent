import swaggerJSDoc from 'swagger-jsdoc';

export class SwaggerGenerator {
  async generateSwaggerSpec(analysisData) {
    const controllers = analysisData.classes.filter(c => c.type === 'controller');
    const entities = analysisData.classes.filter(c => c.type === 'entity');
    
    const requestMappings = this.extractRequestMappings(controllers);
    const schemas = this.generateSchemas(entities);
    const paths = this.generatePaths(requestMappings);
    
    return {
      openapi: '3.0.0',
      info: {
        title: 'Enterprise Application API',
        version: '1.0.0',
        description: 'Generated API documentation from Java code analysis'
      },
      servers: [
        {
          url: 'http://localhost:8080',
          description: 'Development server'
        },
        {
          url: 'https://api.example.com',
          description: 'Production server'
        }
      ],
      paths,
      components: {
        schemas,
        securitySchemes: {
          bearerAuth: {
            type: 'http',
            scheme: 'bearer',
            bearerFormat: 'JWT'
          }
        }
      },
      tags: this.generateTags(controllers)
    };
  }

  extractRequestMappings(controllers) {
    const mappings = [];
    let mappingId = 1;

    for (const controller of controllers) {
      const controllerPath = this.extractControllerPath(controller.annotations);
      
      for (const method of controller.methods) {
        const httpMethods = this.extractHttpMethods(method.annotations);
        const methodPath = this.extractMethodPath(method.annotations);
        
        if (httpMethods.length > 0) {
          for (const httpMethod of httpMethods) {
            const fullPath = this.combinePaths(controllerPath, methodPath);
            
            mappings.push({
              id: mappingId++,
              httpMethod: httpMethod.toLowerCase(),
              endpoint: fullPath,
              controllerClass: controller.name,
              controllerMethod: method.name,
              serviceCalled: this.findServiceCall(controller, method.name),
              serviceMethod: this.findServiceMethod(controller, method.name),
              parameters: this.extractParameters(method),
              responseType: method.returnType,
              description: this.generateMethodDescription(controller.name, method.name, httpMethod),
              javadoc: this.extractJavadoc(method)
            });
          }
        }
      }
    }

    return mappings;
  }

  generateSchemas(entities) {
    const schemas = {};
    
    for (const entity of entities) {
      const properties = {};
      
      for (const field of entity.fields) {
        properties[field.name] = {
          type: this.mapJavaTypeToSwagger(field.type),
          description: `${field.name} field`,
          ...(field.annotations.includes('@Id') && { 
            description: `${field.name} field (Primary Key)` 
          })
        };
      }
      
      schemas[entity.name] = {
        type: 'object',
        properties,
        required: entity.fields
          .filter(f => !f.annotations.some(ann => ann.includes('@Nullable')))
          .map(f => f.name)
      };
    }
    
    // Add common response schemas
    schemas['ApiResponse'] = {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' },
        data: { type: 'object' }
      }
    };
    
    schemas['ErrorResponse'] = {
      type: 'object',
      properties: {
        error: { type: 'string' },
        message: { type: 'string' },
        code: { type: 'integer' }
      }
    };
    
    return schemas;
  }

  generatePaths(requestMappings) {
    const paths = {};
    
    for (const mapping of requestMappings) {
      if (!paths[mapping.endpoint]) {
        paths[mapping.endpoint] = {};
      }
      
      paths[mapping.endpoint][mapping.httpMethod] = {
        tags: [this.extractTagFromController(mapping.controllerClass)],
        summary: this.generateSummary(mapping),
        description: mapping.description,
        operationId: `${mapping.controllerMethod}_${mapping.httpMethod}`,
        parameters: this.generateSwaggerParameters(mapping.parameters),
        responses: this.generateResponses(mapping.responseType),
        ...(this.requiresAuth(mapping) && {
          security: [{ bearerAuth: [] }]
        })
      };
      
      // Add request body for POST/PUT/PATCH
      if (['post', 'put', 'patch'].includes(mapping.httpMethod)) {
        const bodyParam = mapping.parameters.find(p => p.location === 'body');
        if (bodyParam) {
          paths[mapping.endpoint][mapping.httpMethod].requestBody = {
            required: bodyParam.required,
            content: {
              'application/json': {
                schema: {
                  $ref: `#/components/schemas/${bodyParam.type}`
                }
              }
            }
          };
        }
      }
    }
    
    return paths;
  }

  generateTags(controllers) {
    return controllers.map(controller => ({
      name: this.extractTagFromController(controller.name),
      description: `${controller.name} operations`
    }));
  }

  // Helper methods
  extractControllerPath(annotations) {
    const requestMapping = annotations.find(ann => 
      ann.includes('@RequestMapping') || ann.includes('@RestController')
    );
    
    if (requestMapping) {
      const pathMatch = requestMapping.match(/["']([^"']*?)["']/);
      return pathMatch ? pathMatch[1] : '';
    }
    
    return '';
  }

  extractHttpMethods(annotations) {
    const methods = [];
    const methodMap = {
      '@GetMapping': 'GET',
      '@PostMapping': 'POST',
      '@PutMapping': 'PUT',
      '@DeleteMapping': 'DELETE',
      '@PatchMapping': 'PATCH'
    };
    
    for (const annotation of annotations) {
      for (const [annType, httpMethod] of Object.entries(methodMap)) {
        if (annotation.includes(annType)) {
          methods.push(httpMethod);
          break;
        }
      }
      
      // Check for generic @RequestMapping
      if (annotation.includes('@RequestMapping')) {
        const methodMatch = annotation.match(/method\s*=\s*RequestMethod\.(\w+)/);
        if (methodMatch) {
          methods.push(methodMatch[1]);
        } else {
          methods.push('GET'); // Default
        }
      }
    }
    
    return methods.length > 0 ? methods : ['GET'];
  }

  extractMethodPath(annotations) {
    for (const annotation of annotations) {
      if (annotation.includes('Mapping')) {
        const pathMatch = annotation.match(/["']([^"']*?)["']/);
        if (pathMatch) {
          return pathMatch[1];
        }
        
        // Check for value attribute
        const valueMatch = annotation.match(/value\s*=\s*["']([^"']*?)["']/);
        if (valueMatch) {
          return valueMatch[1];
        }
      }
    }
    return '';
  }

  combinePaths(basePath, methodPath) {
    const base = basePath.startsWith('/') ? basePath : `/${basePath}`;
    const method = methodPath.startsWith('/') ? methodPath : `/${methodPath}`;
    
    if (!methodPath) return base || '/';
    if (!basePath) return method;
    
    return `${base}${method}`.replace(/\/+/g, '/');
  }

  findServiceCall(controller, methodName) {
    const serviceField = controller.fields.find(field => 
      field.type.toLowerCase().includes('service')
    );
    return serviceField ? serviceField.type : undefined;
  }

  findServiceMethod(controller, methodName) {
    // Simplified service method detection
    return `process${methodName.charAt(0).toUpperCase() + methodName.slice(1)}`;
  }

  extractParameters(method) {
    const parameters = [];
    
    for (let i = 0; i < method.parameters.length; i++) {
      const param = method.parameters[i];
      const parts = param.trim().split(/\s+/);
      
      if (parts.length >= 2) {
        const type = parts[parts.length - 2];
        const name = parts[parts.length - 1];
        
        // Determine parameter location based on annotations
        const location = this.determineParameterLocation(param);
        
        parameters.push({
          name,
          type,
          required: !param.includes('@RequestParam') || !param.includes('required=false'),
          description: `${name} parameter`,
          location
        });
      }
    }
    
    return parameters;
  }

  determineParameterLocation(paramString) {
    if (paramString.includes('@PathVariable')) return 'path';
    if (paramString.includes('@RequestParam')) return 'query';
    if (paramString.includes('@RequestBody')) return 'body';
    if (paramString.includes('@RequestHeader')) return 'header';
    return 'query'; // Default
  }

  generateMethodDescription(controllerName, methodName, httpMethod) {
    const action = {
      'GET': 'Retrieve',
      'POST': 'Create',
      'PUT': 'Update',
      'DELETE': 'Delete',
      'PATCH': 'Partially update'
    }[httpMethod] || 'Process';
    
    const resource = controllerName.replace('Controller', '').toLowerCase();
    return `${action} ${resource} via ${methodName}`;
  }

  extractJavadoc(method) {
    // Simplified Javadoc extraction
    return `Documentation for ${method.name} method`;
  }

  mapJavaTypeToSwagger(javaType) {
    const typeMap = {
      'String': 'string',
      'Integer': 'integer',
      'int': 'integer',
      'Long': 'integer',
      'long': 'integer',
      'Double': 'number',
      'double': 'number',
      'Float': 'number',
      'float': 'number',
      'Boolean': 'boolean',
      'boolean': 'boolean',
      'Date': 'string',
      'LocalDate': 'string',
      'LocalDateTime': 'string',
      'BigDecimal': 'number'
    };
    
    return typeMap[javaType] || 'object';
  }

  generateSwaggerParameters(parameters) {
    return parameters
      .filter(p => p.location !== 'body')
      .map(param => ({
        name: param.name,
        in: param.location,
        required: param.required,
        description: param.description,
        schema: {
          type: this.mapJavaTypeToSwagger(param.type)
        }
      }));
  }

  generateResponses(responseType) {
    return {
      '200': {
        description: 'Successful operation',
        content: {
          'application/json': {
            schema: responseType === 'void' ? {
              $ref: '#/components/schemas/ApiResponse'
            } : {
              type: this.mapJavaTypeToSwagger(responseType)
            }
          }
        }
      },
      '400': {
        description: 'Bad request',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      },
      '500': {
        description: 'Internal server error',
        content: {
          'application/json': {
            schema: { $ref: '#/components/schemas/ErrorResponse' }
          }
        }
      }
    };
  }

  requiresAuth(mapping) {
    return mapping.controllerClass.includes('Secure') || 
           mapping.endpoint.includes('/admin') ||
           ['POST', 'PUT', 'DELETE', 'PATCH'].includes(mapping.httpMethod.toUpperCase());
  }

  extractTagFromController(controllerName) {
    return controllerName.replace('Controller', '').toLowerCase();
  }

  generateSummary(mapping) {
    const action = mapping.httpMethod.toUpperCase();
    const resource = mapping.controllerClass.replace('Controller', '');
    return `${action} ${resource}`;
  }
}

export const swaggerGenerator = new SwaggerGenerator();