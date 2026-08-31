import React from 'react';
import { formatCoord } from '../format';
import { Center, IterationResult, Sticker } from '../types';

interface Props {
  stickers: Sticker[];
  centers: Center[];
  originalCenters: Center[];
  currentResult: IterationResult | null;
  selectedStickerId: string | null;
  onSelectSticker: (id: string) => void;
}

const CENTER_COLORS = ['#10b981', '#6366f1', '#f59e0b', '#d946ef'];
const STICKER_SHAPES = ['circle', 'rect', 'triangle', 'diamond'];

export const ScatterPlot: React.FC<Props> = ({
  stickers,
  centers,
  originalCenters,
  currentResult,
  selectedStickerId,
  onSelectSticker,
}) => {
  // SVG dimensions
  const svgWidth = 540;
  const svgHeight = 540;
  const padding = 50;
  const plotWidth = svgWidth - padding * 2;
  const plotHeight = svgHeight - padding * 2;

  // Coordinate mapping: Warmth (0..10) -> X, Sparkle (0..10) -> Y (inverted Y for SVG)
  const mapX = (warmth: number) => padding + (warmth / 10) * plotWidth;
  const mapY = (sparkle: number) => svgHeight - padding - (sparkle / 10) * plotHeight;

  // Grid lines
  const gridTicks = [0, 2, 4, 6, 8, 10];

  return (
    <div className="component-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div className="card-title" style={{ width: '100%', marginBottom: '0.75rem' }}>
        <span>Warmth vs. Sparkle Interactive Map</span>
        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>Scale: [0, 10]</span>
      </div>

      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        style={{
          width: '100%',
          height: 'auto',
          maxWidth: '540px',
          backgroundColor: 'var(--bg-main)',
          borderRadius: '0.5rem',
          border: '1px solid var(--border-color)',
          userSelect: 'none',
        }}
      >
        {/* Grid Background */}
        {gridTicks.map((tick) => {
          const x = mapX(tick);
          const y = mapY(tick);
          return (
            <g key={tick}>
              {/* Vertical grid line */}
              <line
                x1={x}
                y1={padding}
                x2={x}
                y2={svgHeight - padding}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* Horizontal grid line */}
              <line
                x1={padding}
                y1={y}
                x2={svgWidth - padding}
                y2={y}
                stroke="#374151"
                strokeWidth="1"
                strokeDasharray="3 3"
              />
              {/* X Axis Tick Labels */}
              <text
                x={x}
                y={svgHeight - padding + 20}
                fill="#9ca3af"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="middle"
              >
                {tick}
              </text>
              {/* Y Axis Tick Labels */}
              <text
                x={padding - 15}
                y={y + 4}
                fill="#9ca3af"
                fontSize="11"
                fontFamily="sans-serif"
                textAnchor="end"
              >
                {tick}
              </text>
            </g>
          );
        })}

        {/* Axes Border */}
        <rect
          x={padding}
          y={padding}
          width={plotWidth}
          height={plotHeight}
          fill="none"
          stroke="#4b5563"
          strokeWidth="1.5"
        />

        {/* Axis Labels */}
        <text
          x={svgWidth / 2}
          y={svgHeight - 12}
          fill="#f3f4f6"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
        >
          Warmth → (0 to 10)
        </text>
        <text
          x={16}
          y={svgHeight / 2}
          fill="#f3f4f6"
          fontSize="12"
          fontWeight="bold"
          textAnchor="middle"
          transform={`rotate(-90 16 ${svgHeight / 2})`}
        >
          Sparkle → (0 to 10)
        </text>

        {/* Assignment Lines (from sticker to current assigned centre) */}
        {currentResult &&
          stickers.map((sticker) => {
            const assign = currentResult.assignments.find((a) => a.stickerId === sticker.id);
            if (!assign) return null;

            const centerObj = centers.find((c) => c.id === assign.centerId);
            if (!centerObj) return null;

            const cIdx = centers.findIndex((c) => c.id === assign.centerId);
            const lineColor = CENTER_COLORS[cIdx % CENTER_COLORS.length];

            const x1 = mapX(sticker.warmth);
            const y1 = mapY(sticker.sparkle);
            const x2 = mapX(centerObj.warmth);
            const y2 = mapY(centerObj.sparkle);

            const isSelected = sticker.id === selectedStickerId;

            return (
              <line
                key={`line-${sticker.id}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={lineColor}
                strokeWidth={isSelected ? '2.5' : '1.2'}
                strokeDasharray={isSelected ? 'none' : '4 4'}
                opacity={isSelected ? 0.95 : 0.45}
                className="animated-svg-element"
              />
            );
          })}

        {/* Original Initial Centres (Hollow / Dashed Markers) */}
        {originalCenters.map((origCenter, cIdx) => {
          const cx = mapX(origCenter.warmth);
          const cy = mapY(origCenter.sparkle);
          const color = CENTER_COLORS[cIdx % CENTER_COLORS.length];

          return (
            <g key={`orig-${origCenter.id}`}>
              <circle
                cx={cx}
                cy={cy}
                r="10"
                fill="none"
                stroke={color}
                strokeWidth="2"
                strokeDasharray="3 3"
                opacity="0.6"
              />
              <text
                x={cx}
                y={cy - 14}
                fill={color}
                fontSize="9"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                opacity="0.7"
              >
                Init {origCenter.id}
              </text>
            </g>
          );
        })}

        {/* Current Panel Centres (Solid Cross/Star Markers) */}
        {centers.map((center, cIdx) => {
          const cx = mapX(center.warmth);
          const cy = mapY(center.sparkle);
          const color = CENTER_COLORS[cIdx % CENTER_COLORS.length];

          return (
            <g key={`center-${center.id}`}>
              {/* Outer halo */}
              <circle cx={cx} cy={cy} r="14" fill={color} fillOpacity="0.2" className="animated-svg-element" />
              {/* Center Marker shape */}
              <polygon
                points={`${cx},${cy - 9} ${cx + 3},${cy - 3} ${cx + 9},${cy - 3} ${cx + 4},${cy + 1} ${cx + 6},${cy + 8} ${cx},${cy + 4} ${cx - 6},${cy + 8} ${cx - 4},${cy + 1} ${cx - 9},${cy - 3} ${cx - 3},${cy - 3}`}
                fill={color}
                stroke="#111827"
                strokeWidth="1.5"
                className="animated-svg-element"
              />
              <text
                x={cx}
                y={cy + 20}
                fill={color}
                fontSize="11"
                fontFamily="sans-serif"
                fontWeight="bold"
                textAnchor="middle"
                className="animated-svg-element"
              >
                {center.name} ({formatCoord(center.warmth)}, {formatCoord(center.sparkle)})
              </text>
            </g>
          );
        })}

        {/* Sticker Markers */}
        {stickers.map((sticker, sIdx) => {
          const sx = mapX(sticker.warmth);
          const sy = mapY(sticker.sparkle);
          const isSelected = sticker.id === selectedStickerId;

          const assign = currentResult?.assignments.find((a) => a.stickerId === sticker.id);
          const cIdx = assign ? centers.findIndex((c) => c.id === assign.centerId) : -1;
          const markerColor = cIdx >= 0 ? CENTER_COLORS[cIdx % CENTER_COLORS.length] : '#9ca3af';

          const shapeType = STICKER_SHAPES[sIdx % STICKER_SHAPES.length];

          return (
            <g
              key={`sticker-${sticker.id}`}
              onClick={() => onSelectSticker(sticker.id)}
              style={{ cursor: 'pointer' }}
            >
              {/* Selection Ring */}
              {isSelected && (
                <circle
                  cx={sx}
                  cy={sy}
                  r="13"
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth="2.5"
                  className="animated-svg-element"
                />
              )}

              {/* Shape Render */}
              {shapeType === 'circle' && (
                <circle
                  cx={sx}
                  cy={sy}
                  r="7"
                  fill={markerColor}
                  stroke="#111827"
                  strokeWidth="1.5"
                  className="animated-svg-element"
                />
              )}
              {shapeType === 'rect' && (
                <rect
                  x={sx - 6}
                  y={sy - 6}
                  width="12"
                  height="12"
                  fill={markerColor}
                  stroke="#111827"
                  strokeWidth="1.5"
                  rx="2"
                  className="animated-svg-element"
                />
              )}
              {shapeType === 'triangle' && (
                <polygon
                  points={`${sx},${sy - 7} ${sx + 7},${sy + 6} ${sx - 7},${sy + 6}`}
                  fill={markerColor}
                  stroke="#111827"
                  strokeWidth="1.5"
                  className="animated-svg-element"
                />
              )}
              {shapeType === 'diamond' && (
                <polygon
                  points={`${sx},${sy - 7} ${sx + 7},${sy} ${sx},${sy + 7} ${sx - 7},${sy}`}
                  fill={markerColor}
                  stroke="#111827"
                  strokeWidth="1.5"
                  className="animated-svg-element"
                />
              )}

              {/* Sticker Label */}
              <text
                x={sx}
                y={sy - 10}
                fill={isSelected ? '#f59e0b' : '#f9fafb'}
                fontSize="10"
                fontFamily="sans-serif"
                fontWeight={isSelected ? 'bold' : 'normal'}
                textAnchor="middle"
                className="animated-svg-element"
              >
                {sticker.name}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Colour + Shape Independent Legend */}
      <div
        style={{
          width: '100%',
          marginTop: '0.75rem',
          padding: '0.75rem',
          backgroundColor: 'var(--bg-main)',
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          fontSize: '0.75rem',
          color: 'var(--text-secondary)',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontWeight: 700, color: 'var(--text-primary)' }}>Legend:</span>
          {centers.map((center, cIdx) => (
            <div key={center.id} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <span
                style={{
                  width: '0.75rem',
                  height: '0.75rem',
                  borderRadius: '50%',
                  display: 'inline-block',
                  backgroundColor: CENTER_COLORS[cIdx % CENTER_COLORS.length],
                }}
              />
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{center.name} ({center.id})</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <span>⭐ Current Centre</span>
          <span>◌ Initial Position</span>
          <span>-- Assignment Line</span>
        </div>
      </div>
    </div>
  );
};
