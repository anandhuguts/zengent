import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Code, Database, Settings, FileText, Users, GitBranch } from "lucide-react";
import { type AnalysisData } from "@shared/schema";

interface DiagramExplanationProps {
  analysisData: AnalysisData;
  selectedDiagramType: string;
}

export default function DiagramExplanation({ analysisData, selectedDiagramType }: DiagramExplanationProps) {
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  const toggleClassExpansion = (className: string) => {
    const newExpanded = new Set(expandedClasses);
    if (newExpanded.has(className)) {
      newExpanded.delete(className);
    } else {
      newExpanded.add(className);
    }
    setExpandedClasses(newExpanded);
  };

  const getClassTypeIcon = (type: string) => {
    switch (type) {
      case 'controller': return <Users className="w-4 h-4 text-blue-500" />;
      case 'service': return <Settings className="w-4 h-4 text-green-500" />;
      case 'repository': return <Database className="w-4 h-4 text-orange-500" />;
      case 'entity': return <FileText className="w-4 h-4 text-purple-500" />;
      case 'component': return <Code className="w-4 h-4 text-gray-500" />;
      default: return <FileText className="w-4 h-4 text-gray-400" />;
    }
  };

  const getMethodTypeColor = (annotations: string[]) => {
    if (annotations.some(a => a.includes('GetMapping') || a.includes('RequestMapping'))) return 'bg-green-100 text-green-800';
    if (annotations.some(a => a.includes('PostMapping'))) return 'bg-blue-100 text-blue-800';
    if (annotations.some(a => a.includes('PutMapping'))) return 'bg-yellow-100 text-yellow-800';
    if (annotations.some(a => a.includes('DeleteMapping'))) return 'bg-red-100 text-red-800';
    if (annotations.some(a => a.includes('Transactional'))) return 'bg-purple-100 text-purple-800';
    return 'bg-gray-100 text-gray-800';
  };

  const renderClassDetails = (classData: any) => {
    const isExpanded = expandedClasses.has(classData.name);
    
    return (
      <Card key={classData.name} className="mb-4">
        <Collapsible open={isExpanded} onOpenChange={() => toggleClassExpansion(classData.name)}>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getClassTypeIcon(classData.type)}
                  <div>
                    <CardTitle className="text-lg">{classData.name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {classData.type.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-gray-500">{classData.package}</span>
                    </div>
                  </div>
                </div>
                {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          
          <CollapsibleContent>
            <CardContent className="pt-0">
              {/* Class Annotations */}
              {classData.annotations && classData.annotations.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Annotations</h4>
                  <div className="flex flex-wrap gap-1">
                    {classData.annotations.map((annotation: string, idx: number) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        @{annotation}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Class Description */}
              <div className="mb-4">
                <h4 className="font-semibold text-sm text-gray-700 mb-2">Description</h4>
                <p className="text-sm text-gray-600">
                  {getClassDescription(classData)}
                </p>
              </div>

              {/* Inheritance & Implementation */}
              {(classData.extends || (classData.implements && classData.implements.length > 0)) && (
                <div className="mb-4">
                  <h4 className="font-semibold text-sm text-gray-700 mb-2">Inheritance</h4>
                  <div className="space-y-1">
                    {classData.extends && (
                      <div className="flex items-center space-x-2">
                        <GitBranch className="w-3 h-3 text-blue-500" />
                        <span className="text-sm text-gray-600">Extends: <code className="bg-gray-100 px-1 rounded">{classData.extends}</code></span>
                      </div>
                    )}
                    {classData.implements && classData.implements.length > 0 && (
                      <div className="flex items-center space-x-2">
                        <Code className="w-3 h-3 text-green-500" />
                        <span className="text-sm text-gray-600">
                          Implements: {classData.implements.map((impl: string, idx: number) => (
                            <code key={idx} className="bg-gray-100 px-1 rounded mr-1">{impl}</code>
                          ))}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <Tabs defaultValue="methods" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="methods">Methods ({classData.methods?.length || 0})</TabsTrigger>
                  <TabsTrigger value="fields">Fields ({classData.fields?.length || 0})</TabsTrigger>
                </TabsList>
                
                <TabsContent value="methods" className="space-y-3">
                  {classData.methods && classData.methods.length > 0 ? (
                    classData.methods.map((method: any, idx: number) => (
                      <Card key={idx} className="border-l-4 border-l-blue-200">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-sm">{method.name}</h5>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getMethodTypeColor(method.annotations)} variant="secondary">
                                  {method.returnType || 'void'}
                                </Badge>
                                {method.annotations && method.annotations.length > 0 && (
                                  <div className="flex flex-wrap gap-1">
                                    {method.annotations.slice(0, 2).map((annotation: string, aIdx: number) => (
                                      <Badge key={aIdx} variant="outline" className="text-xs">
                                        @{annotation.replace(/\(.*\)/, '')}
                                      </Badge>
                                    ))}
                                    {method.annotations.length > 2 && (
                                      <Badge variant="outline" className="text-xs">
                                        +{method.annotations.length - 2}
                                      </Badge>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                          
                          {/* Method Parameters */}
                          {method.parameters && method.parameters.length > 0 && (
                            <div className="mb-2">
                              <h6 className="text-xs font-medium text-gray-600 mb-1">Parameters:</h6>
                              <div className="space-y-1">
                                {method.parameters.map((param: string, pIdx: number) => (
                                  <code key={pIdx} className="text-xs bg-gray-50 px-2 py-1 rounded block">
                                    {param}
                                  </code>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Method Description */}
                          <div className="text-xs text-gray-600">
                            {getMethodDescription(method, classData.type)}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No methods found in this class
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="fields" className="space-y-3">
                  {classData.fields && classData.fields.length > 0 ? (
                    classData.fields.map((field: any, idx: number) => (
                      <Card key={idx} className="border-l-4 border-l-green-200">
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <div>
                              <h5 className="font-medium text-sm">{field.name}</h5>
                              <Badge variant="secondary" className="text-xs mt-1">
                                {field.type}
                              </Badge>
                            </div>
                            {field.annotations && field.annotations.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {field.annotations.map((annotation: string, aIdx: number) => (
                                  <Badge key={aIdx} variant="outline" className="text-xs">
                                    @{annotation.replace(/\(.*\)/, '')}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            {getFieldDescription(field, classData.type)}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center text-gray-500 text-sm py-4">
                      No fields found in this class
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </CollapsibleContent>
        </Collapsible>
      </Card>
    );
  };

  const getClassDescription = (classData: any): string => {
    const type = classData.type;
    const name = classData.name;
    
    switch (type) {
      case 'controller':
        return `${name} handles HTTP requests and responses. It acts as the entry point for web requests, processing user input and coordinating with service layers to fulfill business operations. Controllers typically contain endpoint mappings and request handling logic.`;
      case 'service':
        return `${name} contains business logic and orchestrates operations between different components. Services encapsulate core business rules, coordinate data access through repositories, and provide clean interfaces for controllers to interact with domain logic.`;
      case 'repository':
        return `${name} provides data access functionality and abstracts database operations. Repositories handle CRUD operations, complex queries, and data persistence logic, serving as the boundary between the application and data storage layers.`;
      case 'entity':
        return `${name} represents a data model or domain object that maps to database tables. Entities define the structure of persistent data, relationships between different data models, and validation rules for data integrity.`;
      case 'configuration':
        return `${name} provides application configuration and bean definitions. Configuration classes set up application context, define beans, configure security, and establish application-wide settings and dependencies.`;
      default:
        return `${name} is a ${type} component that provides specific functionality within the application architecture. It contributes to the overall system design and implements particular business or technical requirements.`;
    }
  };

  const getMethodDescription = (method: any, classType: string): string => {
    const name = method.name;
    const annotations = method.annotations || [];
    
    if (annotations.some(a => a.includes('GetMapping'))) {
      return `GET endpoint that retrieves ${name.replace(/^get|^find/, '').toLowerCase()} data. This method handles read operations and returns information to the client.`;
    }
    if (annotations.some(a => a.includes('PostMapping'))) {
      return `POST endpoint that creates new ${name.replace(/^create|^add/, '').toLowerCase()} resources. This method processes creation requests and persists new data.`;
    }
    if (annotations.some(a => a.includes('PutMapping'))) {
      return `PUT endpoint that updates existing ${name.replace(/^update|^modify/, '').toLowerCase()} resources. This method handles full resource updates.`;
    }
    if (annotations.some(a => a.includes('DeleteMapping'))) {
      return `DELETE endpoint that removes ${name.replace(/^delete|^remove/, '').toLowerCase()} resources. This method handles resource deletion operations.`;
    }
    if (annotations.some(a => a.includes('Transactional'))) {
      return `Transactional method that ensures data consistency. This method executes within a database transaction, providing ACID properties for data operations.`;
    }
    
    switch (classType) {
      case 'service':
        return `Business logic method that ${name.toLowerCase()}. This method implements core business rules and coordinates operations between different system components.`;
      case 'repository':
        return `Data access method that ${name.toLowerCase()}. This method interacts with the database to perform CRUD operations or execute custom queries.`;
      default:
        return `Method that ${name.toLowerCase()}. This method provides specific functionality as part of the ${classType} component's responsibilities.`;
    }
  };

  const getFieldDescription = (field: any, classType: string): string => {
    const name = field.name;
    const type = field.type;
    const annotations = field.annotations || [];
    
    if (annotations.some(a => a.includes('Id'))) {
      return `Primary key field of type ${type}. This field uniquely identifies each instance of the entity in the database.`;
    }
    if (annotations.some(a => a.includes('OneToMany') || a.includes('ManyToOne') || a.includes('OneToOne') || a.includes('ManyToMany'))) {
      return `Relationship field that establishes associations with other entities. This field manages ${annotations.find(a => a.includes('To'))?.replace(/[()]/g, '')} relationships in the data model.`;
    }
    if (annotations.some(a => a.includes('Column'))) {
      return `Database column field of type ${type}. This field maps to a specific column in the database table and stores ${name} data.`;
    }
    if (annotations.some(a => a.includes('Autowired') || a.includes('Inject'))) {
      return `Dependency injection field of type ${type}. This field is automatically injected by the Spring container to provide required dependencies.`;
    }
    
    switch (classType) {
      case 'entity':
        return `Entity property of type ${type} that represents ${name} data. This field is part of the persistent data model and may be stored in the database.`;
      case 'service':
        return `Service dependency of type ${type}. This field provides access to ${name} functionality and is used for business logic operations.`;
      case 'repository':
        return `Repository field of type ${type} used for ${name} operations. This field supports data access and persistence functionality.`;
      default:
        return `Field of type ${type} that stores ${name} information. This field contributes to the component's state and functionality.`;
    }
  };

  const getDiagramExplanation = () => {
    switch (selectedDiagramType) {
      case 'flow':
        return {
          title: "Flow Chart Diagram",
          description: "Shows the request flow from controllers through services to repositories, illustrating how data moves through the application layers.",
          purpose: "Understand the execution path and component interactions during request processing."
        };
      case 'component':
        return {
          title: "Component Diagram", 
          description: "Displays the high-level architecture showing relationships between different components, their dependencies, and interfaces.",
          purpose: "Visualize the overall system structure and component dependencies for architectural understanding."
        };
      case 'class':
        return {
          title: "Class Diagram",
          description: "Presents detailed class structures including fields, methods, inheritance relationships, and associations between classes.",
          purpose: "Analyze the object-oriented design, class relationships, and detailed implementation structure."
        };
      case 'sequence':
        return {
          title: "Sequence Diagram",
          description: "Illustrates the interaction sequences between objects over time, showing method calls and message exchanges.",
          purpose: "Understand the temporal aspects of system behavior and interaction patterns."
        };
      case 'er':
        return {
          title: "Entity Relationship Diagram",
          description: "Shows database entities, their attributes, and relationships, focusing on the data model and persistence layer.",
          purpose: "Analyze the data structure, entity relationships, and database design patterns."
        };
      default:
        return {
          title: "System Diagram",
          description: "General overview of the system architecture and component relationships.",
          purpose: "Provide a comprehensive view of the application structure."
        };
    }
  };

  const diagramInfo = getDiagramExplanation();

  return (
    <div className="space-y-6">
      {/* Diagram Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>{diagramInfo.title} Explanation</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-gray-700">{diagramInfo.description}</p>
            <div className="bg-blue-50 border-l-4 border-blue-200 p-3 rounded">
              <p className="text-sm text-blue-800">
                <strong>Purpose:</strong> {diagramInfo.purpose}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Architecture Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Architecture Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{analysisData.classes?.filter(c => c.type === 'controller').length || 0}</div>
              <div className="text-sm text-gray-600">Controllers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{analysisData.classes?.filter(c => c.type === 'service').length || 0}</div>
              <div className="text-sm text-gray-600">Services</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{analysisData.classes?.filter(c => c.type === 'repository').length || 0}</div>
              <div className="text-sm text-gray-600">Repositories</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{analysisData.classes?.filter(c => c.type === 'entity').length || 0}</div>
              <div className="text-sm text-gray-600">Entities</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detailed Class Information */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Component Analysis</CardTitle>
          <p className="text-sm text-gray-600">
            Click on any component below to expand and view detailed information about its methods, fields, and functionality.
          </p>
        </CardHeader>
        <CardContent>
          {analysisData.classes && analysisData.classes.length > 0 ? (
            <div className="space-y-2">
              {analysisData.classes.map((classData) => renderClassDetails(classData))}
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No class information available for detailed analysis.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}