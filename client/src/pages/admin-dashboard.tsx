import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Users, 
  Activity, 
  TrendingUp, 
  Database, 
  Zap, 
  Clock,
  BarChart3,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  Brain,
  FileText,
  Server,
  Globe
} from "lucide-react";

interface AdminStats {
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    uptime: string;
    responseTime: number;
    errorRate: number;
  };
  userActivity: {
    activeUsers: number;
    totalUsers: number;
    newUsersToday: number;
    sessionDuration: number;
  };
  agentUsage: {
    totalAnalyses: number;
    successfulAnalyses: number;
    failedAnalyses: number;
    averageProcessingTime: number;
    projectTypes: {
      java: number;
      python: number;
      pyspark: number;
      mainframe: number;
    };
  };
  llmUsage: {
    openai: {
      requests: number;
      tokens: number;
      cost: number;
      averageResponseTime: number;
    };
    claude: {
      requests: number;
      tokens: number;
      cost: number;
      averageResponseTime: number;
    };
    gemini: {
      requests: number;
      tokens: number;
      cost: number;
      averageResponseTime: number;
    };
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    bandwidth: number;
  };
  recentActivities: Array<{
    id: string;
    type: 'analysis' | 'user_login' | 'error' | 'llm_request';
    message: string;
    timestamp: string;
    status: 'success' | 'warning' | 'error';
    user?: string;
  }>;
}

