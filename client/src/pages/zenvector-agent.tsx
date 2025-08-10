import { useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import { 
  Brain, 
  Search, 
  Users, 
  Code, 
  Database,
  TrendingUp,
  BarChart3,
  Zap,
  Target,
  Eye,
  Activity
} from 'lucide-react';

interface ZenVectorStats {
  agentName: string;
  collections: {
    codeSimilarity: number;
    semanticSearch: number;
    demographicData: number;
  };
  totalVectors: number;
  capabilities: string[];
  embeddingModel: string;
  vectorDatabase: string;
}

interface SimilarCodeMatch {
  rank: number;
  className: string;
  projectId: string;
  type: string;
  package: string;
  similarityScore: number;
  codePreview: string;
  methodsCount: number;
}

interface SemanticResult {
  type: string;
  title: string;
  content: string;
  relevanceScore: number;
  metadata: any;
}

export default function ZenVectorAgent() {
  const [activeTab, setActiveTab] = useState('overview');
  const [codeQuery, setCodeQuery] = useState('');
  const [semanticQuery, setSemanticQuery] = useState('');
  const [demographicQuery, setDemographicQuery] = useState('');
  const [demographicData, setDemographicData] = useState('');
  const [similarResults, setSimilarResults] = useState<SimilarCodeMatch[]>([]);
  const [semanticResults, setSemanticResults] = useState<SemanticResult[]>([]);
  const [demographicResults, setDemographicResults] = useState<any[]>([]);
  
  const { toast } = useToast();

  // Get ZenVector agent statistics
  const { data: stats, isLoading: statsLoading } = useQuery<ZenVectorStats>({
    queryKey: ['/api/zenvector/stats'],
    refetchInterval: 30000
  });

  // Find similar code mutation
  const findSimilarMutation = useMutation({
    mutationFn: async (data: { query: string; projectId?: string; topK?: number }) => {
      const response = await fetch('/api/zenvector/find-similar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Similar code search failed');
      return response.json();
    },
    onSuccess: (data) => {
      setSimilarResults(data.similar_code || []);
      toast({
        title: "Code Similarity Search Complete",
        description: `Found ${data.total_matches || 0} similar code patterns`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Semantic search mutation
  const semanticSearchMutation = useMutation({
    mutationFn: async (data: { query: string; searchType?: string; topK?: number }) => {
      const response = await fetch('/api/zenvector/semantic-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Semantic search failed');
      return response.json();
    },
    onSuccess: (data) => {
      setSemanticResults(data.results || []);
      toast({
        title: "Semantic Search Complete",
        description: `Found ${data.totalFound || 0} relevant matches`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Demographic search mutation
  const demographicSearchMutation = useMutation({
    mutationFn: async (data: { query: string; topK?: number }) => {
      const response = await fetch('/api/zenvector/search-demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Demographic search failed');
      return response.json();
    },
    onSuccess: (data) => {
      setDemographicResults(data.matches || []);
      toast({
        title: "Demographic Search Complete",
        description: `Found ${data.total_matches || 0} matching records`,
      });
    },
    onError: (error) => {
      toast({
        title: "Search Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Analyze demographics mutation
  const analyzeDemographicsMutation = useMutation({
    mutationFn: async (data: { demographicData: any[] }) => {
      const response = await fetch('/api/zenvector/analyze-demographics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Demographic analysis failed');
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Demographic Analysis Complete",
        description: `Analyzed ${data.recordsProcessed || 0} records, found ${data.patternsFound || 0} patterns`,
      });
    },
    onError: (error) => {
      toast({
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  const handleSimilarCodeSearch = () => {
    if (!codeQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a code query to search for similarities",
        variant: "destructive",
      });
      return;
    }
    findSimilarMutation.mutate({ query: codeQuery, topK: 5 });
  };

  const handleSemanticSearch = () => {
    if (!semanticQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a search query",
        variant: "destructive",
      });
      return;
    }
    semanticSearchMutation.mutate({ query: semanticQuery, searchType: 'all', topK: 10 });
  };

  const handleDemographicSearch = () => {
    if (!demographicQuery.trim()) {
      toast({
        title: "Query Required",
        description: "Please enter a demographic search query",
        variant: "destructive",
      });
      return;
    }
    demographicSearchMutation.mutate({ query: demographicQuery, topK: 10 });
  };

  const handleDemographicAnalysis = () => {
    if (!demographicData.trim()) {
      toast({
        title: "Data Required",
        description: "Please enter demographic data to analyze",
        variant: "destructive",
      });
      return;
    }

    try {
      const parsedData = JSON.parse(demographicData);
      if (!Array.isArray(parsedData)) {
        throw new Error('Data must be an array');
      }
      analyzeDemographicsMutation.mutate({ demographicData: parsedData });
    } catch (error) {
      toast({
        title: "Invalid Data Format",
        description: "Please provide valid JSON array format",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center space-x-2">
            <Brain className="w-8 h-8 text-purple-600" />
            <span>ZenVector Agent</span>
          </h1>
          <p className="text-gray-600 mt-1">
            Advanced AI Agent with Vector Database Integration
          </p>
        </div>
        <Badge variant="secondary" className="px-3 py-1">
          <Zap className="w-4 h-4 mr-1" />
          Active
        </Badge>
      </div>

      {/* Agent Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <span>Agent Overview</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statsLoading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="grid grid-cols-3 gap-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          ) : stats ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database: {stats.vectorDatabase}</span>
                <span className="text-sm text-gray-600">Model: {stats.embeddingModel}</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <span className="text-sm font-medium">Code Similarity</span>
                  </div>
                  <p className="text-2xl font-bold text-blue-600 mt-1">
                    {stats.collections.codeSimilarity}
                  </p>
                </div>
                
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Search className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium">Semantic Search</span>
                  </div>
                  <p className="text-2xl font-bold text-green-600 mt-1">
                    {stats.collections.semanticSearch}
                  </p>
                </div>
                
                <div className="bg-purple-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-medium">Demographics</span>
                  </div>
                  <p className="text-2xl font-bold text-purple-600 mt-1">
                    {stats.collections.demographicData}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mt-4">
                {stats.capabilities.map((capability, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {capability}
                  </Badge>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500">Unable to load agent statistics</p>
          )}
        </CardContent>
      </Card>

      {/* Main Interface */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="similarity">Code Similarity</TabsTrigger>
          <TabsTrigger value="semantic">Semantic Search</TabsTrigger>
          <TabsTrigger value="demographics">Demographics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>ZenVector Capabilities</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Code className="w-5 h-5 text-blue-600" />
                    <span>Code Similarity Detection</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Find similar code patterns across projects using advanced vector embeddings.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Search className="w-5 h-5 text-green-600" />
                    <span>Semantic Code Search</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Search code using natural language queries for intuitive discovery.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <span>Demographic Analysis</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Analyze demographic data patterns and perform intelligent clustering.
                  </p>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold flex items-center space-x-2">
                    <TrendingUp className="w-5 h-5 text-orange-600" />
                    <span>Pattern Recognition</span>
                  </h3>
                  <p className="text-sm text-gray-600 mt-2">
                    Identify patterns and relationships across multi-modal data sources.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="similarity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Code Similarity Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Code Query</label>
                <Textarea
                  placeholder="Enter code snippet or description to find similar code..."
                  value={codeQuery}
                  onChange={(e) => setCodeQuery(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
              
              <Button 
                onClick={handleSimilarCodeSearch}
                disabled={findSimilarMutation.isPending}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {findSimilarMutation.isPending ? 'Searching...' : 'Find Similar Code'}
              </Button>

              {similarResults.length > 0 && (
                <ScrollArea className="h-[400px] mt-4">
                  <div className="space-y-3">
                    {similarResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">#{result.rank} {result.className}</h4>
                          <Badge variant="outline">{Math.round(result.similarityScore * 100)}% match</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">
                          Type: {result.type} | Package: {result.package} | Methods: {result.methodsCount}
                        </p>
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                          {result.codePreview}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="semantic" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Semantic Search</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search Query</label>
                <Input
                  placeholder="Enter natural language query..."
                  value={semanticQuery}
                  onChange={(e) => setSemanticQuery(e.target.value)}
                />
              </div>
              
              <Button 
                onClick={handleSemanticSearch}
                disabled={semanticSearchMutation.isPending}
                className="w-full"
              >
                <Search className="w-4 h-4 mr-2" />
                {semanticSearchMutation.isPending ? 'Searching...' : 'Semantic Search'}
              </Button>

              {semanticResults.length > 0 && (
                <ScrollArea className="h-[400px] mt-4">
                  <div className="space-y-3">
                    {semanticResults.map((result, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{result.title}</h4>
                          <Badge variant="outline">{Math.round(result.relevanceScore * 100)}% relevant</Badge>
                        </div>
                        <p className="text-sm text-gray-600">{result.content}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="demographics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Analyze Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Demographic Data (JSON)</label>
                  <Textarea
                    placeholder='[{"age": 25, "department": "Engineering"}, {"age": 30, "department": "Sales"}]'
                    value={demographicData}
                    onChange={(e) => setDemographicData(e.target.value)}
                    className="min-h-[150px] font-mono text-sm"
                  />
                </div>
                
                <Button 
                  onClick={handleDemographicAnalysis}
                  disabled={analyzeDemographicsMutation.isPending}
                  className="w-full"
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  {analyzeDemographicsMutation.isPending ? 'Analyzing...' : 'Analyze Patterns'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Search Demographics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search Query</label>
                  <Input
                    placeholder="Find demographic patterns..."
                    value={demographicQuery}
                    onChange={(e) => setDemographicQuery(e.target.value)}
                  />
                </div>
                
                <Button 
                  onClick={handleDemographicSearch}
                  disabled={demographicSearchMutation.isPending}
                  className="w-full"
                >
                  <Users className="w-4 h-4 mr-2" />
                  {demographicSearchMutation.isPending ? 'Searching...' : 'Search Demographics'}
                </Button>

                {demographicResults.length > 0 && (
                  <ScrollArea className="h-[200px] mt-4">
                    <div className="space-y-3">
                      {demographicResults.map((result, index) => (
                        <div key={index} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">Match #{index + 1}</span>
                            <Badge variant="outline">{Math.round(result.relevanceScore * 100)}%</Badge>
                          </div>
                          <p className="text-xs text-gray-600">{result.content}</p>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}