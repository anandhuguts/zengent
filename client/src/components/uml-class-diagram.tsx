import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";

interface UMLClassDiagramProps {
  projectId: string;
}

export default function UMLClassDiagram({ projectId }: UMLClassDiagramProps) {
  const [format, setFormat] = useState<'svg' | 'png'>('svg');
  const [isDownloading, setIsDownloading] = useState(false);

  const diagramUrl = `/api/projects/${projectId}/diagrams/class?format=${format}&theme=light`;

  const handleDownload = async (downloadFormat: 'svg' | 'png' | 'pdf') => {
    setIsDownloading(true);
    try {
      const url = `/api/projects/${projectId}/diagrams/class?format=${downloadFormat}&theme=light`;
      const response = await fetch(url);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = `class-diagram.${downloadFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Controls */}
      <div className="p-4 border-b border-border bg-muted flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">View:</span>
          <Button
            variant={format === 'svg' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFormat('svg')}
            data-testid="button-view-svg"
          >
            SVG
          </Button>
          <Button
            variant={format === 'png' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFormat('png')}
            data-testid="button-view-png"
          >
            PNG
          </Button>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload('svg')}
            disabled={isDownloading}
            data-testid="button-download-svg"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download SVG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload('png')}
            disabled={isDownloading}
            data-testid="button-download-png"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PNG
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload('pdf')}
            disabled={isDownloading}
            data-testid="button-download-pdf"
          >
            {isDownloading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>
        </div>
      </div>

      {/* Diagram Display */}
      <div className="flex-1 overflow-auto bg-white p-8">
        <div className="flex items-center justify-center min-h-full">
          {format === 'svg' ? (
            <img
              src={diagramUrl}
              alt="UML Class Diagram"
              className="max-w-full h-auto"
              data-testid="img-uml-diagram"
            />
          ) : (
            <img
              src={diagramUrl}
              alt="UML Class Diagram"
              className="max-w-full h-auto"
              data-testid="img-uml-diagram"
            />
          )}
        </div>
      </div>
    </div>
  );
}
