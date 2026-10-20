import { Handle, Position } from '@xyflow/react';
import CategoryIcon from '../CategoryIcon.jsx';

export default function FlowNode({ data }) {
  return (
    <div className={`flow-node flow-node-${data.variant || 'default'}`} style={{ '--node-color': data.color || '#4f46e5' }}>
      {data.hasInput && <Handle type="target" position={Position.Left} isConnectable={false} />}
      <span className="flow-node-icon">
        {data.icon ? <data.icon size={18} aria-hidden="true" /> : <CategoryIcon name={data.iconName} size={18} />}
      </span>
      <div className="flow-node-text">
        <strong>{data.title}</strong>
        {data.subtitle && <span>{data.subtitle}</span>}
      </div>
      {data.hasOutput && <Handle type="source" position={Position.Right} isConnectable={false} />}
    </div>
  );
}
