import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Shield, AlertTriangle, Info, CheckCircle, XCircle, ArrowLeft, Play, FileCode, TrendingUp, Download, FileText } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

interface CWEVulnerability {
  id: string;
  cweId: string;
  cweName: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  filePath: string;
  lineNumber?: number;
  codeSnippet?: string;
  description: string;
  recommendation?: string;
  owasp?: string;
  confidence: 'high' | 'medium' | 'low';
}

interface CWEScan {
  id: string;
  projectId: string;
  status: string;
  startedAt: string;
  completedAt?: string;
  totalFiles: number;
  scannedFiles: number;
  totalVulnerabilities: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  infoCount: number;
  vulnerabilities?: CWEVulnerability[];
  qualityMetrics?: string;
}

interface QualityMetrics {
  functionalSuitability: number;
  performanceEfficiency: number;
  compatibility: number;
  usability: number;
  reliability: number;
  security: number;
  maintainability: number;
  portability: number;
  overallScore: number;
  securityGrade: string;
}

interface CWERule {
  id: string;
  name: string;
  cweId: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  category: string;
  owasp?: string;
  description: string;
  recommendation: string;
  impact?: string;
  languages: string[];
  confidence: 'high' | 'medium' | 'low';
}

const SEVERITY_COLORS: Record<string, string> = {
  critical: '#dc2626',
  high: '#ea580c',
  medium: '#f59e0b',
  low: '#3b82f6',
  info: '#6b7280',
};

