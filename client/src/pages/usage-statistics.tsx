import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Activity, 
  Database, 
  Zap, 
  TrendingUp, 
  Download, 
  Upload, 
  Clock,
  BarChart3,
  RefreshCw
} from "lucide-react";

interface UsageStats {
  tokens: {
    used: number;
    limit: number;
    cost: number;
  };
  dataTransfer: {
    uploaded: number;
    downloaded: number;
    totalBandwidth: number;
  };
  openaiUsage: {
    requests: number;
    tokens: number;
    cost: number;
    models: Record<string, number>;
  };
  analysisStats: {
    totalProjects: number;
    completedAnalyses: number;
    averageProcessingTime: number;
    successRate: number;
  };
}

export default function UsageStatistics() {
  const [refreshing, setRefreshing] = useState(false);

  // Mock data - in production this would come from your API
  const { data: stats, refetch } = useQuery<UsageStats>({
    queryKey: ['/api/usage-statistics'],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      return {
        tokens: {
          used: 85420,
          limit: 100000,
          cost: 12.45
        },
        dataTransfer: {
          uploaded: 2.3, // GB
          downloaded: 1.8, // GB
          totalBandwidth: 10.0 // GB limit
        },
        openaiUsage: {
          requests: 247,
          tokens: 45680,
          cost: 8.92,
          models: {
            'gpt-4o': 35240,
            'gpt-4o-mini': 10440
          }
        },
        analysisStats: {
          totalProjects: 18,
          completedAnalyses: 16,
          averageProcessingTime: 3.2,
          successRate: 88.9
        }
      } as UsageStats;
    }
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (!stats) {
    return (
      <div className="container mx-auto px-6 py-8">
        <div className="flex items-center justify-center min-h-96">
          <div className="text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading usage statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  const tokenUsagePercent = (stats.tokens.used / stats.tokens.limit) * 100;
  const dataUsagePercent = ((stats.dataTransfer.uploaded + stats.dataTransfer.downloaded) / stats.dataTransfer.totalBandwidth) * 100;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Usage Statistics
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Monitor your token usage, data transfer, and OpenAI API consumption
          </p>
        </div>
        <Button 
          onClick={handleRefresh} 
          variant="outline"
          disabled={refreshing}
          className="flex items-center space-x-2"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tokens">Token Usage</TabsTrigger>
          <TabsTrigger value="data">Data Transfer</TabsTrigger>
          <TabsTrigger value="openai">OpenAI Usage</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Token Usage</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.tokens.used.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.tokens.limit.toLocaleString()} tokens
                </p>
                <Progress value={tokenUsagePercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Transfer</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{(stats.dataTransfer.uploaded + stats.dataTransfer.downloaded).toFixed(1)} GB</div>
                <p className="text-xs text-muted-foreground">
                  of {stats.dataTransfer.totalBandwidth} GB limit
                </p>
                <Progress value={dataUsagePercent} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">OpenAI Cost</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.openaiUsage.cost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.openaiUsage.requests} requests
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.analysisStats.successRate}%</div>
                <p className="text-xs text-muted-foreground">
                  {stats.analysisStats.completedAnalyses} of {stats.analysisStats.totalProjects} projects
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Token Usage Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Used Tokens</span>
                <span className="text-sm text-muted-foreground">{stats.tokens.used.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Available Tokens</span>
                <span className="text-sm text-muted-foreground">{(stats.tokens.limit - stats.tokens.used).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total Cost</span>
                <span className="text-sm text-muted-foreground">${stats.tokens.cost.toFixed(2)}</span>
              </div>
              <Progress value={tokenUsagePercent} className="mt-4" />
              <p className="text-xs text-muted-foreground text-center">
                {tokenUsagePercent.toFixed(1)}% of monthly token limit used
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Upload className="w-4 h-4" />
                  <span>Data Uploaded</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">
                  {stats.dataTransfer.uploaded.toFixed(1)} GB
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Project files and assets
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Download className="w-4 h-4" />
                  <span>Data Downloaded</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {stats.dataTransfer.downloaded.toFixed(1)} GB
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Reports and analysis results
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="openai" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>OpenAI API Usage</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Requests</span>
                  <span className="text-sm text-muted-foreground">{stats.openaiUsage.requests}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Tokens Used</span>
                  <span className="text-sm text-muted-foreground">{stats.openaiUsage.tokens.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Cost</span>
                  <span className="text-sm text-muted-foreground">${stats.openaiUsage.cost.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Average Cost/Request</span>
                  <span className="text-sm text-muted-foreground">${(stats.openaiUsage.cost / stats.openaiUsage.requests).toFixed(3)}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Model Usage Breakdown</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.openaiUsage.models).map(([model, tokens]) => (
                  <div key={model} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">{model}</span>
                      <span className="text-sm text-muted-foreground">{tokens.toLocaleString()} tokens</span>
                    </div>
                    <Progress 
                      value={(tokens / stats.openaiUsage.tokens) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}