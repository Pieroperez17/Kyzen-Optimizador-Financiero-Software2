import { MarkerType } from '@xyflow/react';

export default class FlowBuilder {
  static COLUMN_WIDTH = 270;
  static ROW_HEIGHT = 78;

  constructor(columnWidth = FlowBuilder.COLUMN_WIDTH, rowHeight = FlowBuilder.ROW_HEIGHT) {
    this.columnWidth = columnWidth;
    this.rowHeight = rowHeight;
    this.nodes = [];
    this.edges = [];
  }

  addNode(identifier, column, row, data) {
    this.nodes.push({
      id: identifier,
      type: 'finance',
      position: { x: column * this.columnWidth, y: row * this.rowHeight },
      data
    });
    return this;
  }

  connect(source, target, { color = '#6366f1', weight = 2, animated = true } = {}) {
    this.edges.push({
      id: `${source}-${target}`,
      source,
      target,
      type: 'smoothstep',
      animated,
      style: { stroke: color, strokeWidth: weight },
      markerEnd: { type: MarkerType.ArrowClosed, color, width: 16, height: 16 }
    });
    return this;
  }

  static weightFor(amount, maximum) {
    if (!maximum) return 2;
    return 1.5 + (amount / maximum) * 4;
  }

  build() {
    return { nodes: this.nodes, edges: this.edges };
  }
}
