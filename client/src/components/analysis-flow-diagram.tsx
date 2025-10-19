import { useCallback, useEffect } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  useReactFlow,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Upload, FileSearch, GitBranch, Brain, Shield, FileText, Search } from 'lucide-react';

const iconStyle = "w-5 h-5";

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'input',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Upload Repository</div>
          <div className="text-sm text-white mt-1">ZIP file or GitHub URL</div>
        </div>
      )
    },
    position: { x: 50, y: 50 },
    style: { 
      background: '#b8860b',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '2',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">AST Parsing</div>
          <div className="text-sm text-white mt-1">Tree-sitter extracts structure</div>
        </div>
      )
    },
    position: { x: 50, y: 180 },
    style: { 
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '3',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Diagram Generation</div>
          <div className="text-sm text-white mt-1">Flow, UML, Component diagrams</div>
        </div>
      )
    },
    position: { x: 350, y: 50 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '4',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Code Lens - Demographic Scanning</div>
          <div className="text-sm text-white mt-1">PII/PHI pattern detection</div>
        </div>
      )
    },
    position: { x: 350, y: 180 },
    style: { 
      background: '#1e40af',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '5',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">LLM Analysis</div>
          <div className="text-sm text-white mt-1">GPT-4o insights & recommendations</div>
        </div>
      )
    },
    position: { x: 650, y: 50 },
    style: { 
      background: '#2563eb',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '6',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Quality Analysis</div>
          <div className="text-sm text-white mt-1">Code quality & change impact</div>
        </div>
      )
    },
    position: { x: 650, y: 180 },
    style: { 
      background: '#3b82f6',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
  {
    id: '7',
    type: 'output',
    data: { 
      label: (
        <div className="px-4 py-3">
          <div className="font-bold text-white text-lg">Report Export</div>
          <div className="text-sm text-white mt-1">PDF/DOC with findings</div>
        </div>
      )
    },
    position: { x: 950, y: 115 },
    style: { 
      background: '#60a5fa',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '10px',
      width: 250,
      fontSize: '14px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
    },
  },
];

const initialEdges: Edge[] = [
  { 
    id: 'e1-2', 
    source: '1', 
    target: '2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e2-3', 
    source: '2', 
    target: '3',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e2-4', 
    source: '2', 
    target: '4',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e4-5', 
    source: '4', 
    target: '5',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e5-6', 
    source: '5', 
    target: '6',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e6-7', 
    source: '6', 
    target: '7',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  { 
    id: 'e3-7', 
    source: '3', 
    target: '7',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
];

function FlowContent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { fitView } = useReactFlow();

  useEffect(() => {
    setTimeout(() => {
      fitView({ padding: 0.2, duration: 300 });
    }, 0);
  }, [fitView]);

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
      fitViewOptions={{ padding: 0.2, duration: 300 }}
      attributionPosition="bottom-left"
      proOptions={{ hideAttribution: true }}
      nodesDraggable={true}
      nodesConnectable={false}
      elementsSelectable={true}
      zoomOnScroll={true}
      panOnScroll={true}
      panOnDrag={true}
      zoomOnPinch={true}
    >
      <Background variant={BackgroundVariant.Dots} gap={16} size={1} color="#e5e7eb" />
      <Controls />
    </ReactFlow>
  );
}

export default function AnalysisFlowDiagram() {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-lg w-full" style={{ height: '320px' }}>
      <ReactFlowProvider>
        <FlowContent />
      </ReactFlowProvider>
    </div>
  );
}
