import { useMemo } from 'react';
import { BellRing, FileText, Goal, Receipt, TrendingUp } from 'lucide-react';
import FlowBuilder from '../../domain/FlowBuilder.js';
import Logo from '../Logo.jsx';
import FlowCanvas from './FlowCanvas.jsx';

function KyzenIcon() {
  return <Logo size={22} />;
}

export default function HeroFlow() {
  const { nodes, edges } = useMemo(() => new FlowBuilder(200, 64)
    .addNode('income', 0, 0, { title: 'Ingresos', icon: TrendingUp, color: '#34d399', variant: 'glass', hasOutput: true })
    .addNode('expenses', 0, 2, { title: 'Gastos', icon: Receipt, color: '#fca5a5', variant: 'glass', hasOutput: true })
    .addNode('kyzen', 1, 1, { title: 'Kyzen', icon: KyzenIcon, color: '#ffffff', variant: 'glass-strong', hasInput: true, hasOutput: true })
    .addNode('alerts', 2, 0, { title: 'Alerta al 80 %', icon: BellRing, color: '#fcd34d', variant: 'glass', hasInput: true })
    .addNode('goals', 2, 1, { title: 'Metas de ahorro', icon: Goal, color: '#a5b4fc', variant: 'glass', hasInput: true })
    .addNode('reports', 2, 2, { title: 'Reportes', icon: FileText, color: '#67e8f9', variant: 'glass', hasInput: true })
    .connect('income', 'kyzen', { color: '#34d399' })
    .connect('expenses', 'kyzen', { color: '#fca5a5' })
    .connect('kyzen', 'alerts', { color: '#fcd34d' })
    .connect('kyzen', 'goals', { color: '#a5b4fc' })
    .connect('kyzen', 'reports', { color: '#67e8f9' })
    .build(), []);

  return <FlowCanvas nodes={nodes} edges={edges} className="flow-canvas-hero" />;
}
