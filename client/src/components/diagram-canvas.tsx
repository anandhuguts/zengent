import { useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Position,
  Handle,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { type AnalysisData } from '@shared/schema';
import { type DiagramType } from '@/types/analysis';

interface DiagramCanvasProps {
  type: DiagramType;
  analysisData: AnalysisData;
}

// Enhanced node types for better flow visualization
const nodeTypes = {
  sequenceActor: ({ data }: { data: any }) => {
    return (
      <div className="flex flex-col items-center">
        <div className="bg-cyan-400 border-2 border-cyan-600 rounded-lg px-4 py-2 min-w-[120px] text-center">
          <div className="text-sm font-medium text-gray-800">{data.label}</div>
        </div>
        {/* Lifeline - will be handled by custom edges */}
      </div>
    );
  },
  sequenceActivation: ({ data }: { data: any }) => {
    return (
      <div className="bg-gray-200 border-2 border-gray-400 w-4 h-16 relative">
        {/* Activation box */}
      </div>
    );
  },
  sequenceLoop: ({ data }: { data: any }) => {
    return (
      <div className="border-2 border-red-400 bg-red-50 rounded-lg p-2 min-w-[200px]">
        <div className="text-xs font-bold text-red-600 mb-1">loop</div>
        <div className="text-xs text-red-700">{data.condition}</div>
      </div>
    );
  },
  sequenceAlt: ({ data }: { data: any }) => {
    return (
      <div className="border-2 border-purple-400 bg-purple-50 rounded-lg p-2 min-w-[200px]">
        <div className="text-xs font-bold text-purple-600 mb-1">alt</div>
        <div className="text-xs text-purple-700">{data.condition}</div>
      </div>
    );
  },
  flowNode: ({ data }: { data: any }) => {
    const getNodeStyle = (type: string) => {
      switch (type) {
        case 'controller': 
          return { 
            bg: 'bg-gradient-to-br from-blue-500 to-blue-600', 
            border: 'border-blue-700', 
            text: 'text-white',
            icon: '🎮'
          };
        case 'service': 
          return { 
            bg: 'bg-gradient-to-br from-green-500 to-green-600', 
            border: 'border-green-700', 
            text: 'text-white',
            icon: '⚙️'
          };
        case 'repository': 
          return { 
            bg: 'bg-gradient-to-br from-purple-500 to-purple-600', 
            border: 'border-purple-700', 
            text: 'text-white',
            icon: '📦'
          };
        case 'entity': 
          return { 
            bg: 'bg-gradient-to-br from-orange-500 to-orange-600', 
            border: 'border-orange-700', 
            text: 'text-white',
            icon: '📄'
          };
        case 'client': 
          return { 
            bg: 'bg-gradient-to-br from-indigo-500 to-indigo-600', 
            border: 'border-indigo-700', 
            text: 'text-white',
            icon: '🌐'
          };
        case 'gateway': 
          return { 
            bg: 'bg-gradient-to-br from-cyan-500 to-cyan-600', 
            border: 'border-cyan-700', 
            text: 'text-white',
            icon: '🚪'
          };
        case 'database': 
          return { 
            bg: 'bg-gradient-to-br from-yellow-500 to-yellow-600', 
            border: 'border-yellow-700', 
            text: 'text-white',
            icon: '🗄️'
          };
        default: 
          return { 
            bg: 'bg-gradient-to-br from-gray-500 to-gray-600', 
            border: 'border-gray-700', 
            text: 'text-white',
            icon: '📦'
          };
      }
    };
    
    const style = getNodeStyle(data.nodeType);
    
    return (
      <div className={`${style.bg} ${style.border} border-2 rounded-xl shadow-lg min-w-[160px] max-w-[220px] transform hover:scale-105 transition-transform duration-200`}>
        <Handle type="target" position={Position.Top} id="target" />
        <div className="p-4">
          {/* Header with Icon */}
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">{style.icon}</span>
            <div className={`font-bold text-sm ${style.text} text-center`}>
              {data.label}
            </div>
          </div>
          
          {/* Node Type Badge */}
          <div className="text-xs bg-black bg-opacity-20 rounded-full px-3 py-1 text-center mb-2">
            {data.nodeType.toUpperCase()}
          </div>
          
          {/* Description */}
          {data.description && (
            <div className="text-xs text-white opacity-80 text-center mb-2">
              {data.description}
            </div>
          )}
          
          {/* Methods Section */}
          {data.methods && data.methods.length > 0 && (
            <div className="mt-2 pt-2 border-t border-white border-opacity-30">
              <div className="text-xs text-white opacity-80">
                {data.methods.slice(0, 2).map((method: any, idx: number) => (
                  <div key={idx} className="truncate">
                    • {method.name}()
                  </div>
                ))}
                {data.methods.length > 2 && (
                  <div className="text-center mt-1">
                    +{data.methods.length - 2} more methods
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
        <Handle type="source" position={Position.Bottom} id="source" />
      </div>
    );
  },
  class: ({ data }: { data: any }) => (
    <div className="bg-white border-2 border-gray-800 shadow-lg min-w-[250px]">
      <Handle type="target" position={Position.Top} id="target" />
      {/* Class Header */}
      <div className="bg-gray-800 text-white p-3 text-center font-bold">
        {data.label}
      </div>
      
      {/* Fields Section */}
      {data.fields && data.fields.length > 0 && (
        <div className="border-b border-gray-800">
          <div className="p-3">
            {data.fields.slice(0, 5).map((field: any, idx: number) => (
              <div key={idx} className="text-sm font-mono text-gray-700">
                {field.visibility || '+'} {field.name}: {field.type}
              </div>
            ))}
            {data.fields.length > 5 && (
              <div className="text-xs text-gray-500 mt-1">
                +{data.fields.length - 5} more fields
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Methods Section */}
      {data.methods && data.methods.length > 0 && (
        <div className="p-3">
          {data.methods.slice(0, 5).map((method: any, idx: number) => (
            <div key={idx} className="text-sm font-mono text-gray-700">
              {method.visibility || '+'} {method.name}(): {method.returnType || 'void'}
            </div>
          ))}
          {data.methods.length > 5 && (
            <div className="text-xs text-gray-500 mt-1">
              +{data.methods.length - 5} more methods
            </div>
          )}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  ),
  controller: ({ data }: { data: any }) => (
    <div className="bg-blue-100 border-2 border-primary rounded-lg p-4 min-w-[150px]">
      <Handle type="target" position={Position.Top} id="target" />
      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-primary text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  ),
  service: ({ data }: { data: any }) => (
    <div className="bg-green-100 border-2 border-accent rounded-lg p-4 min-w-[150px]">
      <Handle type="target" position={Position.Top} id="target" />
      <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      </div>
      <div className="font-medium text-sm text-accent text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  ),
  repository: ({ data }: { data: any }) => (
    <div className="bg-purple-100 border-2 border-purple-600 rounded-lg p-4 min-w-[150px]">
      <Handle type="target" position={Position.Top} id="target" />
      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-purple-600 text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  ),
  entity: ({ data }: { data: any }) => (
    <div className="bg-orange-100 border-2 border-orange-600 rounded-lg p-4 min-w-[150px]">
      <Handle type="target" position={Position.Top} id="target" />
      <div className="w-8 h-8 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-2">
        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
          <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </div>
      <div className="font-medium text-sm text-orange-600 text-center">{data.label}</div>
      <div className="text-xs text-gray-600 text-center">{data.annotations?.[0]}</div>
      <Handle type="source" position={Position.Bottom} id="source" />
    </div>
  ),
};

// Enhanced Dagre layout utility for better flow visualization
const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  // Enhanced layout settings for better flow chart appearance
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 120,     // Horizontal spacing between nodes
    ranksep: 180,     // Vertical spacing between layers
    marginx: 20,      // Margin around the graph
    marginy: 20,
    align: 'UL'       // Align to upper left for consistent positioning
  });

  // Set node dimensions based on type for better layout
  nodes.forEach((node) => {
    const isSpecialNode = ['client-browser', 'api-gateway', 'database'].includes(node.id);
    dagreGraph.setNode(node.id, { 
      width: isSpecialNode ? 180 : 200, 
      height: isSpecialNode ? 120 : 160 
    });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = Position.Top;
    node.sourcePosition = Position.Bottom;
    
    // Adjust position to match React Flow anchor point with better centering
    const isSpecialNode = ['client-browser', 'api-gateway', 'database'].includes(node.id);
    node.position = {
      x: nodeWithPosition.x - (isSpecialNode ? 90 : 100),
      y: nodeWithPosition.y - (isSpecialNode ? 60 : 80),
    };

    return node;
  });

  return { nodes, edges };
};

function generateDiagram(type: DiagramType, analysisData: AnalysisData) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  switch (type) {
    case 'flow':
      generateFlowDiagram(analysisData, nodes, edges);
      break;
    case 'component':
      generateComponentDiagram(analysisData, nodes, edges);
      break;
    case 'class':
      generateClassDiagram(analysisData, nodes, edges);
      break;
    case 'sequence':
      generateSequenceDiagram(analysisData, nodes, edges);
      break;
    case 'er':
      generateERDiagram(analysisData, nodes, edges);
      break;
    default:
      break;
  }

  return { diagramNodes: nodes, diagramEdges: edges };
}

function generateFlowDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const controllers = analysisData.classes.filter(c => c.type === 'controller');
  const services = analysisData.classes.filter(c => c.type === 'service');
  const repositories = analysisData.classes.filter(c => c.type === 'repository');
  const entities = analysisData.entities || [];

  // 1. Add Client/Browser Entry Point
  nodes.push({
    id: 'client-browser',
    type: 'flowNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Client Browser',
      nodeType: 'client',
      description: 'HTTP Requests'
    },
  });

  // 2. Add Load Balancer/API Gateway if multiple controllers
  if (controllers.length > 1) {
    nodes.push({
      id: 'api-gateway',
      type: 'flowNode',
      position: { x: 0, y: 0 },
      data: {
        label: 'API Gateway',
        nodeType: 'gateway',
        description: 'Route Requests'
      },
    });
    
    edges.push({
      id: 'client-to-gateway',
      source: 'client-browser',
      target: 'api-gateway',
      type: 'smoothstep',
      label: 'HTTP Requests',
      style: { strokeWidth: 2, stroke: '#3b82f6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    });
  }

  // 3. Add Controllers (Presentation Layer)
  controllers.forEach((controller) => {
    nodes.push({
      id: controller.name,
      type: 'flowNode',
      position: { x: 0, y: 0 },
      data: {
        label: controller.name.replace('Controller', ''),
        nodeType: 'controller',
        annotations: controller.annotations,
        methods: controller.methods.slice(0, 3),
        description: `${controller.methods.length} endpoints`
      },
    });

    // Connect from gateway or directly from client
    const sourceId = controllers.length > 1 ? 'api-gateway' : 'client-browser';
    edges.push({
      id: `${sourceId}-${controller.name}`,
      source: sourceId,
      target: controller.name,
      type: 'smoothstep',
      label: 'HTTP',
      style: { strokeWidth: 2, stroke: '#3b82f6' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
    });
  });

  // 4. Add Services (Business Layer)
  services.forEach((service) => {
    nodes.push({
      id: service.name,
      type: 'flowNode',
      position: { x: 0, y: 0 },
      data: {
        label: service.name.replace('Service', ''),
        nodeType: 'service',
        annotations: service.annotations,
        methods: service.methods.slice(0, 3),
        description: `${service.methods.length} methods`
      },
    });
  });

  // 5. Add Repositories (Data Access Layer)
  repositories.forEach((repo) => {
    nodes.push({
      id: repo.name,
      type: 'flowNode',
      position: { x: 0, y: 0 },
      data: {
        label: repo.name.replace('Repository', ''),
        nodeType: 'repository',
        annotations: repo.annotations,
        methods: repo.methods.slice(0, 3),
        description: `${repo.methods.length} queries`
      },
    });
  });

  // 6. Add Database Node
  nodes.push({
    id: 'database',
    type: 'flowNode',
    position: { x: 0, y: 0 },
    data: {
      label: 'Database',
      nodeType: 'database',
      description: `${entities.length} tables`
    },
  });

  // 7. Create logical flow connections
  // Controller -> Service connections
  controllers.forEach((controller) => {
    // Find related services based on naming patterns or relationships
    const relatedServices = services.filter(service => 
      analysisData.relationships.some(rel => 
        rel.from === controller.name && rel.to === service.name
      ) ||
      // Fallback: match by similar naming (UserController -> UserService)
      controller.name.replace('Controller', '').toLowerCase() === 
      service.name.replace('Service', '').toLowerCase()
    );

    relatedServices.forEach((service) => {
      edges.push({
        id: `${controller.name}-${service.name}`,
        source: controller.name,
        target: service.name,
        type: 'smoothstep',
        animated: true,
        label: 'Business Logic',
        style: { strokeWidth: 2, stroke: '#10b981' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#10b981' },
      });
    });

    // If no specific service found, connect to first available service
    if (relatedServices.length === 0 && services.length > 0) {
      edges.push({
        id: `${controller.name}-${services[0].name}`,
        source: controller.name,
        target: services[0].name,
        type: 'smoothstep',
        label: 'Delegates',
        style: { strokeWidth: 1, stroke: '#6b7280', strokeDasharray: '3,3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
      });
    }
  });

  // Service -> Repository connections
  services.forEach((service) => {
    const relatedRepos = repositories.filter(repo => 
      analysisData.relationships.some(rel => 
        rel.from === service.name && rel.to === repo.name
      ) ||
      // Fallback: match by similar naming
      service.name.replace('Service', '').toLowerCase() === 
      repo.name.replace('Repository', '').toLowerCase()
    );

    relatedRepos.forEach((repo) => {
      edges.push({
        id: `${service.name}-${repo.name}`,
        source: service.name,
        target: repo.name,
        type: 'smoothstep',
        animated: true,
        label: 'Data Access',
        style: { strokeWidth: 2, stroke: '#8b5cf6' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#8b5cf6' },
      });
    });

    // If no specific repo found, connect to first available repo
    if (relatedRepos.length === 0 && repositories.length > 0) {
      edges.push({
        id: `${service.name}-${repositories[0].name}`,
        source: service.name,
        target: repositories[0].name,
        type: 'smoothstep',
        label: 'Queries',
        style: { strokeWidth: 1, stroke: '#6b7280', strokeDasharray: '3,3' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6b7280' },
      });
    }
  });

  // Repository -> Database connections
  repositories.forEach((repo) => {
    edges.push({
      id: `${repo.name}-database`,
      source: repo.name,
      target: 'database',
      type: 'smoothstep',
      label: 'SQL/JPA',
      style: { strokeWidth: 2, stroke: '#f59e0b' },
      markerEnd: { type: MarkerType.ArrowClosed, color: '#f59e0b' },
    });
  });

  // Apply automatic hierarchical layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateComponentDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const allClasses = analysisData.classes;
  
  // Create component nodes with enhanced styling
  allClasses.forEach((cls) => {
    nodes.push({
      id: cls.name,
      type: 'flowNode',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: cls.name,
        nodeType: cls.type,
        annotations: cls.annotations,
        methods: cls.methods,
        fields: cls.fields,
      },
    });
  });
  
  // Add edges with better styling based on relationship types
  analysisData.relationships.forEach((rel, index) => {
    const sourceNode = nodes.find(n => n.id === rel.from);
    const targetNode = nodes.find(n => n.id === rel.to);
    
    if (sourceNode && targetNode) {
      const getEdgeStyle = (relType: string) => {
        switch (relType) {
          case 'injects':
            return { stroke: '#10b981', strokeWidth: 3, strokeDasharray: '5,5' };
          case 'calls':
            return { stroke: '#3b82f6', strokeWidth: 2 };
          case 'extends':
            return { stroke: '#8b5cf6', strokeWidth: 2 };
          case 'implements':
            return { stroke: '#f59e0b', strokeWidth: 2, strokeDasharray: '3,3' };
          default:
            return { stroke: '#6b7280', strokeWidth: 1 };
        }
      };
      
      edges.push({
        id: `${rel.from}-${rel.to}-${index}`,
        source: rel.from,
        target: rel.to,
        // Remove specific handle IDs to allow React Flow to auto-connect
        type: rel.type === 'extends' || rel.type === 'implements' ? 'straight' : 'smoothstep',
        animated: rel.type === 'calls',
        label: rel.type,
        style: getEdgeStyle(rel.type),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeStyle(rel.type).stroke,
        },
      });
    }
  });
  
  // Apply automatic layout with left-to-right for components
  const layouted = getLayoutedElements(nodes, edges, 'LR');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateClassDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const allClasses = analysisData.classes;

  allClasses.forEach((cls) => {
    nodes.push({
      id: cls.name,
      type: 'class',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: cls.name,
        className: cls.name,
        annotations: cls.annotations,
        methods: cls.methods,
        fields: cls.fields,
      },
    });
  });

  // Add relationship edges with UML-style styling
  analysisData.relationships.forEach((rel, index) => {
    const sourceExists = nodes.some(n => n.id === rel.from);
    const targetExists = nodes.some(n => n.id === rel.to);
    
    if (sourceExists && targetExists) {
      const getEdgeStyle = (relType: string) => {
        switch (relType) {
          case 'extends':
            return { strokeWidth: 2, stroke: '#000000' };
          case 'implements':
            return { strokeWidth: 2, stroke: '#000000', strokeDasharray: '8,4' };
          case 'injects':
            return { strokeWidth: 1, stroke: '#666666', strokeDasharray: '4,2' };
          default:
            return { strokeWidth: 1, stroke: '#cccccc' };
        }
      };
      
      edges.push({
        id: `${rel.from}-${rel.to}-${index}`,
        source: rel.from,
        target: rel.to,
        sourceHandle: 'source',
        targetHandle: 'target',
        type: 'smoothstep',
        label: rel.type,
        style: getEdgeStyle(rel.type),
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: getEdgeStyle(rel.type).stroke,
        },
      });
    }
  });

  // Apply automatic layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

function generateSequenceDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  // Enhanced UML sequence diagram with proper lifelines and interactions
  const actors = ['window : UI', 'aChain : HotelChain', 'aHotel : Hotel'];
  const actorSpacing = 250;
  const startY = 50;
  
  // Create actor header nodes
  actors.forEach((actor, index) => {
    nodes.push({
      id: `actor-${index}`,
      type: 'sequenceActor',
      position: { x: index * actorSpacing + 100, y: startY },
      data: {
        label: actor,
        actorType: 'participant'
      },
    });
    
    // Create lifeline (vertical dashed line) - represented as a tall invisible node
    nodes.push({
      id: `lifeline-${index}`,
      type: 'default',
      position: { x: index * actorSpacing + 170, y: startY + 60 },
      data: { label: '' },
      style: {
        width: 2,
        height: 400,
        background: 'transparent',
        border: '1px dashed #666',
        borderLeft: '2px dashed #666',
        borderRight: 'none',
        borderTop: 'none',
        borderBottom: 'none'
      },
    });
  });

  // Add activation boxes for method calls
  const activations = [
    { actor: 1, start: 120, height: 300, id: 'activation-1' },
    { actor: 2, start: 180, height: 100, id: 'activation-2' }
  ];
  
  activations.forEach(activation => {
    nodes.push({
      id: activation.id,
      type: 'sequenceActivation',
      position: { 
        x: activation.actor * actorSpacing + 162, 
        y: startY + activation.start 
      },
      data: { label: '' },
      style: {
        width: 12,
        height: activation.height,
        background: '#e5e7eb',
        border: '1px solid #9ca3af'
      }
    });
  });

  // Add loop fragment
  nodes.push({
    id: 'loop-fragment',
    type: 'sequenceLoop',
    position: { x: 320, y: startY + 140 },
    data: { 
      condition: 'each day',
      label: 'loop'
    },
    style: {
      width: 480,
      height: 180,
      background: 'rgba(239, 246, 255, 0.8)',
      border: '2px solid #3b82f6',
      borderRadius: '8px'
    }
  });

  // Add alternative fragment  
  nodes.push({
    id: 'alt-fragment',
    type: 'sequenceAlt',
    position: { x: 360, y: startY + 260 },
    data: { 
      condition: 'isRoom = true',
      label: 'alt'
    },
    style: {
      width: 400,
      height: 40,
      background: 'rgba(254, 242, 242, 0.8)',
      border: '2px solid #ef4444',
      borderRadius: '8px'
    }
  });

  // Create message arrows between actors
  const messages = [
    {
      id: 'msg-1',
      from: 0,
      to: 1,
      y: 100,
      label: '1: makeReservation',
      type: 'sync'
    },
    {
      id: 'msg-2', 
      from: 1,
      to: 2,
      y: 130,
      label: '1.1: makeReservation',
      type: 'sync'
    },
    {
      id: 'msg-3',
      from: 2,
      to: 2,
      y: 200,
      label: '1.1.1: available(roomId, date): isRoom',
      type: 'self'
    },
    {
      id: 'msg-4',
      from: 2,
      to: 1,
      y: 320,
      label: '1.1.2: aReservation : Reservation',
      type: 'response'
    },
    {
      id: 'msg-5',
      from: 1,
      to: 0,
      y: 380,
      label: '2: aNotice : Confirmation',
      type: 'async'
    }
  ];

  messages.forEach(msg => {
    if (msg.type === 'self') {
      // Self-message (rectangle to self)
      edges.push({
        id: msg.id,
        source: `actor-${msg.from}`,
        target: `actor-${msg.to}`,
        type: 'smoothstep',
        label: msg.label,
        style: { 
          strokeWidth: 2, 
          stroke: '#3b82f6'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#3b82f6',
        },
        labelStyle: { fontSize: '12px', fontWeight: 'bold' }
      });
    } else {
      // Regular message between actors
      const isResponse = msg.type === 'response';
      edges.push({
        id: msg.id,
        source: `actor-${msg.from}`,
        target: `actor-${msg.to}`,
        type: 'straight',
        label: msg.label,
        animated: msg.type === 'async',
        style: { 
          strokeWidth: 2, 
          stroke: isResponse ? '#10b981' : '#3b82f6',
          strokeDasharray: isResponse ? '5,5' : 'none'
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isResponse ? '#10b981' : '#3b82f6',
        },
        labelStyle: { 
          fontSize: '12px', 
          fontWeight: 'bold',
          background: 'white',
          padding: '2px 4px',
          borderRadius: '4px'
        }
      });
    }
  });
}

function generateERDiagram(analysisData: AnalysisData, nodes: Node[], edges: Edge[]) {
  const entities = analysisData.entities;

  entities.forEach((entity) => {
    nodes.push({
      id: entity.name,
      type: 'entity',
      position: { x: 0, y: 0 }, // Will be set by dagre layout
      data: {
        label: entity.name,
        className: entity.name,
        annotations: [`@Entity`],
        fields: entity.fields.slice(0, 5),
      },
    });
  });

  // Add relationship edges between entities
  entities.forEach(entity => {
    entity.fields.forEach((field, fieldIndex) => {
      if (field.relationship && field.targetEntity) {
        const targetExists = nodes.some(n => n.id === field.targetEntity);
        if (targetExists) {
          edges.push({
            id: `${entity.name}-${field.targetEntity}-${fieldIndex}`,
            source: entity.name,
            target: field.targetEntity,
            sourceHandle: 'source',
            targetHandle: 'target',
            type: 'smoothstep',
            label: field.relationship,
            style: { strokeWidth: 2 },
          });
        }
      }
    });
  });

  // Apply automatic layout
  const layouted = getLayoutedElements(nodes, edges, 'TB');
  nodes.splice(0, nodes.length, ...layouted.nodes);
  edges.splice(0, edges.length, ...layouted.edges);
}

export default function DiagramCanvas({ type, analysisData }: DiagramCanvasProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const { diagramNodes, diagramEdges } = useMemo(() => {
    return generateDiagram(type, analysisData);
  }, [type, analysisData]);

  useEffect(() => {
    setNodes(diagramNodes);
    setEdges(diagramEdges);
  }, [diagramNodes, diagramEdges, setNodes, setEdges]);

  useEffect(() => {
    const handleExport = (event: CustomEvent) => {
      const { format } = event.detail;
      if (format === 'png') {
        exportToPNG();
      } else if (format === 'svg') {
        exportToSVG();
      }
    };

    window.addEventListener('exportDiagram', handleExport as EventListener);
    return () => {
      window.removeEventListener('exportDiagram', handleExport as EventListener);
    };
  }, [type]);

  const exportToPNG = async () => {
    const reactFlowElement = document.querySelector('.react-flow') as HTMLElement;
    if (reactFlowElement) {
      try {
        const html2canvas = await import('html2canvas');
        const canvas = await html2canvas.default(reactFlowElement, {
          backgroundColor: '#ffffff',
          scale: 2
        });
        const link = document.createElement('a');
        link.download = `${type}-diagram.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
      } catch (error) {
        console.error('PNG export failed:', error);
        // Fallback: try to export using browser's built-in screenshot
        alert('PNG export is not available. Please use browser screenshot instead.');
      }
    }
  };

  const exportToSVG = () => {
    const svgElement = document.querySelector('.react-flow__renderer svg') as SVGElement;
    if (svgElement) {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGElement;
      
      // Add proper SVG namespace and styling
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      clonedSvg.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
      
      // Get the SVG's current viewBox or set a default
      const rect = svgElement.getBoundingClientRect();
      clonedSvg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
      clonedSvg.setAttribute('width', rect.width.toString());
      clonedSvg.setAttribute('height', rect.height.toString());
      
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);
      const link = document.createElement('a');
      link.download = `${type}-diagram.svg`;
      link.href = svgUrl;
      link.click();
      URL.revokeObjectURL(svgUrl);
    }
  };

  return (
    <div className="w-full h-[600px] border border-border rounded-lg overflow-hidden bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={type !== 'sequence'}
        attributionPosition="bottom-left"
        defaultViewport={type === 'sequence' ? { x: 0, y: 0, zoom: 0.8 } : { x: 0, y: 0, zoom: 0.8 }}
        minZoom={0.2}
        maxZoom={2}
        panOnScroll
        zoomOnDoubleClick={false}
      >
        <Background 
          variant={type === 'sequence' ? BackgroundVariant.Lines : BackgroundVariant.Dots} 
          gap={20} 
          size={1} 
          color="hsl(var(--muted-foreground) / 0.3)"
          className="bg-background dark:bg-card" 
        />
        <Controls 
          position="top-right"
          showInteractive={false}
          className="bg-card border-border shadow-lg rounded-lg [&>button]:bg-background [&>button]:border-border [&>button]:text-foreground hover:[&>button]:bg-muted"
        />
      </ReactFlow>
    </div>
  );
}