import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';
import type { AnalysisData } from '@shared/schema';

interface MermaidClassDiagramProps {
  analysisData: AnalysisData;
}

export default function MermaidClassDiagram({ analysisData }: MermaidClassDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Initialize mermaid
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });

    const renderDiagram = async () => {
      try {
        // Generate Mermaid syntax from analysis data
        const mermaidSyntax = generateMermaidClassDiagram(analysisData);
        console.log('Mermaid syntax:', mermaidSyntax);

        if (containerRef.current) {
          const { svg } = await mermaid.render('mermaid-diagram', mermaidSyntax);
          containerRef.current.innerHTML = svg;
          setError(null);
        }
      } catch (err) {
        console.error('Mermaid render error:', err);
        setError(err instanceof Error ? err.message : 'Failed to render diagram');
      }
    };

    renderDiagram();
  }, [analysisData]);

  if (error) {
    return (
      <div className="w-full p-6 bg-white" style={{ minHeight: '600px' }}>
        <div className="text-center text-red-600">
          <p className="font-bold mb-2">Error rendering diagram</p>
          <p className="text-sm">{error}</p>
          <p className="text-xs mt-2 text-gray-600">Check console for details</p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="w-full p-6 bg-white overflow-auto"
      data-testid="mermaid-class-diagram"
      style={{ minHeight: '600px' }}
    />
  );
}

function generateMermaidClassDiagram(analysisData: AnalysisData): string {
  const lines: string[] = ['classDiagram'];

  // Show all analyzed classes from the source code
  const classesToShow = analysisData.classes.slice(0, 30); // Increased limit to show more actual classes

  // Add classes with their members
  classesToShow.forEach(cls => {
    // Clean class name - alphanumeric and underscore only
    const cleanClassName = cls.name.replace(/[^a-zA-Z0-9]/g, '');
    
    if (!cleanClassName) return; // Skip if name becomes empty
    
    // Class definition with stereotype
    lines.push(`  class ${cleanClassName} {`);
    lines.push(`    <<${cls.type}>>`);
    
    // Add fields (limit to 5 for readability)
    if (cls.fields && cls.fields.length > 0) {
      cls.fields.slice(0, 5).forEach(field => {
        // Clean type and field names - alphanumeric only
        const cleanType = field.type.replace(/[^a-zA-Z0-9]/g, '').substring(0, 15);
        const cleanFieldName = field.name.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanType && cleanFieldName) {
          lines.push(`    -${cleanType} ${cleanFieldName}`);
        }
      });
    }
    
    // Add methods (limit to 5 for readability)
    if (cls.methods && cls.methods.length > 0) {
      cls.methods.slice(0, 5).forEach(method => {
        const cleanMethodName = method.name.replace(/[^a-zA-Z0-9]/g, '');
        if (cleanMethodName) {
          lines.push(`    +${cleanMethodName}()`);
        }
      });
    }
    
    lines.push(`  }`);
  });

  // Create a set of valid class names
  const validClassNames = new Set(
    classesToShow.map(cls => cls.name.replace(/[^a-zA-Z0-9]/g, '')).filter(Boolean)
  );

  // Add relationships (only between shown classes)
  analysisData.relationships.forEach(rel => {
    const cleanFrom = rel.from.replace(/[^a-zA-Z0-9]/g, '');
    const cleanTo = rel.to.replace(/[^a-zA-Z0-9]/g, '');
    
    // Only add if both classes exist in our diagram
    if (!validClassNames.has(cleanFrom) || !validClassNames.has(cleanTo)) {
      return;
    }
    
    // Map relationship types to Mermaid syntax
    let mermaidRel = '-->';
    switch (rel.type) {
      case 'extends':
        mermaidRel = '--|>'; // Inheritance
        break;
      case 'implements':
        mermaidRel = '..|>'; // Implementation
        break;
      case 'uses':
        mermaidRel = '..>'; // Dependency
        break;
      case 'calls':
        mermaidRel = '-->'; // Association
        break;
      default:
        mermaidRel = '-->'; // Default association
    }
    
    lines.push(`  ${cleanFrom} ${mermaidRel} ${cleanTo}`);
  });

  return lines.join('\n');
}
