import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, FileText, CheckCircle, XCircle, RefreshCw, Users } from 'lucide-react';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface DemographicScanTabProps {
  projectId: string;
}

interface ScanResult {
  file: string;
  line: number;
  fieldType: string;
  matchedPattern: string;
  context: string;
}

interface ScanReport {
  summary: {
    totalFiles: number;
    totalMatches: number;
    fieldsFound: number;
    scanDate: string;
  };
  fieldResults: Record<string, ScanResult[]>;
  coverage: {
    foundFields: string[];
    missingFields: string[];
  };
}

export default function DemographicScanTab({ projectId }: DemographicScanTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: scanData, isLoading: isScanLoading } = useQuery<{ report: ScanReport; success: boolean }>({
    queryKey: ['/api/projects', projectId, 'demographics'],
    enabled: !!projectId,
  });

  const { data: patternsData } = useQuery({
    queryKey: ['/api/demographic/patterns'],
    enabled: !!projectId,
  });

  const scanMutation = useMutation({
    mutationFn: () => apiRequest('POST', `/api/projects/${projectId}/scan-demographics`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', projectId, 'demographics'] });
      toast({
        title: 'Scan Complete',
        description: 'Demographic field scan completed successfully',
      });
    },
    onError: () => {
      toast({
        title: 'Scan Failed',
        description: 'Failed to scan demographic fields',
        variant: 'destructive',
      });
    },
  });

  if (isScanLoading) {
    return (
      <div className="flex items-center justify-center py-12 bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const report = scanData?.report;
  const allResults: ScanResult[] = report ? Object.values(report.fieldResults).flat() : [];
  const filteredResults = allResults.filter(result => 
    result.fieldType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.file.toLowerCase().includes(searchTerm.toLowerCase()) ||
    result.context.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categories = [
    { name: 'Name Fields', fields: ['Embossed Name', 'Primary Name', 'Secondary Name', 'Legal Name', 'DBA Name', 'Double Byte Name', 'Embossed Company Name'] },
    { name: 'Personal Info', fields: ['Gender', 'Date of Birth', 'Government IDs', 'Member Since Date'] },
    { name: 'Address Fields', fields: ['Home Address', 'Business Address', 'Alternate Address', 'Temporary Address', 'Other Address', 'Additional Addresses Array'] },
    { name: 'Phone Fields', fields: ['Home Phone', 'Alternate Home Phone', 'Business Phone', 'Alternate Business Phone', 'Mobile Phone', 'Alternate Mobile Phone', 'Attorney Phone', 'Fax', 'ANI Phone', 'Other Phone', 'Additional Phones Array'] },
    { name: 'Email Fields', fields: ['Servicing Email', 'E-Statement Email', 'Business Email', 'Additional Emails Array'] },
  ];

  const coveragePercentage = report 
    ? Math.round((report.coverage.foundFields.length / (report.coverage.foundFields.length + report.coverage.missingFields.length)) * 100)
    : 0;

  return (
    <div className="p-6 bg-white space-y-6">
      {/* Header and Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Demographic Field Scanner</h3>
        </div>
        <Button
          onClick={() => scanMutation.mutate()}
          disabled={scanMutation.isPending}
          size="sm"
          data-testid="button-run-scan"
        >
          {scanMutation.isPending ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Run Scan
            </>
          )}
        </Button>
      </div>

      {!report ? (
        <Alert>
          <AlertDescription>
            No demographic scan has been performed yet. Click "Run Scan" to analyze this project for demographic fields.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Files Scanned</p>
                    <p className="text-2xl font-bold" data-testid="text-files-scanned">{report.summary.totalFiles}</p>
                  </div>
                  <FileText className="w-8 h-8 text-blue-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Matches</p>
                    <p className="text-2xl font-bold" data-testid="text-total-matches">{report.summary.totalMatches}</p>
                  </div>
                  <Search className="w-8 h-8 text-green-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Fields Found</p>
                    <p className="text-2xl font-bold" data-testid="text-fields-found">{report.coverage.foundFields.length}</p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-emerald-500 opacity-20" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Coverage</p>
                    <p className="text-2xl font-bold" data-testid="text-coverage">{coveragePercentage}%</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-500 opacity-20" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coverage by Category */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Field Coverage by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {categories.map((category) => {
                  const foundInCategory = category.fields.filter(f => 
                    report.coverage.foundFields.includes(f)
                  );
                  const categoryPercentage = Math.round((foundInCategory.length / category.fields.length) * 100);
                  
                  return (
                    <div key={category.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground">
                          {foundInCategory.length}/{category.fields.length} ({categoryPercentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${categoryPercentage}%` }}
                        />
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {category.fields.map(field => (
                          <Badge 
                            key={field}
                            variant={report.coverage.foundFields.includes(field) ? "default" : "outline"}
                            className="text-xs"
                          >
                            {report.coverage.foundFields.includes(field) ? (
                              <CheckCircle className="w-3 h-3 mr-1" />
                            ) : (
                              <XCircle className="w-3 h-3 mr-1" />
                            )}
                            {field}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Search and Results */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Scan Results ({filteredResults.length})</CardTitle>
                <div className="relative w-64">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search results..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                    data-testid="input-search-results"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {filteredResults.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    {searchTerm ? 'No results match your search' : 'No demographic fields found'}
                  </p>
                ) : (
                  filteredResults.map((result, idx) => (
                    <div 
                      key={idx}
                      className="p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                      data-testid={`scan-result-${idx}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <Badge variant="secondary" className="text-xs">
                              {result.fieldType}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {result.file}:{result.line}
                            </span>
                          </div>
                          <code className="text-xs bg-muted px-2 py-1 rounded block mt-1">
                            {result.context}
                          </code>
                          <p className="text-xs text-muted-foreground mt-1">
                            Pattern: <code>{result.matchedPattern}</code>
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