export default function AdminDashboard() {
  const [refreshing, setRefreshing] = useState(false);
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');

  const { data: stats, refetch } = useQuery<AdminStats>({
    queryKey: ['/api/admin/statistics', timeRange],
    queryFn: async () => {
      // Simulate API call with realistic admin data
      await new Promise(resolve => setTimeout(resolve, 1200));
      return {
        systemHealth: {
          status: 'healthy',
          uptime: '15 days, 4 hours',
          responseTime: 287,
          errorRate: 0.12
        },
        userActivity: {
          activeUsers: 47,
          totalUsers: 342,
          newUsersToday: 8,
          sessionDuration: 24.6
        },
        agentUsage: {
          totalAnalyses: 1247,
          successfulAnalyses: 1134,
          failedAnalyses: 113,
          averageProcessingTime: 3.4,
          projectTypes: {
            java: 567,
            python: 389,
            pyspark: 198,
            mainframe: 93
          }
        },
        llmUsage: {
          openai: {
            requests: 789,
            tokens: 1245680,
            cost: 186.42,
            averageResponseTime: 2.3
          },
          claude: {
            requests: 234,
            tokens: 456780,
            cost: 89.24,
            averageResponseTime: 3.1
          },
          gemini: {
            requests: 123,
            tokens: 234560,
            cost: 34.67,
            averageResponseTime: 1.8
          }
        },
        resourceUsage: {
          cpuUsage: 68,
          memoryUsage: 74,
          diskUsage: 45,
          bandwidth: 82
        },
        recentActivities: [
          {
            id: '1',
            type: 'analysis',
            message: 'Java project analysis completed for user john.smith',
            timestamp: '2 minutes ago',
            status: 'success',
            user: 'john.smith'
          },
          {
            id: '2',
            type: 'llm_request',
            message: 'OpenAI GPT-4o request processed - 1,234 tokens',
            timestamp: '5 minutes ago',
            status: 'success'
          },
          {
            id: '3',
            type: 'user_login',
            message: 'New user registered: sarah.johnson',
            timestamp: '12 minutes ago',
            status: 'success',
            user: 'sarah.johnson'
          },
          {
            id: '4',
            type: 'error',
            message: 'Failed to process PySpark project - timeout error',
            timestamp: '18 minutes ago',
            status: 'error',
            user: 'mike.wilson'
          },
          {
            id: '5',
            type: 'analysis',
            message: 'Mainframe analysis completed with insights generated',
            timestamp: '25 minutes ago',
            status: 'success',
            user: 'alice.brown'
          }
        ]
      } as AdminStats;
    },
    refetchInterval: 30000 // Refresh every 30 seconds
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
            <Shield className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-pulse" />
            <p className="text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const successRate = ((stats.agentUsage.successfulAnalyses / stats.agentUsage.totalAnalyses) * 100).toFixed(1);
  const totalLLMCost = stats.llmUsage.openai.cost + stats.llmUsage.claude.cost + stats.llmUsage.gemini.cost;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center">
            <Shield className="w-8 h-8 mr-3 text-blue-600" />
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            System monitoring and analytics for Zengent AI Platform
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            {(['1h', '24h', '7d', '30d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  timeRange === range
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                {range}
              </button>
            ))}
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
      </div>

      {/* System Health Status */}
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-green-600" />
              <span>System Health</span>
              <Badge variant={stats.systemHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {stats.systemHealth.status.toUpperCase()}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.systemHealth.uptime}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Uptime</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.systemHealth.responseTime}ms</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Avg Response Time</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.systemHealth.errorRate}%</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Error Rate</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.userActivity.activeUsers}</div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agents">Agent Usage</TabsTrigger>
          <TabsTrigger value="llm">LLM Analytics</TabsTrigger>
          <TabsTrigger value="system">System Resources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.agentUsage.totalAnalyses.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {successRate}% success rate
                </p>
                <Progress value={parseFloat(successRate)} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LLM Costs</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${totalLLMCost.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">
                  Total API costs ({timeRange})
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userActivity.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  {stats.userActivity.newUsersToday} new today
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">System Load</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourceUsage.cpuUsage}%</div>
                <p className="text-xs text-muted-foreground">
                  CPU utilization
                </p>
                <Progress value={stats.resourceUsage.cpuUsage} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activities</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-shrink-0">
                      {activity.status === 'success' && <CheckCircle className="w-5 h-5 text-green-600" />}
                      {activity.status === 'warning' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                      {activity.status === 'error' && <XCircle className="w-5 h-5 text-red-600" />}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.timestamp} {activity.user && `• ${activity.user}`}
                      </p>
                    </div>
                    <Badge variant={activity.type === 'error' ? 'destructive' : 'secondary'}>
                      {activity.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userActivity.totalUsers}</div>
                <p className="text-xs text-muted-foreground">Registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Eye className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userActivity.activeUsers}</div>
                <p className="text-xs text-muted-foreground">Currently online</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">New Users</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userActivity.newUsersToday}</div>
                <p className="text-xs text-muted-foreground">Today</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Session Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.userActivity.sessionDuration}m</div>
                <p className="text-xs text-muted-foreground">Average session</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Analysis Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Total Analyses</span>
                  <span className="text-sm text-muted-foreground">{stats.agentUsage.totalAnalyses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Successful</span>
                  <span className="text-sm text-green-600">{stats.agentUsage.successfulAnalyses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Failed</span>
                  <span className="text-sm text-red-600">{stats.agentUsage.failedAnalyses}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Success Rate</span>
                  <span className="text-sm text-muted-foreground">{successRate}%</span>
                </div>
                <Progress value={parseFloat(successRate)} className="mt-4" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Project Types Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(stats.agentUsage.projectTypes).map(([type, count]) => (
                  <div key={type} className="space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium capitalize">{type}</span>
                      <span className="text-sm text-muted-foreground">{count} analyses</span>
                    </div>
                    <Progress 
                      value={(count / stats.agentUsage.totalAnalyses) * 100} 
                      className="h-2" 
                    />
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="llm" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries(stats.llmUsage).map(([provider, usage]) => (
              <Card key={provider}>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="w-4 h-4" />
                    <span className="capitalize">{provider}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Requests</span>
                    <span className="text-sm text-muted-foreground">{usage.requests.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Tokens</span>
                    <span className="text-sm text-muted-foreground">{usage.tokens.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Cost</span>
                    <span className="text-sm text-muted-foreground">${usage.cost.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Avg Response</span>
                    <span className="text-sm text-muted-foreground">{usage.averageResponseTime}s</span>
                  </div>
                  <div className="pt-2">
                    <Progress 
                      value={(usage.cost / totalLLMCost) * 100} 
                      className="h-2" 
                    />
                    <p className="text-xs text-muted-foreground mt-1 text-center">
                      {((usage.cost / totalLLMCost) * 100).toFixed(1)}% of total cost
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPU Usage</CardTitle>
                <Server className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourceUsage.cpuUsage}%</div>
                <Progress value={stats.resourceUsage.cpuUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourceUsage.memoryUsage}%</div>
                <Progress value={stats.resourceUsage.memoryUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Disk Usage</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourceUsage.diskUsage}%</div>
                <Progress value={stats.resourceUsage.diskUsage} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bandwidth</CardTitle>
                <Globe className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.resourceUsage.bandwidth}%</div>
                <Progress value={stats.resourceUsage.bandwidth} className="mt-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}