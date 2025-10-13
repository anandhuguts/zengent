import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import { type AnalysisData } from '@shared/schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';

interface MermaidFlowDiagramProps {
  analysisData: AnalysisData;
}

export default function MermaidFlowDiagram({ analysisData }: MermaidFlowDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      flowchart: {
        useMaxWidth: true,
        htmlLabels: true,
        curve: 'basis',
      },
    });
  }, []);

  useEffect(() => {
    if (!containerRef.current || !analysisData) return;

    const renderDiagram = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const flowchartCode = generateFlowchart(analysisData);
        
        const { svg } = await mermaid.render(`flow-${Date.now()}`, flowchartCode);
        
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
        }
      } catch (err) {
        console.error('Mermaid flow diagram error:', err);
        setError('Failed to render flow diagram. The diagram may be too complex.');
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

function generateFlowchart(analysisData: AnalysisData): string {
  // Show ALL analyzed components, not just a subset
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  
  let flowchart = 'flowchart TB\n';
  
  flowchart += '  Start([User Request]) --> Router\n';
  
  if (controllers.length > 0) {
    flowchart += '  Router{Route Request} --> Controllers\n';
    
    controllers.forEach((controller, idx) => {
      const cleanName = sanitizeName(controller.name);
      flowchart += `  Controllers --> C${idx}[${cleanName}]\n`;
    });
    
    if (services.length > 0) {
      controllers.forEach((_, idx) => {
        flowchart += `  C${idx} --> ServiceLayer\n`;
      });
      
      flowchart += '  ServiceLayer{Business Logic} --> Services\n';
      
      services.forEach((service, idx) => {
        const cleanName = sanitizeName(service.name);
        flowchart += `  Services --> S${idx}[${cleanName}]\n`;
      });
      
      if (repositories.length > 0) {
        services.forEach((_, idx) => {
          flowchart += `  S${idx} --> DataLayer\n`;
        });
        
        flowchart += '  DataLayer{Data Access} --> Repos\n';
        
        repositories.forEach((repo, idx) => {
          const cleanName = sanitizeName(repo.name);
          flowchart += `  Repos --> R${idx}[(${cleanName})]\n`;
        });
        
        repositories.forEach((_, idx) => {
          flowchart += `  R${idx} --> Database[(Database)]\n`;
        });
      }
    } else if (repositories.length > 0) {
      controllers.forEach((_, idx) => {
        flowchart += `  C${idx} --> DataAccess\n`;
      });
      
      flowchart += '  DataAccess{Data Layer} --> Repos\n';
      
      repositories.forEach((repo, idx) => {
        const cleanName = sanitizeName(repo.name);
        flowchart += `  Repos --> R${idx}[(${cleanName})]\n`;
      });
      
      repositories.forEach((_, idx) => {
        flowchart += `  R${idx} --> Database[(Database)]\n`;
      });
    }
    
    flowchart += '  Database --> Response\n';
    flowchart += '  Response[Process Response] --> End([Return to User])\n';
  } else {
    flowchart += '  Router --> Process[Process Request]\n';
    flowchart += '  Process --> End([Response])\n';
  }
  
  flowchart += '\n  style Start fill:#e1f5e1\n';
  flowchart += '  style End fill:#e1f5e1\n';
  flowchart += '  style Database fill:#fff4e1\n';
  flowchart += '  style Router fill:#e3f2fd\n';
  flowchart += '  style ServiceLayer fill:#f3e5f5\n';
  flowchart += '  style DataLayer fill:#fce4ec\n';
  
  return flowchart;
}

function sanitizeName(name: string): string {
  return name
    .replace(/[<>]/g, '')
    .replace(/[^\w\s-]/g, '')
    .substring(0, 25);
}
