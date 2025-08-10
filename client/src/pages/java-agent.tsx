import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { 
  Upload, 
  FileCode, 
  Cpu, 
  Database, 
  Settings, 
  Eye, 
  Download,
  Code2,
  Coffee,
  GitBranch,
  Shield,
  Zap,
  BarChart4,
  FileText,
  CheckCircle,
  AlertCircle,
  Info
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import Layout from "@/components/layout";
import { useToast } from "@/hooks/use-toast";
import agentLogo from "@assets/agent_1754854183020.png";

interface JavaAnalysisResult {
  projectOverview: string;
  architecturePatterns: string[];
  springFeatures: string[];
  dependencies: string[];
  restEndpoints: {
    path: string;
    method: string;
    controller: string;
    description: string;
  }[];
  jpaEntities: {
    name: string;
    table: string;
    fields: string[];
    relationships: string[];
  }[];
  qualityMetrics: {
    totalClasses: number;
    controllers: number;
    services: number;
    repositories: number;
    entities: number;
    codeQualityScore: number;
  };
}

export default function JavaAgent() {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [analysisResult, setAnalysisResult] = useState<JavaAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");
  const [customPrompt, setCustomPrompt] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const analyzeJavaMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      const response = await fetch('/api/java-agent/analyze', {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Analysis failed');
      }
      return response.json();
    },
    onSuccess: (data) => {
      setAnalysisResult(data);
      setActiveTab("overview");
      setIsAnalyzing(false);
      toast({
        title: "Analysis Complete",
        description: "Your Java project has been analyzed successfully.",
      });
    },
    onError: (error) => {
      setIsAnalyzing(false);
      toast({
        title: "Analysis Failed", 
        description: "Failed to analyze Java project. Please try again.",
        variant: "destructive",
      });
    }
  });

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.name.endsWith('.zip')) {
      setUploadedFile(file);
    } else {
      toast({
        title: "Invalid File",
        description: "Please upload a ZIP file containing your Java project.",
        variant: "destructive",
      });
    }
  };

  const handleAnalyze = async () => {
    if (!uploadedFile) {
      toast({
        title: "No File Selected",
        description: "Please select a ZIP file to analyze.",
        variant: "destructive",
      });
      return;
    }

    setIsAnalyzing(true);
    const formData = new FormData();
    formData.append('zipFile', uploadedFile);
    if (customPrompt.trim()) {
      formData.append('customPrompt', customPrompt);
    }

    analyzeJavaMutation.mutate(formData);
  };

  const handleNewAnalysis = () => {
    setUploadedFile(null);
    setAnalysisResult(null);
    setActiveTab("upload");
    setCustomPrompt("");
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <img src={agentLogo} alt="Java Agent" className="w-16 h-16" />
          <div>
            <h1 className="text-3xl font-bold text-foreground">Java Agent</h1>
            <p className="text-muted-foreground">
              Comprehensive analysis of Java applications with Spring Boot frameworks, Maven/Gradle builds, and enterprise patterns
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="w-4 h-4" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="overview" disabled={!analysisResult}>
              <Info className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="architecture" disabled={!analysisResult}>
              <Cpu className="w-4 h-4" />
              Architecture
            </TabsTrigger>
            <TabsTrigger value="endpoints" disabled={!analysisResult}>
              <FileCode className="w-4 h-4" />
              REST APIs
            </TabsTrigger>
            <TabsTrigger value="entities" disabled={!analysisResult}>
              <Database className="w-4 h-4" />
              JPA Entities
            </TabsTrigger>
            <TabsTrigger value="metrics" disabled={!analysisResult}>
              <BarChart4 className="w-4 h-4" />
              Metrics
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coffee className="w-5 h-5" />
                  Java Project Upload
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="border-2 border-dashed border-muted-foreground/20 rounded-lg p-8 text-center">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">Upload your Java ZIP file</h3>
                    <p className="text-muted-foreground">
                      Supports Spring Boot, Maven/Gradle projects with source code
                    </p>
                  </div>
                  <Input
                    type="file"
                    accept=".zip"
                    onChange={handleFileUpload}
                    className="mt-4 max-w-sm mx-auto"
                  />
                  {uploadedFile && (
                    <div className="mt-4 p-3 bg-green-50 dark:bg-green-950 rounded-md">
                      <p className="text-green-700 dark:text-green-300">
                        ✓ {uploadedFile.name} ({(uploadedFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <Label htmlFor="customPrompt">Custom Analysis Prompt (Optional)</Label>
                  <Textarea
                    id="customPrompt"
                    placeholder="Add specific instructions for the AI analysis, e.g., 'Focus on security patterns' or 'Analyze performance bottlenecks'"
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  disabled={!uploadedFile || isAnalyzing}
                  className="w-full"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Zap className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing Java Project...
                    </>
                  ) : (
                    <>
                      <Coffee className="w-4 h-4 mr-2" />
                      Analyze Java Project
                    </>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <Progress value={66} className="w-full" />
                    <p className="text-sm text-muted-foreground text-center">
                      Parsing Java classes and analyzing Spring patterns...
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Java Agent Features */}
            <Card>
              <CardHeader>
                <CardTitle>Java Agent Capabilities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                      <Code2 className="w-4 h-4 mr-1" />
                      Spring Framework
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Detects Spring Boot annotations, configuration, and bean definitions
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                      <Database className="w-4 h-4 mr-1" />
                      JPA/Hibernate
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Maps entity relationships and database configurations
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                      <FileCode className="w-4 h-4 mr-1" />
                      REST APIs
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Documents endpoints, request mappings, and controller structure
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-fit">
                      <GitBranch className="w-4 h-4 mr-1" />
                      Dependencies
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Analyzes Maven/Gradle dependencies and project structure
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Results Tabs */}
          {analysisResult && (
            <>
              <TabsContent value="overview" className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">Project Overview</h2>
                  <Button onClick={handleNewAnalysis} variant="outline">
                    New Analysis
                  </Button>
                </div>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Analysis Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysisResult.projectOverview}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Architecture Patterns</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.architecturePatterns.map((pattern, index) => (
                          <Badge key={index} variant="secondary">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Spring Features</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysisResult.springFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-500" />
                            <span className="text-sm">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="architecture" className="space-y-6">
                <h2 className="text-2xl font-bold">Architecture Analysis</h2>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Dependencies</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {analysisResult.dependencies.map((dep, index) => (
                        <Badge key={index} variant="outline">
                          {dep}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="endpoints" className="space-y-6">
                <h2 className="text-2xl font-bold">REST API Endpoints</h2>
                
                <div className="space-y-4">
                  {analysisResult.restEndpoints.map((endpoint, index) => (
                    <Card key={index}>
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4 mb-2">
                          <Badge 
                            variant={endpoint.method === 'GET' ? 'secondary' : endpoint.method === 'POST' ? 'default' : 'outline'}
                          >
                            {endpoint.method}
                          </Badge>
                          <code className="text-sm bg-muted px-2 py-1 rounded">
                            {endpoint.path}
                          </code>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Controller: {endpoint.controller}
                        </p>
                        <p className="text-sm">{endpoint.description}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="entities" className="space-y-6">
                <h2 className="text-2xl font-bold">JPA Entities</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {analysisResult.jpaEntities.map((entity, index) => (
                    <Card key={index}>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Database className="w-5 h-5" />
                          {entity.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium">Table</Label>
                          <p className="text-sm text-muted-foreground">{entity.table}</p>
                        </div>
                        
                        <div>
                          <Label className="text-sm font-medium">Fields</Label>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {entity.fields.map((field, fieldIndex) => (
                              <Badge key={fieldIndex} variant="outline" className="text-xs">
                                {field}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        
                        {entity.relationships.length > 0 && (
                          <div>
                            <Label className="text-sm font-medium">Relationships</Label>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {entity.relationships.map((rel, relIndex) => (
                                <Badge key={relIndex} variant="secondary" className="text-xs">
                                  {rel}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="metrics" className="space-y-6">
                <h2 className="text-2xl font-bold">Quality Metrics</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-primary">
                        {analysisResult.qualityMetrics.totalClasses}
                      </div>
                      <p className="text-sm text-muted-foreground">Total Classes</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analysisResult.qualityMetrics.controllers}
                      </div>
                      <p className="text-sm text-muted-foreground">Controllers</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analysisResult.qualityMetrics.services}
                      </div>
                      <p className="text-sm text-muted-foreground">Services</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analysisResult.qualityMetrics.repositories}
                      </div>
                      <p className="text-sm text-muted-foreground">Repositories</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analysisResult.qualityMetrics.entities}
                      </div>
                      <p className="text-sm text-muted-foreground">Entities</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Code Quality Score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span>Overall Quality</span>
                        <span className="font-bold">{analysisResult.qualityMetrics.codeQualityScore}/100</span>
                      </div>
                      <Progress value={analysisResult.qualityMetrics.codeQualityScore} className="w-full" />
                      <p className="text-sm text-muted-foreground">
                        Based on architectural patterns, Spring best practices, and code organization
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </>
          )}
        </Tabs>
      </div>
    </Layout>
  );
}