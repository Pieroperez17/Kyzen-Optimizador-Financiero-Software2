import { ReactFlow } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import FlowNode from './FlowNode.jsx';

const NODE_TYPES = { finance: FlowNode };

export default function FlowCanvas({ nodes, edges, className = '' }) {
  return (
    <div className={`flow-canvas ${className}`}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={NODE_TYPES}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnDrag={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        preventScrolling={false}
        minZoom={0.3}
      />
    </div>
  );
}
