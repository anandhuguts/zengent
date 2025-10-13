import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";

interface APIEndpoint {
  apiName: string;
  httpMethod: string;
  path: string;
  description: string;
  requestParameters: Array<{
    name: string;
    type: string;
    required: boolean;
    location: 'path' | 'query' | 'body' | 'header';
  }>;
  requestBody: string;
  responseBody: string;
  statusCodes: Array<{
    code: number;
    description: string;
  }>;
  authRequired: boolean;
  module: string;
}

export default function APIDocumentation() {
  const params = useParams();
  const projectId = params.id;

  const { data: apiDocs, isLoading } = useQuery<{ endpoints: APIEndpoint[] }>({
    queryKey: ['/api/projects', projectId, 'api-docs'],
    enabled: !!projectId
  });

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      GET: 'bg-blue-500',
      POST: 'bg-green-500',
      PUT: 'bg-yellow-500',
      DELETE: 'bg-red-500',
      PATCH: 'bg-purple-500'
    };
    return colors[method] || 'bg-gray-500';
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">API Documentation</h2>
        <p className="text-muted-foreground">
          Complete REST API documentation with detailed endpoint information
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>API Endpoints</CardTitle>
          <CardDescription>
            Comprehensive list of all REST API endpoints with request/response details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">API Name / Endpoint</TableHead>
                  <TableHead className="min-w-[100px]">HTTP Method</TableHead>
                  <TableHead className="min-w-[200px]">Path / URL</TableHead>
                  <TableHead className="min-w-[200px]">Description</TableHead>
                  <TableHead className="min-w-[200px]">Request Parameters</TableHead>
                  <TableHead className="min-w-[200px]">Request Body (JSON)</TableHead>
                  <TableHead className="min-w-[200px]">Response (JSON)</TableHead>
                  <TableHead className="min-w-[150px]">Status Codes</TableHead>
                  <TableHead className="min-w-[100px]">Auth Required</TableHead>
                  <TableHead className="min-w-[150px]">Module / Package</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiDocs?.endpoints && apiDocs.endpoints.length > 0 ? (
                  apiDocs.endpoints.map((endpoint, index) => (
                    <TableRow key={index} data-testid={`api-endpoint-${index}`}>
                      <TableCell className="font-medium" data-testid={`api-name-${index}`}>
                        {endpoint.apiName}
                      </TableCell>
                      <TableCell data-testid={`http-method-${index}`}>
                        <Badge className={`${getMethodColor(endpoint.httpMethod)} text-white`}>
                          {endpoint.httpMethod}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm" data-testid={`api-path-${index}`}>
                        {endpoint.path}
                      </TableCell>
                      <TableCell data-testid={`api-description-${index}`}>
                        {endpoint.description}
                      </TableCell>
                      <TableCell data-testid={`request-params-${index}`}>
                        {endpoint.requestParameters.length > 0 ? (
                          <div className="space-y-1">
                            {endpoint.requestParameters.map((param, pIdx) => (
                              <div key={pIdx} className="text-sm">
                                <Badge variant="outline" className="mr-1">
                                  {param.location}
                                </Badge>
                                <code className="text-xs">
                                  {param.name}: {param.type}
                                  {param.required && <span className="text-red-500">*</span>}
                                </code>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`request-body-${index}`}>
                        {endpoint.requestBody ? (
                          <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
                            {endpoint.requestBody}
                          </pre>
                        ) : (
                          <span className="text-muted-foreground">None</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`response-body-${index}`}>
                        {endpoint.responseBody ? (
                          <pre className="text-xs bg-muted p-2 rounded max-w-xs overflow-auto">
                            {endpoint.responseBody}
                          </pre>
                        ) : (
                          <span className="text-muted-foreground">Void</span>
                        )}
                      </TableCell>
                      <TableCell data-testid={`status-codes-${index}`}>
                        <div className="space-y-1">
                          {endpoint.statusCodes.map((status, sIdx) => (
                            <div key={sIdx} className="text-sm">
                              <Badge variant="secondary" className="mr-1">
                                {status.code}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {status.description}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell data-testid={`auth-required-${index}`}>
                        {endpoint.authRequired ? (
                          <Badge variant="destructive">Required</Badge>
                        ) : (
                          <Badge variant="secondary">Not Required</Badge>
                        )}
                      </TableCell>
                      <TableCell data-testid={`module-${index}`}>
                        {endpoint.module}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                      No API endpoints found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
