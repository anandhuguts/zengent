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
  Info,
  TrendingUp,
  Plus
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
          <div className="w-16 h-16 bg-gradient-to-br from-[#ef476f] to-[#ffd166] rounded-xl flex items-center justify-center shadow-lg">
            <Coffee className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-[#ef476f] to-[#06d6a0] bg-clip-text text-transparent">
              Java Agent
            </h1>
            <p className="text-gray-600">
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
                {/* Admin Template Header */}
                <div className="flex justify-between items-center p-6 bg-gradient-to-r from-[#ef476f]/10 via-[#ffd166]/10 to-[#118ab2]/10 rounded-xl border-l-4 border-l-[#ef476f]">
                  <div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-[#ef476f] to-[#118ab2] bg-clip-text text-transparent">
                      Analytics Dashboard
                    </h2>
                    <p className="text-gray-600 mt-1">Comprehensive Java Application Analysis</p>
                  </div>
                  <Button onClick={handleNewAnalysis} className="bg-gradient-to-r from-[#ef476f] to-[#ffd166] hover:from-[#ef476f]/80 hover:to-[#ffd166]/80 text-white border-0">
                    <Plus className="w-4 h-4 mr-2" />
                    New Analysis
                  </Button>
                </div>

                {/* Key Metrics Grid - Admin Style */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <Card className="border-l-4 border-l-[#ef476f] bg-gradient-to-br from-[#ef476f]/10 to-transparent hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Total Classes</p>
                          <p className="text-3xl font-bold text-[#ef476f]">{analysisResult.qualityMetrics.totalClasses}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#ef476f]/20 rounded-lg flex items-center justify-center">
                          <Code2 className="w-6 h-6 text-[#ef476f]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                          <span>Active codebase</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#ffd166] bg-gradient-to-br from-[#ffd166]/10 to-transparent hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Controllers</p>
                          <p className="text-3xl font-bold text-[#ffd166]">{analysisResult.qualityMetrics.controllers}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#ffd166]/20 rounded-lg flex items-center justify-center">
                          <Cpu className="w-6 h-6 text-[#ffd166]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                          <span>REST endpoints</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#118ab2] bg-gradient-to-br from-[#118ab2]/10 to-transparent hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Services</p>
                          <p className="text-3xl font-bold text-[#118ab2]">{analysisResult.qualityMetrics.services}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#118ab2]/20 rounded-lg flex items-center justify-center">
                          <Zap className="w-6 h-6 text-[#118ab2]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                          <span>Business logic</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#073b4c] bg-gradient-to-br from-[#073b4c]/10 to-transparent hover:shadow-lg transition-all">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">Entities</p>
                          <p className="text-3xl font-bold text-[#073b4c]">{analysisResult.qualityMetrics.entities}</p>
                        </div>
                        <div className="w-12 h-12 bg-[#073b4c]/20 rounded-lg flex items-center justify-center">
                          <Database className="w-6 h-6 text-[#073b4c]" />
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <TrendingUp className="w-3 h-3 mr-1 text-green-500" />
                          <span>Data models</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Analysis Summary */}
                <Card className="bg-gradient-to-r from-white to-gray-50 border-t-4 border-t-[#ef476f]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart4 className="w-5 h-5 text-[#ef476f]" />
                      Analysis Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-700 leading-relaxed">
                      {analysisResult.projectOverview}
                    </p>
                  </CardContent>
                </Card>

                {/* Architecture & Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="border-l-4 border-l-[#ffd166] bg-gradient-to-br from-[#ffd166]/5 to-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#ffd166]">
                        <GitBranch className="w-5 h-5" />
                        Architecture Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {analysisResult.architecturePatterns.map((pattern, index) => (
                          <Badge key={index} className="bg-[#ffd166]/20 text-[#ffd166] border-[#ffd166]/30 hover:bg-[#ffd166]/30">
                            {pattern}
                          </Badge>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-l-4 border-l-[#118ab2] bg-gradient-to-br from-[#118ab2]/5 to-white">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-[#118ab2]">
                        <Coffee className="w-5 h-5" />
                        Spring Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {analysisResult.springFeatures.map((feature, index) => (
                          <div key={index} className="flex items-center gap-3">
                            <div className="w-2 h-2 bg-[#118ab2] rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">{feature}</span>
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
                  <Card className="border-l-4 border-l-[#ef476f] bg-gradient-to-br from-[#ef476f]/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-[#ef476f]">
                        {analysisResult.qualityMetrics.totalClasses}
                      </div>
                      <p className="text-sm text-gray-600">Total Classes</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#ffd166] bg-gradient-to-br from-[#ffd166]/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-[#ffd166]">
                        {analysisResult.qualityMetrics.controllers}
                      </div>
                      <p className="text-sm text-gray-600">Controllers</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#06d6a0] bg-gradient-to-br from-[#06d6a0]/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-[#06d6a0]">
                        {analysisResult.qualityMetrics.services}
                      </div>
                      <p className="text-sm text-gray-600">Services</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#118ab2] bg-gradient-to-br from-[#118ab2]/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-[#118ab2]">
                        {analysisResult.qualityMetrics.repositories}
                      </div>
                      <p className="text-sm text-gray-600">Repositories</p>
                    </CardContent>
                  </Card>
                  
                  <Card className="border-l-4 border-l-[#073b4c] bg-gradient-to-br from-[#073b4c]/10 to-transparent">
                    <CardContent className="pt-6 text-center">
                      <div className="text-2xl font-bold text-[#073b4c]">
                        {analysisResult.qualityMetrics.entities}
                      </div>
                      <p className="text-sm text-gray-600">Entities</p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="bg-gradient-to-r from-[#ef476f]/5 via-[#ffd166]/5 to-[#06d6a0]/5 border-l-4 border-l-gradient-to-b border-l-[#ef476f]">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#ef476f] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#ffd166] rounded-full"></div>
                      <div className="w-2 h-2 bg-[#06d6a0] rounded-full"></div>
                      Code Quality Score
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-medium">Overall Quality</span>
                        <span className="text-2xl font-bold bg-gradient-to-r from-[#ef476f] to-[#06d6a0] bg-clip-text text-transparent">
                          {analysisResult.qualityMetrics.codeQualityScore}/100
                        </span>
                      </div>
                      <div className="relative">
                        <Progress value={analysisResult.qualityMetrics.codeQualityScore} className="w-full h-3" />
                        <div className="absolute inset-0 bg-gradient-to-r from-[#ef476f] via-[#ffd166] to-[#06d6a0] rounded-full opacity-80" 
                             style={{width: `${analysisResult.qualityMetrics.codeQualityScore}%`}}>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">
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