import React from 'react';
import { DiagramSpec } from '../types';

interface DiagramCanvasProps {
  diagram: DiagramSpec;
  compact?: boolean;
}

interface PositionedNode {
  id: string;
  label: string;
  sublabel?: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

function truncateText(text: string, maxLen: number): string {
  if (!text) return '';
  return text.length > maxLen ? `${text.slice(0, maxLen - 1)}…` : text;
}

function computePositions(spec: DiagramSpec): {
  width: number;
  height: number;
  nodes: PositionedNode[];
} {
  const nodes = spec.nodes.slice(0, 6);
  const count = nodes.length;

  if (count === 0) {
    return { width: 640, height: 220, nodes: [] };
  }

  if (spec.layout === 'layered') {
    const width = 640;
    const nodeW = 340;
    const nodeH = 54;
    const gapY = 26;
    const startY = 24;
    const height = Math.max(240, startY * 2 + count * nodeH + Math.max(0, count - 1) * gapY);

    return {
      width,
      height,
      nodes: nodes.map((n, idx) => ({
        ...n,
        x: (width - nodeW) / 2,
        y: startY + idx * (nodeH + gapY),
        w: nodeW,
        h: nodeH,
      })),
    };
  }

  if (spec.layout === 'cycle' && count >= 3) {
    const width = 640;
    const height = 320;
    const nodeW = 164;
    const nodeH = 56;
    const cx = width / 2;
    const cy = height / 2;
    const rx = 185;
    const ry = 95;

    return {
      width,
      height,
      nodes: nodes.map((n, idx) => {
        const angle = -Math.PI / 2 + (idx * 2 * Math.PI) / count;
        return {
          ...n,
          x: cx + rx * Math.cos(angle) - nodeW / 2,
          y: cy + ry * Math.sin(angle) - nodeH / 2,
          w: nodeW,
          h: nodeH,
        };
      }),
    };
  }

  if (spec.layout === 'hub' && count >= 3) {
    const width = 640;
    const height = 320;
    const nodeW = 160;
    const nodeH = 56;
    const cx = width / 2;
    const cy = height / 2;
    const satellites = count - 1;
    const rx = 200;
    const ry = 96;

    const positioned: PositionedNode[] = [
      {
        ...nodes[0],
        x: cx - nodeW / 2,
        y: cy - nodeH / 2,
        w: nodeW,
        h: nodeH,
      },
    ];

    for (let i = 1; i < count; i++) {
      const angle = -Math.PI / 2 + ((i - 1) * 2 * Math.PI) / satellites;
      positioned.push({
        ...nodes[i],
        x: cx + rx * Math.cos(angle) - nodeW / 2,
        y: cy + ry * Math.sin(angle) - nodeH / 2,
        w: nodeW,
        h: nodeH,
      });
    }

    return { width, height, nodes: positioned };
  }

  // Default: 'flow' layout — 2-row serpentine grid for 4-6 nodes, or 1-row for <= 3
  const width = 680;
  const nodeW = 172;
  const nodeH = 62;

  if (count <= 3) {
    const gapX = 42;
    const totalW = count * nodeW + (count - 1) * gapX;
    const startX = (width - totalW) / 2;
    const y = 94;
    return {
      width,
      height: 250,
      nodes: nodes.map((n, idx) => ({
        ...n,
        x: startX + idx * (nodeW + gapX),
        y,
        w: nodeW,
        h: nodeH,
      })),
    };
  }

  const topCount = Math.ceil(count / 2);
  const bottomCount = count - topCount;
  const gapX = 38;
  const topTotalW = topCount * nodeW + (topCount - 1) * gapX;
  const bottomTotalW = bottomCount * nodeW + (bottomCount - 1) * gapX;
  const topStartX = (width - topTotalW) / 2;
  const bottomStartX = (width - bottomTotalW) / 2;

  const positioned: PositionedNode[] = [];
  for (let i = 0; i < topCount; i++) {
    positioned.push({
      ...nodes[i],
      x: topStartX + i * (nodeW + gapX),
      y: 44,
      w: nodeW,
      h: nodeH,
    });
  }
  for (let j = 0; j < bottomCount; j++) {
    const idx = topCount + j;
    positioned.push({
      ...nodes[idx],
      x: bottomStartX + (bottomCount - 1 - j) * (nodeW + gapX),
      y: 178,
      w: nodeW,
      h: nodeH,
    });
  }

  return { width, height: 286, nodes: positioned };
}

function getEdgeAnchors(a: PositionedNode, b: PositionedNode) {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;

  const dx = bx - ax;
  const dy = by - ay;

  let x1 = ax;
  let y1 = ay;
  let x2 = bx;
  let y2 = by;

  if (Math.abs(dx) > Math.abs(dy)) {
    x1 = dx > 0 ? a.x + a.w : a.x;
    x2 = dx > 0 ? b.x : b.x + b.w;
  } else {
    y1 = dy > 0 ? a.y + a.h : a.y;
    y2 = dy > 0 ? b.y : b.y + b.h;
  }

  return { x1, y1, x2, y2 };
}

export const DiagramCanvas: React.FC<DiagramCanvasProps> = ({ diagram, compact = false }) => {
  const { width, height, nodes } = computePositions(diagram);
  const nodeMap = new Map<string, PositionedNode>();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const markerId = React.useId().replace(/:/g, '');

  return (
    <div className="rounded-xl border border-white/[0.08] bg-[#0F1014] overflow-hidden">
      <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-b border-white/[0.06] bg-white/[0.02]">
        <span className="text-xs font-medium text-zinc-200 truncate">{diagram.title}</span>
        <span className="text-[11px] text-zinc-400 uppercase tracking-wider shrink-0 font-mono">
          {diagram.layout}
        </span>
      </div>

      <div className={compact ? 'p-3' : 'p-4'}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto block select-none"
          role="img"
          aria-label={diagram.title}
        >
          <defs>
            <pattern
              id={`grid-${markerId}`}
              width="24"
              height="24"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 24 0 L 0 0 0 24"
                fill="none"
                stroke="rgba(255,255,255,0.035)"
                strokeWidth="1"
              />
            </pattern>
            <marker
              id={`arrow-${markerId}`}
              viewBox="0 0 10 10"
              refX="8.5"
              refY="5"
              markerWidth="6.5"
              markerHeight="6.5"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#60A5FA" />
            </marker>
          </defs>

          <rect x="0" y="0" width={width} height={height} fill={`url(#grid-${markerId})`} rx="8" />

          {/* Edges */}
          {diagram.edges.map((edge, idx) => {
            const fromNode = nodeMap.get(edge.from);
            const toNode = nodeMap.get(edge.to);
            if (!fromNode || !toNode) return null;

            const { x1, y1, x2, y2 } = getEdgeAnchors(fromNode, toNode);
            const mx = (x1 + x2) / 2;
            const my = (y1 + y2) / 2;

            return (
              <g key={`${edge.from}-${edge.to}-${idx}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#60A5FA"
                  strokeOpacity="0.7"
                  strokeWidth="1.75"
                  markerEnd={`url(#arrow-${markerId})`}
                />
                {edge.label ? (
                  <g>
                    <rect
                      x={mx - 44}
                      y={my - 10}
                      width="88"
                      height="18"
                      rx="4"
                      fill="#111318"
                      stroke="rgba(255,255,255,0.12)"
                      strokeWidth="1"
                    />
                    <text
                      x={mx}
                      y={my + 2.5}
                      textAnchor="middle"
                      fill="#93C5FD"
                      fontSize="10"
                      fontFamily="JetBrains Mono, monospace"
                    >
                      {truncateText(edge.label, 14)}
                    </text>
                  </g>
                ) : null}
              </g>
            );
          })}

          {/* Nodes */}
          {nodes.map((node, idx) => (
            <g key={node.id}>
              <rect
                x={node.x}
                y={node.y}
                width={node.w}
                height={node.h}
                rx="10"
                fill={idx === 0 ? '#182235' : '#171920'}
                stroke={idx === 0 ? '#3B82F6' : 'rgba(255,255,255,0.16)'}
                strokeWidth="1.5"
              />
              <text
                x={node.x + node.w / 2}
                y={node.sublabel ? node.y + node.h / 2 - 4 : node.y + node.h / 2 + 4}
                textAnchor="middle"
                fill="#F3F4F6"
                fontSize="12.5"
                fontWeight="600"
                fontFamily="Plus Jakarta Sans, sans-serif"
              >
                {truncateText(node.label, 21)}
              </text>
              {node.sublabel ? (
                <text
                  x={node.x + node.w / 2}
                  y={node.y + node.h / 2 + 13}
                  textAnchor="middle"
                  fill="#9CA3AF"
                  fontSize="10.5"
                  fontFamily="DM Sans, sans-serif"
                >
                  {truncateText(node.sublabel, 25)}
                </text>
              ) : null}
            </g>
          ))}
        </svg>
      </div>

      {diagram.caption ? (
        <div className="px-4 py-2 border-t border-white/[0.06] text-xs text-zinc-400">
          {diagram.caption}
        </div>
      ) : null}
    </div>
  );
};
