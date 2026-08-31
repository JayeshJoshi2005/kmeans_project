import React from 'react';
import { ValidationIssue } from '../types';

interface Props {
  issues: ValidationIssue[];
}

export const ValidationMessage: React.FC<Props> = ({ issues }) => {
  if (issues.length === 0) return null;

  return (
    <div className="validation-banner">
      <div className="validation-title">
        ⚠ Validation Error — Data Rejected
      </div>
      <ul className="validation-list">
        {issues.map((issue, idx) => (
          <li key={idx}>
            <strong>{issue.code}:</strong> {issue.message}
            {issue.itemId && (
              <span style={{ marginLeft: '0.375rem', padding: '0.125rem 0.375rem', backgroundColor: '#7f1d1d', borderRadius: '0.25rem', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>
                Item: {issue.itemId}
              </span>
            )}
          </li>
        ))}
      </ul>
      <p style={{ fontSize: '0.75rem', color: '#fca5a5', marginTop: '0.5rem', fontStyle: 'italic' }}>
        K-Means execution paused. Stale iterations, assignments, and metrics cleared.
      </p>
    </div>
  );
};