const SEVERITY_LABELS: Record<string, string> = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export default function CWESecurityScan() {
  const [, navigate] = useLocation();
  const [selectedSeverity, setSelectedSeverity] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const urlParams = new URLSearchParams(window.location.search);
  const projectId = urlParams.get('projectId');
  const scanId = urlParams.get('scanId');

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  const { data: scans, isLoading: scansLoading } = useQuery<CWEScan[]>({
    queryKey: ['/api/projects', projectId, 'cwe-scans'],
    enabled: !!projectId,
  });

  const { data: currentScan, isLoading: scanLoading } = useQuery<CWEScan>({
    queryKey: ['/api/cwe-scans', scanId],
    enabled: !!scanId,
  });

  const { data: qualityMetrics, isLoading: metricsLoading } = useQuery<QualityMetrics>({
    queryKey: ['/api/projects', projectId, 'quality-metrics'],
    enabled: !!projectId,
  });

  const { data: cweRules, isLoading: rulesLoading } = useQuery<CWERule[]>({
    queryKey: ['/api/cwe-rules'],
  });

  const startScanMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest(`/api/projects/${projectId}/cwe-scan`, 'POST', {});
    },
    onSuccess: (data: { scanId: string }) => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'cwe-scans'] });
      navigate(`/cwe-security-scan?projectId=${projectId}&scanId=${data.scanId}`);
    },
  });

  if (!projectId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <Alert>
          <AlertDescription>No project selected. Please select a project first.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const isLoading = projectLoading || scansLoading || (scanId && scanLoading) || metricsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-20 w-full" data-testid="skeleton-header" />
          <Skeleton className="h-96 w-full" data-testid="skeleton-content" />
        </div>
      </div>
    );
  }

  const latestScan = scanId ? currentScan : scans?.[0];
  const vulnerabilities = latestScan?.vulnerabilities || [];

  const filteredVulnerabilities = vulnerabilities.filter((v) => {
    if (selectedSeverity && v.severity !== selectedSeverity) return false;
    if (selectedCategory && v.category !== selectedCategory) return false;
    return true;
  });

  const severityData = [
    { name: 'Critical', value: latestScan?.criticalCount || 0, color: SEVERITY_COLORS.critical },
    { name: 'High', value: latestScan?.highCount || 0, color: SEVERITY_COLORS.high },
    { name: 'Medium', value: latestScan?.mediumCount || 0, color: SEVERITY_COLORS.medium },
    { name: 'Low', value: latestScan?.lowCount || 0, color: SEVERITY_COLORS.low },
    { name: 'Info', value: latestScan?.infoCount || 0, color: SEVERITY_COLORS.info },
  ];

  const categoryData = vulnerabilities.reduce((acc: Record<string, number>, v) => {
    acc[v.category] = (acc[v.category] || 0) + 1;
    return acc;
  }, {});

  const categoryChartData = Object.entries(categoryData).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }));

  const iso25010Data = qualityMetrics
    ? [
        { subject: 'Security', score: qualityMetrics.security },
        { subject: 'Reliability', score: qualityMetrics.reliability },
        { subject: 'Maintainability', score: qualityMetrics.maintainability },
        { subject: 'Performance', score: qualityMetrics.performanceEfficiency },
        { subject: 'Usability', score: qualityMetrics.usability },
        { subject: 'Compatibility', score: qualityMetrics.compatibility },
        { subject: 'Portability', score: qualityMetrics.portability },
        { subject: 'Functionality', score: qualityMetrics.functionalSuitability },
      ]
    : [];

  // OWASP Category Distribution
  const owaspData = vulnerabilities.reduce((acc: Record<string, number>, v) => {
    const owasp = v.owasp || 'Not Classified';
    acc[owasp] = (acc[owasp] || 0) + 1;
    return acc;
  }, {});

  const owaspChartData = Object.entries(owaspData).map(([name, value]) => ({
    name: name.replace('A0', 'A').substring(0, 20),
    value,
    fullName: name,
  }));

  // Confidence Level Distribution
  const confidenceData = [
    { name: 'High', value: vulnerabilities.filter(v => v.confidence === 'high').length, color: '#10b981' },
    { name: 'Medium', value: vulnerabilities.filter(v => v.confidence === 'medium').length, color: '#f59e0b' },
    { name: 'Low', value: vulnerabilities.filter(v => v.confidence === 'low').length, color: '#ef4444' },
  ];

  // File Distribution (top 10 files with most vulnerabilities)
  const fileDistribution = vulnerabilities.reduce((acc: Record<string, number>, v) => {
    acc[v.filePath] = (acc[v.filePath] || 0) + 1;
    return acc;
  }, {});

  const fileChartData = Object.entries(fileDistribution)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([name, value]) => ({
      name: name.split('/').pop() || name,
      value,
      fullPath: name,
    }));

  const exportToHTML = () => {
    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>CWE Security Scan Report - ${project?.name}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; background: #f5f5f5; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; }
    .summary { display: grid; grid-template-columns: repeat(5, 1fr); gap: 15px; margin: 20px 0; }
    .stat-card { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .stat-value { font-size: 36px; font-weight: bold; }
    .critical { color: #dc2626; }
    .high { color: #ea580c; }
    .medium { color: #f59e0b; }
    .low { color: #3b82f6; }
    .vulnerability { background: white; margin: 15px 0; padding: 20px; border-radius: 8px; border-left: 4px solid #ccc; }
    .vulnerability.critical { border-left-color: #dc2626; }
    .vulnerability.high { border-left-color: #ea580c; }
    .vulnerability.medium { border-left-color: #f59e0b; }
    .vulnerability.low { border-left-color: #3b82f6; }
    .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold; margin-right: 8px; }
    .code { background: #1e293b; color: #e2e8f0; padding: 15px; border-radius: 6px; overflow-x: auto; white-space: pre; font-family: monospace; }
    .quality-metrics { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .metric-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-top: 20px; }
    .metric { text-align: center; }
    .metric-score { font-size: 24px; font-weight: bold; color: #667eea; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🛡️ CWE Security Scan Report</h1>
    <p><strong>Project:</strong> ${project?.name || 'N/A'}</p>
    <p><strong>Scan Date:</strong> ${latestScan?.completedAt ? new Date(latestScan.completedAt).toLocaleString() : 'N/A'}</p>
    <p><strong>Total Files Scanned:</strong> ${latestScan?.totalFiles || 0}</p>
  </div>

  <div class="summary">
    <div class="stat-card">
      <div class="stat-label">Critical</div>
      <div class="stat-value critical">${latestScan?.criticalCount || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">High</div>
      <div class="stat-value high">${latestScan?.highCount || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Medium</div>
      <div class="stat-value medium">${latestScan?.mediumCount || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Low</div>
      <div class="stat-value low">${latestScan?.lowCount || 0}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Total</div>
      <div class="stat-value">${latestScan?.totalVulnerabilities || 0}</div>
    </div>
  </div>

  ${qualityMetrics ? `
  <div class="quality-metrics">
    <h2>📊 ISO 25010 Quality Metrics</h2>
    <div style="text-align: center; margin: 20px 0;">
      <div style="font-size: 48px; font-weight: bold; color: ${qualityMetrics.overallScore >= 80 ? '#10b981' : qualityMetrics.overallScore >= 60 ? '#f59e0b' : '#ef4444'};">
        ${qualityMetrics.overallScore}/100
      </div>
      <div style="font-size: 24px; margin-top: 10px;">Overall Quality Score (Grade: ${qualityMetrics.securityGrade})</div>
    </div>
    <div class="metric-grid">
      <div class="metric">
        <div class="metric-score">${qualityMetrics.security}</div>
        <div>Security</div>
      </div>
      <div class="metric">
        <div class="metric-score">${qualityMetrics.reliability}</div>
        <div>Reliability</div>
      </div>
      <div class="metric">
        <div class="metric-score">${qualityMetrics.maintainability}</div>
        <div>Maintainability</div>
      </div>
      <div class="metric">
        <div class="metric-score">${qualityMetrics.performanceEfficiency}</div>
        <div>Performance</div>
      </div>
    </div>
  </div>
  ` : ''}

  <h2 style="margin-top: 30px;">🔍 Vulnerabilities Found</h2>
  ${vulnerabilities.map(v => `
    <div class="vulnerability ${v.severity}">
      <div>
        <span class="badge" style="background: ${SEVERITY_COLORS[v.severity]}; color: white;">${v.severity.toUpperCase()}</span>
        <span class="badge" style="background: #e5e7eb; color: #1f2937;">${v.cweId}</span>
        ${v.owasp ? `<span class="badge" style="background: #ddd6fe; color: #5b21b6;">${v.owasp}</span>` : ''}
      </div>
      <h3 style="margin: 10px 0;">${v.cweName}</h3>
      <p><strong>File:</strong> ${v.filePath}${v.lineNumber ? ` (Line ${v.lineNumber})` : ''}</p>
      <p><strong>Description:</strong> ${v.description}</p>
      ${v.codeSnippet ? `<div class="code">${v.codeSnippet}</div>` : ''}
      ${v.recommendation ? `<p><strong>💡 Recommendation:</strong> ${v.recommendation}</p>` : ''}
      <p><strong>Confidence:</strong> ${v.confidence.toUpperCase()}</p>
    </div>
  `).join('')}

  <div style="margin-top: 40px; padding: 20px; background: white; border-radius: 8px; text-align: center;">
    <p>Generated by CWE Security Scanner on ${new Date().toLocaleString()}</p>
  </div>
</body>
</html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cwe-security-scan-${project?.name || 'report'}-${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate(`/home?tab=projects`)}
              data-testid="button-back"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Projects
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white" data-testid="text-title">
                CWE Security Scan
              </h1>
              <p className="text-slate-600 dark:text-slate-400" data-testid="text-project-name">
                {project?.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {latestScan?.status === 'completed' && (
              <Button
                variant="outline"
                onClick={exportToHTML}
                data-testid="button-export-html"
              >
                <Download className="mr-2 h-4 w-4" />
                Export HTML
              </Button>
            )}
            <Button
              onClick={() => startScanMutation.mutate()}
              disabled={startScanMutation.isPending || latestScan?.status === 'running'}
              data-testid="button-start-scan"
            >
              <Play className="mr-2 h-4 w-4" />
              {latestScan?.status === 'running' ? 'Scan Running...' : 'Start New Scan'}
            </Button>
          </div>
        </div>

        {latestScan?.status === 'running' && (
          <Alert data-testid="alert-scanning">
            <Info className="h-4 w-4" />
            <AlertDescription>
              Security scan in progress... {latestScan.scannedFiles} / {latestScan.totalFiles} files scanned
              <Progress value={(latestScan.scannedFiles / latestScan.totalFiles) * 100} className="mt-2" />
            </AlertDescription>
          </Alert>
        )}

        {latestScan?.status === 'completed' && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <Card data-testid="card-critical">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Critical
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{latestScan.criticalCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-high">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">High</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{latestScan.highCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-medium">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Medium
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{latestScan.mediumCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-low">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">Low</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{latestScan.lowCount}</div>
                </CardContent>
              </Card>
              <Card data-testid="card-total">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                    Total Issues
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-slate-900 dark:text-white">
                    {latestScan.totalVulnerabilities}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="vulnerabilities" className="w-full">
              <TabsList className="grid w-full grid-cols-4" data-testid="tabs-list">
                <TabsTrigger value="vulnerabilities" data-testid="tab-vulnerabilities">
                  Vulnerabilities
                </TabsTrigger>
                <TabsTrigger value="analytics" data-testid="tab-analytics">
                  Analytics
                </TabsTrigger>
                <TabsTrigger value="quality" data-testid="tab-quality">
                  Quality Metrics
                </TabsTrigger>
                <TabsTrigger value="rules" data-testid="tab-rules">
                  Rules Checklist
                </TabsTrigger>
              </TabsList>

              <TabsContent value="vulnerabilities" className="space-y-4">
                <div className="flex gap-2 flex-wrap">
                  <Button
                    variant={selectedSeverity === null ? 'default' : 'outline'}
                    onClick={() => setSelectedSeverity(null)}
                    size="sm"
                    data-testid="filter-all"
                  >
                    All ({vulnerabilities.length})
                  </Button>
                  {Object.entries(SEVERITY_LABELS).map(([key, label]) => (
                    <Button
                      key={key}
                      variant={selectedSeverity === key ? 'default' : 'outline'}
                      onClick={() => setSelectedSeverity(key)}
                      size="sm"
                      data-testid={`filter-${key}`}
                    >
                      {label} ({vulnerabilities.filter((v) => v.severity === key).length})
                    </Button>
                  ))}
                </div>

                <div className="space-y-3">
                  {filteredVulnerabilities.map((vuln, index) => (
                    <Card key={vuln.id} data-testid={`vulnerability-${index}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge
                                variant="outline"
                                style={{
                                  backgroundColor: SEVERITY_COLORS[vuln.severity],
                                  color: 'white',
                                  borderColor: SEVERITY_COLORS[vuln.severity],
                                }}
                                data-testid={`badge-severity-${index}`}
                              >
                                {SEVERITY_LABELS[vuln.severity]}
                              </Badge>
                              <Badge variant="secondary" data-testid={`badge-cwe-${index}`}>
                                {vuln.cweId}
                              </Badge>
                              <Badge variant="outline" data-testid={`badge-category-${index}`}>
                                {vuln.category}
                              </Badge>
                              {vuln.owasp && (
                                <Badge variant="outline" data-testid={`badge-owasp-${index}`}>
                                  {vuln.owasp}
                                </Badge>
                              )}
                            </div>
                            <CardTitle className="text-lg" data-testid={`title-vuln-${index}`}>
                              {vuln.cweName}
                            </CardTitle>
                            <CardDescription className="mt-1" data-testid={`desc-vuln-${index}`}>
                              {vuln.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <FileCode className="h-4 w-4" />
                          <code className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded" data-testid={`file-path-${index}`}>
                            {vuln.filePath}
                            {vuln.lineNumber && `:${vuln.lineNumber}`}
                          </code>
                        </div>

                        {vuln.codeSnippet && (
                          <div className="bg-slate-900 dark:bg-slate-950 p-3 rounded-md overflow-x-auto">
                            <pre className="text-xs text-slate-300" data-testid={`code-snippet-${index}`}>
                              {vuln.codeSnippet}
                            </pre>
                          </div>
                        )}

                        {vuln.recommendation && (
                          <Alert data-testid={`recommendation-${index}`}>
                            <CheckCircle className="h-4 w-4" />
                            <AlertDescription>
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </AlertDescription>
                          </Alert>
                        )}
                      </CardContent>
                    </Card>
                  ))}

                  {filteredVulnerabilities.length === 0 && (
                    <Card>
                      <CardContent className="pt-6 text-center text-slate-600 dark:text-slate-400">
                        <Shield className="h-12 w-12 mx-auto mb-2 text-green-600" />
                        <p data-testid="text-no-vulnerabilities">No vulnerabilities found in this category.</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card data-testid="card-severity-chart">
                    <CardHeader>
                      <CardTitle>Vulnerabilities by Severity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie
                            data={severityData.filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {severityData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-category-chart">
                    <CardHeader>
                      <CardTitle>Vulnerabilities by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={categoryChartData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="value" fill="#3b82f6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card data-testid="card-owasp-chart">
                    <CardHeader>
                      <CardTitle>OWASP Top 10 Classification</CardTitle>
                      <CardDescription>Distribution of vulnerabilities by OWASP categories</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <BarChart data={owaspChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={150} />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg">
                                  <p className="font-semibold">{payload[0].payload.fullName}</p>
                                  <p className="text-blue-600">Count: {payload[0].value}</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Bar dataKey="value" fill="#8b5cf6" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card data-testid="card-confidence-chart">
                    <CardHeader>
                      <CardTitle>Detection Confidence Levels</CardTitle>
                      <CardDescription>Confidence distribution of detected vulnerabilities</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={350}>
                        <PieChart>
                          <Pie
                            data={confidenceData.filter((d) => d.value > 0)}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={(entry) => `${entry.name}: ${entry.value}`}
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {confidenceData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>

                {fileChartData.length > 0 && (
                  <Card data-testid="card-file-distribution">
                    <CardHeader>
                      <CardTitle>Top 10 Files with Most Vulnerabilities</CardTitle>
                      <CardDescription>Files requiring immediate attention</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart data={fileChartData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis dataKey="name" type="category" width={200} />
                          <Tooltip content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-700 rounded shadow-lg max-w-md">
                                  <p className="font-semibold text-sm break-all">{payload[0].payload.fullPath}</p>
                                  <p className="text-red-600 font-bold">Vulnerabilities: {payload[0].value}</p>
                                </div>
                              );
                            }
                            return null;
                          }} />
                          <Bar dataKey="value" fill="#ef4444" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                )}

                <Card data-testid="card-summary-stats">
                  <CardHeader>
                    <CardTitle>Scan Summary Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{latestScan?.totalFiles}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Total Files</div>
                      </div>
                      <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">{latestScan?.scannedFiles}</div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Scanned Files</div>
                      </div>
                      <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                          {new Set(vulnerabilities.map(v => v.cweId)).size}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Unique CWEs</div>
                      </div>
                      <div className="text-center p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">
                          {Object.keys(categoryData).length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400 mt-1">Categories</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="quality" className="space-y-4">
                {qualityMetrics && (
                  <>
                    <Card data-testid="card-overall-score">
                      <CardHeader>
                        <CardTitle>Overall Quality Score</CardTitle>
                        <CardDescription>Based on ISO 25010 Software Quality Model</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-center gap-8">
                          <div className="text-center">
                            <div className="text-6xl font-bold text-blue-600" data-testid="text-overall-score">
                              {qualityMetrics.overallScore}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Overall Score</p>
                          </div>
                          <div className="text-center">
                            <div
                              className="text-6xl font-bold"
                              style={{
                                color:
                                  qualityMetrics.securityGrade === 'A'
                                    ? '#10b981'
                                    : qualityMetrics.securityGrade === 'B'
                                    ? '#3b82f6'
                                    : qualityMetrics.securityGrade === 'C'
                                    ? '#f59e0b'
                                    : '#dc2626',
                              }}
                              data-testid="text-security-grade"
                            >
                              {qualityMetrics.securityGrade}
                            </div>
                            <p className="text-slate-600 dark:text-slate-400 mt-2">Security Grade</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card data-testid="card-radar-chart">
                      <CardHeader>
                        <CardTitle>ISO 25010 Quality Characteristics</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={400}>
                          <RadarChart data={iso25010Data}>
                            <PolarGrid />
                            <PolarAngleAxis dataKey="subject" />
                            <PolarRadiusAxis angle={90} domain={[0, 100]} />
                            <Radar name="Quality" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                            <Tooltip />
                          </RadarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card data-testid="card-security-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Security</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.security}/100</div>
                          <Progress value={qualityMetrics.security} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-reliability-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Reliability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.reliability}/100</div>
                          <Progress value={qualityMetrics.reliability} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-maintainability-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Maintainability</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.maintainability}/100</div>
                          <Progress value={qualityMetrics.maintainability} className="mt-2" />
                        </CardContent>
                      </Card>
                      <Card data-testid="card-performance-score">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">{qualityMetrics.performanceEfficiency}/100</div>
                          <Progress value={qualityMetrics.performanceEfficiency} className="mt-2" />
                        </CardContent>
                      </Card>
                    </div>
                  </>
                )}

                {!qualityMetrics && (
                  <Card>
                    <CardContent className="pt-6 text-center text-slate-600 dark:text-slate-400">
                      <TrendingUp className="h-12 w-12 mx-auto mb-2" />
                      <p data-testid="text-no-metrics">Quality metrics will be available after the first scan completes.</p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="rules" className="space-y-4">
                <Card data-testid="card-rules-info">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileCode className="h-5 w-5" />
                      CWE Security Rules Checklist
                    </CardTitle>
                    <CardDescription>
                      Comprehensive list of Common Weakness Enumeration (CWE) rules checked by the scanner across multiple programming languages
                    </CardDescription>
                  </CardHeader>
                </Card>

                {rulesLoading && (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <Skeleton key={i} className="h-32 w-full" data-testid={`skeleton-rule-${i}`} />
                    ))}
                  </div>
                )}

                {cweRules && (
                  <>
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-4 rounded-lg">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Total Rules</p>
                          <p className="text-2xl font-bold text-slate-900 dark:text-white">{cweRules.length}</p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Critical Rules</p>
                          <p className="text-2xl font-bold text-red-600">
                            {cweRules.filter((r) => r.severity === 'critical').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">High Rules</p>
                          <p className="text-2xl font-bold text-orange-600">
                            {cweRules.filter((r) => r.severity === 'high').length}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">Languages Supported</p>
                          <p className="text-2xl font-bold text-blue-600">
                            {new Set(cweRules.flatMap((r) => r.languages)).size}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {cweRules.map((rule) => (
                        <Card key={rule.id} data-testid={`card-rule-${rule.cweId}`}>
                          <CardHeader>
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge
                                    variant={
                                      rule.severity === 'critical'
                                        ? 'destructive'
                                        : rule.severity === 'high'
                                        ? 'destructive'
                                        : rule.severity === 'medium'
                                        ? 'default'
                                        : 'secondary'
                                    }
                                    data-testid={`badge-severity-${rule.cweId}`}
                                  >
                                    {rule.severity.toUpperCase()}
                                  </Badge>
                                  <Badge variant="outline" data-testid={`badge-cwe-${rule.cweId}`}>
                                    {rule.cweId}
                                  </Badge>
                                  <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950">
                                    {rule.category}
                                  </Badge>
                                  {rule.owasp && (
                                    <Badge variant="outline" className="bg-purple-50 dark:bg-purple-950">
                                      {rule.owasp}
                                    </Badge>
                                  )}
                                </div>
                                <CardTitle className="text-lg" data-testid={`text-rule-name-${rule.cweId}`}>
                                  {rule.name}
                                </CardTitle>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Description:
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400" data-testid={`text-description-${rule.cweId}`}>
                                {rule.description}
                              </p>
                            </div>

                            {rule.impact && (
                              <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-3">
                                <p className="text-sm font-semibold text-red-900 dark:text-red-300 mb-1 flex items-center gap-2">
                                  <AlertTriangle className="h-4 w-4" />
                                  Potential Impact:
                                </p>
                                <p className="text-sm text-red-800 dark:text-red-400" data-testid={`text-impact-${rule.cweId}`}>
                                  {rule.impact}
                                </p>
                              </div>
                            )}

                            <div>
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                                Recommendation:
                              </p>
                              <p className="text-sm text-slate-600 dark:text-slate-400" data-testid={`text-recommendation-${rule.cweId}`}>
                                {rule.recommendation}
                              </p>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Languages:
                              </p>
                              {rule.languages.map((lang) => (
                                <Badge key={lang} variant="secondary" className="text-xs" data-testid={`badge-lang-${rule.cweId}-${lang}`}>
                                  {lang}
                                </Badge>
                              ))}
                            </div>

                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                                Detection Confidence:
                              </p>
                              <Badge
                                variant={
                                  rule.confidence === 'high'
                                    ? 'default'
                                    : rule.confidence === 'medium'
                                    ? 'secondary'
                                    : 'outline'
                                }
                                data-testid={`badge-confidence-${rule.cweId}`}
                              >
                                {rule.confidence.toUpperCase()}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}

        {!latestScan && (
          <Card>
            <CardContent className="pt-6 text-center">
              <Shield className="h-16 w-16 mx-auto mb-4 text-slate-400" />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-scans">No security scans yet</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-4">
                Start your first CWE security scan to identify vulnerabilities in your codebase.
              </p>
              <Button onClick={() => startScanMutation.mutate()} disabled={startScanMutation.isPending} data-testid="button-start-first-scan">
                <Play className="mr-2 h-4 w-4" />
                Start Security Scan
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
