import React from 'react';
import { formatDist, formatNumber } from '../format';
import { IterationResult, RunStatus } from '../types';

interface Props {
  currentResult: IterationResult | null;
  status: RunStatus;
}

export const IterationDetails: React.FC<Props> = ({ currentResult, status }) => {
  const iterationNumber = currentResult ? currentResult.iteration : 0;
  const sse = currentResult ? formatDist(currentResult.totalSquaredError) : '—';
  const maxMovement =
    currentResult && currentResult.movements.length > 0
      ? formatNumber(Math.max(...currentResult.movements.map((m) => m.movement)), 3)
      : '—';

  let convergenceLabel: string;
  let statusColor = 'var(--text-secondary)';

  if (status === 'converged') {
    convergenceLabel = '✓ Converged';
    statusColor = 'var(--accent-emerald)';
  } else if (status === 'not_converged') {
    convergenceLabel = '⚠ Max 20 Guard Limit';
    statusColor = 'var(--accent-amber)';
  } else if (status === 'invalid') {
    convergenceLabel = '✗ Invalid Data';
    statusColor = 'var(--accent-red)';
  } else if (iterationNumber === 0) {
    convergenceLabel = '— No iterations';
    statusColor = 'var(--text-muted)';
  } else {
    convergenceLabel = 'In Progress';
    statusColor = 'var(--accent-sky)';
  }

  return (
    <div className="metrics-grid">
      <div className="metric-card">
        <div className="metric-label">Iteration</div>
        <div className="metric-value">{iterationNumber}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Total Squared Error</div>
        <div className="metric-value" style={{ color: 'var(--accent-indigo)' }}>{sse}</div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Convergence</div>
        <div className="metric-value" style={{ fontSize: '1rem', color: statusColor, marginTop: '0.5rem' }}>
          {convergenceLabel}
        </div>
      </div>

      <div className="metric-card">
        <div className="metric-label">Max Centre Movement</div>
        <div className="metric-value" style={{ color: 'var(--accent-sky)' }}>{maxMovement}</div>
      </div>
    </div>
  );
};
