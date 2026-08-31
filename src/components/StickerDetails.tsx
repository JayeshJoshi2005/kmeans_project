import React, { useEffect, useState } from 'react';
import { formatCoord, formatDist } from '../format';
import { Center, IterationResult, Sticker } from '../types';

interface Props {
  stickers: Sticker[];
  centers: Center[];
  currentResult: IterationResult | null;
  selectedStickerId: string | null;
  onSelectSticker: (id: string) => void;
  onUpdateSticker: (id: string, newWarmth: number, newSparkle: number) => void;
}

export const StickerDetails: React.FC<Props> = ({
  stickers,
  centers,
  currentResult,
  selectedStickerId,
  onSelectSticker,
  onUpdateSticker,
}) => {
  const selectedSticker = stickers.find((s) => s.id === selectedStickerId) ?? null;

  const [editWarmth, setEditWarmth] = useState('');
  const [editSparkle, setEditSparkle] = useState('');

  // Sync edit fields when selection changes
  useEffect(() => {
    if (selectedSticker) {
      setEditWarmth(selectedSticker.warmth.toString());
      setEditSparkle(selectedSticker.sparkle.toString());
    }
  }, [selectedStickerId, selectedSticker?.warmth, selectedSticker?.sparkle]);

  if (!selectedSticker) {
    return (
      <div className="component-card" style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
        Select a sticker from the map or dropdown to inspect.
      </div>
    );
  }

  const assignmentInfo = currentResult?.assignments.find(
    (a) => a.stickerId === selectedSticker.id
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const w = parseFloat(editWarmth);
    const s = parseFloat(editSparkle);
    onUpdateSticker(selectedSticker.id, w, s);
  };

  return (
    <div className="component-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Selector */}
      <div className="card-title" style={{ margin: 0, paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
        <span>Sticker Inspector & Editor</span>
        <select
          id="sticker-select"
          value={selectedSticker.id}
          onChange={(e) => onSelectSticker(e.target.value)}
          className="form-input"
          style={{ width: 'auto' }}
        >
          {stickers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.id})
            </option>
          ))}
        </select>
      </div>

      {/* Attributes */}
      <div style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
        <div><strong>{selectedSticker.name}</strong> <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', fontSize: '0.75rem' }}>({selectedSticker.id})</span></div>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Warmth: <strong>{formatCoord(selectedSticker.warmth)}</strong> &nbsp;|&nbsp;
          Sparkle: <strong>{formatCoord(selectedSticker.sparkle)}</strong>
        </div>
      </div>

      {/* Assignment & tie info */}
      {assignmentInfo ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
            Assigned to: <strong style={{ color: 'var(--accent-emerald)', fontSize: '0.9375rem' }}>{assignmentInfo.centerId}</strong>
          </div>

          {assignmentInfo.isTie && (
            <div className="retained-badge" style={{ margin: 0 }}>
              <strong>Tie detected:</strong> {assignmentInfo.winningReason}
            </div>
          )}
          {!assignmentInfo.isTie && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              {assignmentInfo.winningReason}
            </div>
          )}

          {/* Squared distances to every current centre */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.375rem' }}>
              Squared distances to current centres
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
              {assignmentInfo.distances.map((d) => {
                const c = centers.find((c) => c.id === d.centerId);
                const isChosen = d.centerId === assignmentInfo.centerId;
                const isTied = assignmentInfo.tiedCenterIds.includes(d.centerId);

                return (
                  <div
                    key={d.centerId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '0.375rem 0.625rem',
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      border: '1px solid ' + (isChosen ? 'var(--accent-emerald)' : isTied ? 'var(--accent-amber)' : 'var(--border-color)'),
                      backgroundColor: isChosen ? '#064e3b' : isTied ? '#78350f' : 'var(--bg-surface)',
                      color: isChosen ? '#6ee7b7' : isTied ? '#fde68a' : 'var(--text-secondary)',
                    }}
                  >
                    <span>
                      {d.centerId}
                      {c ? ` (${formatCoord(c.warmth)}, ${formatCoord(c.sparkle)})` : ''}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{formatDist(d.squaredDistance)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
          No iterations run. Step or Run to End to compute distances.
        </p>
      )}

      {/* Edit form */}
      <form onSubmit={handleSubmit} className="edit-form">
        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Edit coordinates
        </div>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="warmth-input" className="form-label">Warmth</label>
            <input
              id="warmth-input"
              type="number"
              step="any"
              value={editWarmth}
              onChange={(e) => setEditWarmth(e.target.value)}
              className="form-input"
            />
          </div>
          <div className="form-group">
            <label htmlFor="sparkle-input" className="form-label">Sparkle</label>
            <input
              id="sparkle-input"
              type="number"
              step="any"
              value={editSparkle}
              onChange={(e) => setEditSparkle(e.target.value)}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-indigo" style={{ padding: '0.375rem 0.75rem', fontSize: '0.8125rem' }}>
            Update & Restart
          </button>
        </div>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
          Valid range: 0.0–10.0. Updates sticker, restores original centres, clears iteration history.
        </p>
      </form>
    </div>
  );
};
