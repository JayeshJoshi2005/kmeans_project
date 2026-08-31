import React from 'react';
import { RunStatus } from '../types';

interface Props {
  status: RunStatus;
  onLoadDemo: () => void;
  onStep: () => void;
  onRunToEnd: () => void;
  onReset: () => void;
}

export const Controls: React.FC<Props> = ({
  status,
  onLoadDemo,
  onStep,
  onRunToEnd,
  onReset,
}) => {
  const isFinished = status === 'converged' || status === 'not_converged';
  const isEmpty = status === 'empty';
  const isInvalid = status === 'invalid';

  const canStepOrRun = !isEmpty && !isFinished && !isInvalid;

  return (
    <div className="toolbar-card">
      <div className="button-group">
        <button
          id="btn-load-demo"
          onClick={onLoadDemo}
          className="btn btn-indigo"
        >
          Load Demo
        </button>

        <button
          id="btn-step"
          onClick={onStep}
          disabled={!canStepOrRun}
          className="btn btn-amber"
        >
          Step
        </button>

        <button
          id="btn-run-to-end"
          onClick={onRunToEnd}
          disabled={!canStepOrRun}
          className="btn btn-emerald"
        >
          Run to End
        </button>

        <button
          id="btn-reset"
          onClick={onReset}
          disabled={isEmpty}
          className="btn btn-rose"
        >
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
        <span>Status:</span>
        <span className={`status-badge status-${status}`}>
          {status.replace('_', ' ')}
        </span>
      </div>
    </div>
  );
};
