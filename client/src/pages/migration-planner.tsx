import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Cloud, 
  Database, 
  Shield, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle2,
  Clock,
  DollarSign,
  Zap,
  ChevronRight,
  Sparkles,
  Brain,
  Cpu,
  FileCode,
  Code
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import type { Project } from '@shared/schema';

interface MigrationPlan {
  podAnalysis: {
    language: string;
    framework: string;
    architecture: string;
    database: string;
    demographicFields: {
      total: number;
      categories: string[];
      complianceRisk: string;
    };
    qualityMetrics: {
      securityScore: number;
      maintainability: number;
      cyclomaticComplexity: number;
      technicalDebtHours: number;
    };
    vulnerabilities: {
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  };
  poaRecommendation: {
    architecture: string;
    techStack: {
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
    };
    migrationStrategy: string;
    phases: Array<{
      phaseNumber: number;
      name: string;
      duration: string;
      services: string[];
      goals: string[];
      dependencies: string[];
      risks: string[];
      effort: string;
      deliverables: string[];
    }>;
    riskAssessment: Array<{
      category: string;
      issue: string;
      impact: string;
      mitigation: string;
    }>;
    costBenefit: {
      podAnnualCost: number;
      poaAnnualCost: number;
      migrationCost: number;
      annualSavings: number;
      roiMonths: number;
      breakdown: {
        podCosts: { [key: string]: number };
        poaCosts: { [key: string]: number };
      };
    };
    demographicMigration: {
      currentState: {
        totalFields: number;
        issues: string[];
        complianceGaps: string[];
      };
      targetState: {
        isolationPattern: string;
        encryptionStrategy: { [key: string]: string };
        accessControl: string[];
        complianceFeatures: string[];
      };
      migrationSteps: string[];
      codeExamples: {
        before: string;
        after: string;
      };
    };
  };
  aiReasoning: string;
  aiModel: string;
  generatedAt: string;
  componentImpactAnalysis?: {
    impactedFiles: Array<{
      path: string;
      demographicFields: string[];
      functions: string[];
      classes: string[];
      linesOfCode: number;
      migrationPriority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    impactedComponents: Array<{
      type: 'class' | 'function' | 'library';
      name: string;
      file: string;
      demographicFieldsAccessed: string[];
      dependsOn: string[];
      usedBy: string[];
      transformationRequired: boolean;
    }>;
    transformationExamples: Array<{
      fieldType: string;
      scenario: string;
      beforeCode: string;
      afterCode: string;
      explanation: string;
      securityEnhancements: string[];
    }>;
  };
}

export default function MigrationPlanner() {
  const { id } = useParams();
  const queryClient = useQueryClient();
  const [selectedAIModel, setSelectedAIModel] = useState<string>('openai');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  
  // Fetch project data
  const { data: project } = useQuery<Project>({
    queryKey: [`/api/projects/${id}`],
    enabled: !!id,
  });

  // Mutation to generate migration plan
  const generatePlanMutation = useMutation<MigrationPlan, Error, { aiModel: string; customPrompt: string }>({
    mutationFn: async ({ aiModel, customPrompt }) => {
      const response = await fetch(`/api/projects/${id}/migration-plan`, {
        method: 'POST',
        body: JSON.stringify({
          aiModel,
          customPrompt,
          poaRequirements: {
            targetPlatform: 'AWS Cloud',
            compliance: ['GDPR', 'PCI-DSS', 'HIPAA'],
            timeline: '6 months',
            budget: 'MEDIUM'
          }
        }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate migration plan');
      }
      
      return response.json() as Promise<MigrationPlan>;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/projects/${id}/migration-plan`] });
    }
  });

  const migrationPlan = generatePlanMutation.data;
  const isLoading = generatePlanMutation.isPending;

  const getImpactColor = (impact: string) => {
    switch (impact.toUpperCase()) {
      case 'CRITICAL': return 'destructive';
      case 'HIGH': return 'destructive';
      case 'MEDIUM': return 'default';
      case 'LOW': return 'secondary';
      default: return 'default';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Link href="/" className="hover:text-foreground">Home</Link>
          <ChevronRight className="h-4 w-4" />
          <Link href={`/projects/${id}`} className="hover:text-foreground">Project</Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Migration Planner</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <ArrowRight className="h-8 w-8 text-primary" />
              POD → POA Migration Planner
            </h1>
            <p className="text-muted-foreground mt-2">
              AI-powered migration path from Point of Departure to Point of Arrival
            </p>
          </div>
          {project && (
            <Badge variant="outline" className="text-lg px-4 py-2">
              {project.name}
            </Badge>
          )}
        </div>
      </div>

      {/* AI Model Selection */}
      {!migrationPlan && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Generate AI Migration Plan
            </CardTitle>
            <CardDescription>
              Select an AI model to analyze your codebase and generate a comprehensive migration roadmap
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Custom Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Custom Migration Requirements (Optional)
              </label>
              <textarea
                placeholder="Enter specific requirements, constraints, or focus areas for migration. For example: 'Focus on microservices architecture' or 'Prioritize database migration strategy' or 'Must support multi-region deployment'..."
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                className="w-full min-h-[100px] p-3 border rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                data-testid="input-custom-prompt"
              />
              <p className="text-xs text-muted-foreground">
                This custom prompt will be included in the AI-generated migration report
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                data-testid="button-generate-openai"
                onClick={() => generatePlanMutation.mutate({ aiModel: 'openai', customPrompt })}
                disabled={isLoading}
                className="h-auto flex flex-col items-start gap-2 p-4"
                variant={selectedAIModel === 'openai' ? 'default' : 'outline'}
              >
                <div className="flex items-center gap-2 w-full">
                  <Sparkles className="h-5 w-5" />
                  <span className="font-semibold">OpenAI GPT-4o</span>
                </div>
                <span className="text-xs text-left opacity-90">
                  Cloud-based • Best quality • Strategic planning
                </span>
              </Button>

              <Button
                data-testid="button-generate-codellama"
                onClick={() => generatePlanMutation.mutate({ aiModel: 'ollama-codellama', customPrompt })}
                disabled={isLoading}
                className="h-auto flex flex-col items-start gap-2 p-4"
                variant={selectedAIModel === 'ollama-codellama' ? 'default' : 'outline'}
              >
                <div className="flex items-center gap-2 w-full">
                  <Cpu className="h-5 w-5" />
                  <span className="font-semibold">Code Llama</span>
                </div>
                <span className="text-xs text-left opacity-90">
                  Local • Privacy-first • Code transformation
                </span>
              </Button>

              <Button
                data-testid="button-generate-deepseek"
                onClick={() => generatePlanMutation.mutate({ aiModel: 'ollama-deepseek', customPrompt })}
                disabled={isLoading}
                className="h-auto flex flex-col items-start gap-2 p-4"
                variant={selectedAIModel === 'ollama-deepseek' ? 'default' : 'outline'}
              >
                <div className="flex items-center gap-2 w-full">
                  <Cpu className="h-5 w-5" />
                  <span className="font-semibold">Deepseek Coder</span>
                </div>
                <span className="text-xs text-left opacity-90">
                  Local • Dependency analysis • Fast
                </span>
              </Button>
            </div>
            
            {isLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-muted-foreground">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary"></div>
                <span>Analyzing POD and generating migration path...</span>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Migration Plan Display */}
      {migrationPlan && (
        <div className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Strategy</p>
                    <p className="text-2xl font-bold capitalize">
                      {migrationPlan.poaRecommendation.migrationStrategy.replace('-', ' ')}
                    </p>
                  </div>
                  <Zap className="h-8 w-8 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Phases</p>
                    <p className="text-2xl font-bold">
                      {migrationPlan.poaRecommendation.phases.length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Annual Savings</p>
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(migrationPlan.poaRecommendation.costBenefit.annualSavings)}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">ROI Break-even</p>
                    <p className="text-2xl font-bold">
                      {migrationPlan.poaRecommendation.costBenefit.roiMonths} mo
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* AI Model Badge */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">Generated by:</span>
                  <Badge variant="secondary">{migrationPlan.aiModel}</Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => generatePlanMutation.mutate({ aiModel: selectedAIModel, customPrompt })}
                >
                  Regenerate Plan
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8 gap-1">
              <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
              <TabsTrigger value="architecture" data-testid="tab-architecture">POA Architecture</TabsTrigger>
              <TabsTrigger value="phases" data-testid="tab-phases">Migration Phases</TabsTrigger>
              <TabsTrigger value="demographic" data-testid="tab-demographic">Demographic Data</TabsTrigger>
              <TabsTrigger value="impact" data-testid="tab-impact">Component Impact</TabsTrigger>
              <TabsTrigger value="transformations" data-testid="tab-transformations">Code Transformations</TabsTrigger>
              <TabsTrigger value="risks" data-testid="tab-risks">Risks</TabsTrigger>
              <TabsTrigger value="cost" data-testid="tab-cost">Cost Analysis</TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Migration Strategy & AI Reasoning</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Recommended Strategy: {migrationPlan.poaRecommendation.migrationStrategy.toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">{migrationPlan.aiReasoning}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t">
                    <div>
                      <h4 className="font-semibold mb-2">POD (Current State)</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Language: {migrationPlan.podAnalysis.language}</li>
                        <li>Framework: {migrationPlan.podAnalysis.framework}</li>
                        <li>Architecture: {migrationPlan.podAnalysis.architecture}</li>
                        <li>Security Score: {migrationPlan.podAnalysis.qualityMetrics.securityScore}/100</li>
                        <li>Demographic Fields: {migrationPlan.podAnalysis.demographicFields.total}</li>
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">POA (Target State)</h4>
                      <ul className="space-y-1 text-sm">
                        <li>Architecture: {migrationPlan.poaRecommendation.architecture}</li>
                        <li>Language: {migrationPlan.poaRecommendation.techStack.language}</li>
                        <li>Framework: {migrationPlan.poaRecommendation.techStack.framework}</li>
                        <li>Database: {migrationPlan.poaRecommendation.techStack.database}</li>
                        <li>Platform: Cloud-Native Microservices</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* POA Architecture Tab */}
            <TabsContent value="architecture" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Cloud className="h-5 w-5 text-blue-500" />
                    Target POA Technology Stack
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {Object.entries(migrationPlan.poaRecommendation.techStack).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="font-semibold">
                          {Array.isArray(value) ? value.join(', ') : value}
                        </p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Migration Phases Tab */}
            <TabsContent value="phases" className="space-y-4">
              {migrationPlan.poaRecommendation.phases.map((phase, index) => (
                <Card key={phase.phaseNumber} data-testid={`card-phase-${phase.phaseNumber}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Phase {phase.phaseNumber}: {phase.name}</span>
                      <Badge variant="outline">{phase.duration}</Badge>
                    </CardTitle>
                    <CardDescription>
                      Effort: {phase.effort}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Services to Migrate</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.services.map((service, i) => (
                          <Badge key={i} variant="secondary">{service}</Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Goals</h4>
                      <ul className="space-y-1">
                        {phase.goals.map((goal, i) => (
                          <li key={i} className="text-sm flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5" />
                            {goal}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Deliverables</h4>
                      <div className="flex flex-wrap gap-2">
                        {phase.deliverables.map((deliverable, i) => (
                          <Badge key={i} variant="outline">{deliverable}</Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Demographic Data Tab */}
            <TabsContent value="demographic" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-yellow-500" />
                    Demographic Data Migration Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <h4 className="font-semibold mb-2">Current State Issues (POD)</h4>
                    <ul className="space-y-1">
                      {migrationPlan.poaRecommendation.demographicMigration.currentState.issues.map((issue, i) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Target State (POA)</h4>
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Isolation Pattern:</p>
                        <Badge variant="secondary">
                          {migrationPlan.poaRecommendation.demographicMigration.targetState.isolationPattern}
                        </Badge>
                      </div>
                      
                      <div>
                        <p className="text-sm font-medium mb-2">Encryption Strategy:</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {Object.entries(migrationPlan.poaRecommendation.demographicMigration.targetState.encryptionStrategy).map(([field, strategy]) => (
                            <div key={field} className="text-sm p-2 bg-muted rounded">
                              <span className="font-medium">{field}:</span> {strategy}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold mb-2">Code Transformation</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm font-medium mb-2 text-red-600">❌ Before (POD - Insecure)</p>
                        <pre className="text-xs bg-red-50 p-3 rounded overflow-x-auto">
                          {migrationPlan.poaRecommendation.demographicMigration.codeExamples.before}
                        </pre>
                      </div>
                      <div>
                        <p className="text-sm font-medium mb-2 text-green-600">✅ After (POA - Secure)</p>
                        <pre className="text-xs bg-green-50 p-3 rounded overflow-x-auto">
                          {migrationPlan.poaRecommendation.demographicMigration.codeExamples.after}
                        </pre>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Component Impact Analysis Tab */}
            <TabsContent value="impact" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileCode className="h-5 w-5 text-blue-500" />
                    Impacted Files & Components
                  </CardTitle>
                  <CardDescription>
                    Detailed tracking of which files, functions, and classes contain demographic data and will be affected by migration
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {migrationPlan.componentImpactAnalysis?.impactedFiles && migrationPlan.componentImpactAnalysis.impactedFiles.length > 0 ? (
                    <>
                      <div className="flex items-center gap-4 mb-4">
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {migrationPlan.componentImpactAnalysis.impactedFiles.length} Files Impacted
                        </Badge>
                        <Badge variant="outline" className="text-lg px-4 py-2">
                          {migrationPlan.componentImpactAnalysis.impactedFiles.filter(f => f.migrationPriority === 'CRITICAL').length} Critical Priority
                        </Badge>
                      </div>
                      
                      <div className="space-y-3">
                        {migrationPlan.componentImpactAnalysis.impactedFiles
                          .sort((a, b) => {
                            const priority = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
                            return priority[a.migrationPriority] - priority[b.migrationPriority];
                          })
                          .map((file, index) => (
                          <div key={index} className="border rounded-lg p-4 space-y-2" data-testid={`impacted-file-${index}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <FileCode className="h-4 w-4 text-muted-foreground" />
                                <code className="text-sm font-mono">{file.path}</code>
                              </div>
                              <Badge variant={getImpactColor(file.migrationPriority) as any}>
                                {file.migrationPriority} PRIORITY
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="font-semibold mb-1">Demographic Fields ({file.demographicFields.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {file.demographicFields.slice(0, 5).map((field, i) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                      {field}
                                    </Badge>
                                  ))}
                                  {file.demographicFields.length > 5 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{file.demographicFields.length - 5} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-semibold mb-1">Functions ({file.functions.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {file.functions.slice(0, 3).map((func, i) => (
                                    <Badge key={i} variant="outline" className="text-xs font-mono">
                                      {func}()
                                    </Badge>
                                  ))}
                                  {file.functions.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{file.functions.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              
                              <div>
                                <p className="font-semibold mb-1">Classes ({file.classes.length})</p>
                                <div className="flex flex-wrap gap-1">
                                  {file.classes.slice(0, 3).map((cls, i) => (
                                    <Badge key={i} variant="outline" className="text-xs font-mono">
                                      {cls}
                                    </Badge>
                                  ))}
                                  {file.classes.length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{file.classes.length - 3} more
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No detailed component impact data available. Upload a project with demographic fields to see detailed tracking.
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Code Transformations Tab */}
            <TabsContent value="transformations" className="space-y-4">
              {migrationPlan.componentImpactAnalysis?.transformationExamples && migrationPlan.componentImpactAnalysis.transformationExamples.length > 0 ? (
                migrationPlan.componentImpactAnalysis.transformationExamples.map((example, index) => (
                  <Card key={index} data-testid={`transformation-example-${index}`}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="h-5 w-5 text-purple-500" />
                        {example.fieldType} - {example.scenario}
                      </CardTitle>
                      <CardDescription>
                        {example.explanation}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="destructive" className="text-xs">POD - Legacy</Badge>
                            <span className="text-sm font-medium text-red-600">❌ Insecure</span>
                          </div>
                          <pre className="text-xs bg-red-50 dark:bg-red-950 p-4 rounded-lg overflow-x-auto border border-red-200 dark:border-red-800">
                            <code>{example.beforeCode}</code>
                          </pre>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="default" className="text-xs bg-green-600">POA - Modern</Badge>
                            <span className="text-sm font-medium text-green-600">✅ Secure</span>
                          </div>
                          <pre className="text-xs bg-green-50 dark:bg-green-950 p-4 rounded-lg overflow-x-auto border border-green-200 dark:border-green-800">
                            <code>{example.afterCode}</code>
                          </pre>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <Shield className="h-4 w-4 text-blue-500" />
                          Security Enhancements
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                          {example.securityEnhancements.map((enhancement, i) => (
                            <div key={i} className="flex items-start gap-2 text-sm p-2 bg-blue-50 dark:bg-blue-950 rounded">
                              <CheckCircle2 className="h-4 w-4 text-blue-500 mt-0.5 shrink-0" />
                              <span>{enhancement}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="py-8">
                    <div className="text-center text-muted-foreground">
                      No code transformation examples available. Transformation examples are generated when demographic fields are detected.
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Risks Tab */}
            <TabsContent value="risks" className="space-y-4">
              {migrationPlan.poaRecommendation.riskAssessment.map((risk, index) => (
                <Card key={index} data-testid={`card-risk-${index}`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                        {risk.category}
                      </span>
                      <Badge variant={getImpactColor(risk.impact) as any}>
                        {risk.impact}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div>
                      <p className="text-sm font-medium">Issue:</p>
                      <p className="text-sm text-muted-foreground">{risk.issue}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Mitigation:</p>
                      <p className="text-sm text-muted-foreground">{risk.mitigation}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            {/* Cost Analysis Tab */}
            <TabsContent value="cost" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">POD Annual Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-red-600">
                      {formatCurrency(migrationPlan.poaRecommendation.costBenefit.podAnnualCost)}
                    </p>
                    <div className="mt-4 space-y-2">
                      {Object.entries(migrationPlan.poaRecommendation.costBenefit.breakdown.podCosts).map(([item, cost]) => (
                        <div key={item} className="flex justify-between text-sm">
                          <span>{item}</span>
                          <span className="font-medium">{formatCurrency(cost)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">POA Annual Cost</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold text-green-600">
                      {formatCurrency(migrationPlan.poaRecommendation.costBenefit.poaAnnualCost)}
                    </p>
                    <div className="mt-4 space-y-2">
                      {Object.entries(migrationPlan.poaRecommendation.costBenefit.breakdown.poaCosts).map(([item, cost]) => (
                        <div key={item} className="flex justify-between text-sm">
                          <span>{item}</span>
                          <span className="font-medium">{formatCurrency(cost)}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Migration Investment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">
                      {formatCurrency(migrationPlan.poaRecommendation.costBenefit.migrationCost)}
                    </p>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between text-sm">
                        <span>Annual Savings</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(migrationPlan.poaRecommendation.costBenefit.annualSavings)}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>ROI Break-even</span>
                        <span className="font-medium">
                          {migrationPlan.poaRecommendation.costBenefit.roiMonths} months
                        </span>
                      </div>
                      <div className="pt-2 border-t">
                        <p className="text-sm font-medium text-center text-green-600">
                          {Math.round((migrationPlan.poaRecommendation.costBenefit.annualSavings / migrationPlan.poaRecommendation.costBenefit.podAnnualCost) * 100)}% cost reduction
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
}
