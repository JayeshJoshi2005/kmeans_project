import React from 'react';
import { formatCoord, formatDist } from '../format';
import { Center, IterationResult, Sticker } from '../types';

interface Props {
  centers: Center[];
  stickers: Sticker[];
  currentResult: IterationResult | null;
  selectedStickerId: string | null;
  onSelectSticker: (id: string) => void;
}

export const PanelCards: React.FC<Props> = ({
  centers,
  stickers,
  currentResult,
  selectedStickerId,
  onSelectSticker,
}) => {
  return (
    <div className="panel-grid">
      {centers.map((center) => {
        const movementInfo = currentResult?.movements.find((m) => m.centerId === center.id);

        // Members assigned to this centre, preserving sticker source order
        const memberStickers = stickers.filter((sticker) => {
          if (!currentResult) return false;
          const assign = currentResult.assignments.find((a) => a.stickerId === sticker.id);
          return assign?.centerId === center.id;
        });

        const isRetained = movementInfo?.retainedBecauseEmpty ?? false;

        return (
          <div key={center.id} className="panel-card">
            {/* Centre header */}
            <div className="panel-header">
              <div>
                <span className="panel-id" style={{ color: 'var(--text-primary)' }}>{center.id}</span>
                <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>{center.name}</span>
              </div>
              <span className="panel-coords">
                ({formatCoord(center.warmth)}, {formatCoord(center.sparkle)})
              </span>
            </div>

            {/* Retained warning */}
            {isRetained && (
              <div className="retained-badge">
                <strong>Retained:</strong> 0 stickers assigned. Previous coordinates kept exactly; movement = 0.
              </div>
            )}

            {/* Movement */}
            {!isRetained && currentResult && (
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                <span>Centre Movement:</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-sky)' }}>
                  {movementInfo ? formatDist(movementInfo.movement) : '0'}
                </span>
              </div>
            )}

            {/* Members */}
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
              Members ({memberStickers.length})
            </div>

            {memberStickers.length === 0 && !currentResult && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No iterations run yet.</p>
            )}
            {memberStickers.length === 0 && currentResult && (
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No stickers assigned (empty panel).</p>
            )}

            {memberStickers.length > 0 && (
              <div className="sticker-list">
                {memberStickers.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => onSelectSticker(s.id)}
                    className={`sticker-button ${s.id === selectedStickerId ? 'selected' : ''}`}
                  >
                    {s.name} ({formatCoord(s.warmth)}, {formatCoord(s.sparkle)})
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
