import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { type AnalysisData } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface MermaidSequenceDiagramProps {
  analysisData: AnalysisData;
}

export default function MermaidSequenceDiagram({ analysisData }: MermaidSequenceDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      sequence: {
        useMaxWidth: true,
        diagramMarginX: 50,
        diagramMarginY: 10,
        actorMargin: 50,
        width: 150,
        height: 65,
        boxMargin: 10,
      },
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !analysisData) return;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const sequenceCode = generateSequenceDiagram(analysisData);
        
        const { svg } = await mermaid.render(`seq-${Date.now()}`, sequenceCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid sequence diagram error:', err);
        setError('Failed to render sequence diagram. The diagram may be too complex.');
      } finally {
        setIsLoading(false);
      }
    };

    renderDiagram();
  }, [analysisData]);

  return (
    <div className="p-6 bg-white">
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}
      
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <div 
        ref={containerRef} 
        className="mermaid-container flex justify-center"
        style={{ minHeight: '400px' }}
      />
    </div>
  );
}

function generateSequenceDiagram(analysisData: AnalysisData): string {
  const controllers = analysisData.classes.filter(c => c.type === 'controller').slice(0, 3);
  const services = analysisData.classes.filter(c => c.type === 'service').slice(0, 3);
  const repositories = analysisData.classes.filter(c => c.type === 'repository').slice(0, 3);
  
  let sequence = 'sequenceDiagram\n';
  sequence += '  participant User\n';
  sequence += '  participant Client\n';
  
  if (controllers.length > 0) {
    const controller = controllers[0];
    const ctrlName = sanitizeName(controller.name);
    sequence += `  participant ${ctrlName}\n`;
    
    if (services.length > 0) {
      const service = services[0];
      const svcName = sanitizeName(service.name);
      sequence += `  participant ${svcName}\n`;
      
      if (repositories.length > 0) {
        const repo = repositories[0];
        const repoName = sanitizeName(repo.name);
        sequence += `  participant ${repoName}\n`;
        sequence += '  participant Database\n\n';
        
        sequence += '  User->>Client: Send Request\n';
        sequence += `  Client->>${ctrlName}: HTTP Request\n`;
        sequence += `  activate ${ctrlName}\n`;
        
        if (controller.methods && controller.methods.length > 0) {
          const method = controller.methods[0];
          sequence += `  Note over ${ctrlName}: ${sanitizeName(method.name)}()\n`;
        }
        
        sequence += `  ${ctrlName}->>${svcName}: Call Business Logic\n`;
        sequence += `  activate ${svcName}\n`;
        
        if (service.methods && service.methods.length > 0) {
          const method = service.methods[0];
          sequence += `  Note over ${svcName}: ${sanitizeName(method.name)}()\n`;
        }
        
        sequence += `  ${svcName}->>${repoName}: Query Data\n`;
        sequence += `  activate ${repoName}\n`;
        
        sequence += `  ${repoName}->>Database: Execute Query\n`;
        sequence += '  activate Database\n';
        sequence += `  Database-->>${repoName}: Return Data\n`;
        sequence += '  deactivate Database\n';
        
        sequence += `  ${repoName}-->>${svcName}: Entity Objects\n`;
        sequence += `  deactivate ${repoName}\n`;
        
        sequence += `  ${svcName}-->>${ctrlName}: Processed Data\n`;
        sequence += `  deactivate ${svcName}\n`;
        
        sequence += `  ${ctrlName}-->>Client: HTTP Response\n`;
        sequence += `  deactivate ${ctrlName}\n`;
        sequence += '  Client-->>User: Display Result\n';
      } else {
        sequence += '\n';
        sequence += '  User->>Client: Send Request\n';
        sequence += `  Client->>${ctrlName}: HTTP Request\n`;
        sequence += `  ${ctrlName}->>${svcName}: Process Logic\n`;
        sequence += `  ${svcName}-->>${ctrlName}: Return Result\n`;
        sequence += `  ${ctrlName}-->>Client: HTTP Response\n`;
        sequence += '  Client-->>User: Display Result\n';
      }
    } else if (repositories.length > 0) {
      const repo = repositories[0];
      const repoName = sanitizeName(repo.name);
      sequence += `  participant ${repoName}\n`;
      sequence += '  participant Database\n\n';
      
      sequence += '  User->>Client: Send Request\n';
      sequence += `  Client->>${ctrlName}: HTTP Request\n`;
      sequence += `  ${ctrlName}->>${repoName}: Query Data\n`;
      sequence += `  ${repoName}->>Database: Execute Query\n`;
      sequence += `  Database-->>${repoName}: Return Data\n`;
      sequence += `  ${repoName}-->>${ctrlName}: Entity Objects\n`;
      sequence += `  ${ctrlName}-->>Client: HTTP Response\n`;
      sequence += '  Client-->>User: Display Result\n';
    } else {
      sequence += '\n';
      sequence += '  User->>Client: Send Request\n';
      sequence += `  Client->>${ctrlName}: HTTP Request\n`;
      sequence += `  ${ctrlName}-->>Client: HTTP Response\n`;
      sequence += '  Client-->>User: Display Result\n';
    }
  } else {
    sequence += '  participant Server\n\n';
    sequence += '  User->>Client: Send Request\n';
    sequence += '  Client->>Server: HTTP Request\n';
    sequence += '  Server-->>Client: HTTP Response\n';
    sequence += '  Client-->>User: Display Result\n';
  }
  
  return sequence;
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>]/g, '')
    .replace(/[^\w]/g, '')
    .substring(0, 20);
}
