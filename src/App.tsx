import React, { useState } from 'react';
import { Controls } from './components/Controls';
import { IterationDetails } from './components/IterationDetails';
import { PanelCards } from './components/PanelCards';
import { ScatterPlot } from './components/ScatterPlot';
import { StickerDetails } from './components/StickerDetails';
import { ValidationMessage } from './components/ValidationMessage';
import { MAIN_DEMO_COLLECTION } from './data/demoData';
import { runIteration, validateCollection } from './engine';
import { Collection, IterationResult, RunStatus } from './types';

export const App: React.FC = () => {
  // Snapshot of original demo collection for Reset and centre restoration (null = nothing loaded)
  const [originalCollection, setOriginalCollection] = useState<Collection | null>(null);
  // Live editable collection (null = nothing loaded)
  const [collection, setCollection] = useState<Collection | null>(null);
  // Accumulated iteration results
  const [iterationHistory, setIterationHistory] = useState<IterationResult[]>([]);
  // Selected sticker for inspector
  const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null);

  // Derived state (computed each render)
  const validationResult = collection ? validateCollection(collection) : { isValid: true, issues: [] };

  const currentResult: IterationResult | null =
    iterationHistory.length > 0 ? iterationHistory[iterationHistory.length - 1] : null;

  const currentCenters = currentResult
    ? currentResult.centers
    : collection
      ? collection.centers
      : [];

  const previousSignature = currentResult ? currentResult.assignmentSignature : undefined;

  // Status derivation
  let status: RunStatus;
  if (!collection) {
    status = 'empty';
  } else if (!validationResult.isValid) {
    status = 'invalid';
  } else if (currentResult?.isConverged) {
    status = 'converged';
  } else if (currentResult?.isNotConvergedGuard) {
    status = 'not_converged';
  } else {
    status = 'ready';
  }

  const isFinished = status === 'converged' || status === 'not_converged';

  // Event Handlers
  const handleLoadDemo = () => {
    setOriginalCollection(MAIN_DEMO_COLLECTION);
    setCollection(MAIN_DEMO_COLLECTION);
    setIterationHistory([]);
    setSelectedStickerId(MAIN_DEMO_COLLECTION.stickers[0]?.id ?? null);
  };

  const handleStep = () => {
    if (!collection || status === 'invalid' || isFinished) return;

    const nextIteration = iterationHistory.length + 1;
    const inputCenters = currentResult ? currentResult.centers : collection.centers;

    const result = runIteration(
      collection.stickers,
      inputCenters,
      nextIteration,
      previousSignature
    );

    setIterationHistory((prev) => [...prev, result]);
  };

  const handleRunToEnd = () => {
    if (!collection || status === 'invalid' || isFinished) return;

    const history = [...iterationHistory];

    for (let guard = 0; guard < 25; guard++) {
      const last = history.length > 0 ? history[history.length - 1] : null;
      const nextIteration = history.length + 1;
      const inputCenters = last ? last.centers : collection.centers;
      const prevSig = last ? last.assignmentSignature : undefined;

      const result = runIteration(collection.stickers, inputCenters, nextIteration, prevSig);
      history.push(result);

      if (result.isConverged || result.isNotConvergedGuard) break;
    }

    setIterationHistory(history);
  };

  const handleReset = () => {
    if (!originalCollection) return;
    setCollection(originalCollection);
    setIterationHistory([]);
    setSelectedStickerId(originalCollection.stickers[0]?.id ?? null);
  };

  const handleUpdateSticker = (id: string, newWarmth: number, newSparkle: number) => {
    if (!collection || !originalCollection) return;

    const updatedStickers = collection.stickers.map((s) =>
      s.id === id ? { ...s, warmth: newWarmth, sparkle: newSparkle } : s
    );

    const updatedCollection: Collection = {
      ...collection,
      stickers: updatedStickers,
      centers: originalCollection.centers, // restore original starting centres
    };

    setCollection(updatedCollection);
    setIterationHistory([]); // clear stale iterations, groups, and metrics
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="app-header">
        <h1 className="app-title">Sticker Wall K-Means Curator</h1>
        <p className="app-subtitle">
          Interactive visual explanation of deterministic K-Means clustering. Load a themed sticker
          collection, step through iterations to watch stickers choose display panels based on their
          warmth and sparkle scores, and inspect tie-breaking decisions.
        </p>
      </header>

      {/* Controls & Toolbar */}
      <Controls
        status={status}
        onLoadDemo={handleLoadDemo}
        onStep={handleStep}
        onRunToEnd={handleRunToEnd}
        onReset={handleReset}
      />

      {/* Validation error banner */}
      <ValidationMessage issues={validationResult.issues} />

      {/* Empty State */}
      {!collection && (
        <div className="component-card" style={{ textAlign: 'center', padding: '3rem 1.5rem', color: 'var(--text-muted)' }}>
          <p style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            No Collection Loaded
          </p>
          <p style={{ fontSize: '0.875rem' }}>
            Click <strong>Load Demo</strong> to load the Festival Mascot collection ($k = 2$, 8 stickers) and fixed starting centres.
          </p>
        </div>
      )}

      {/* Main Workspace (when loaded) */}
      {collection && (
        <main>
          {/* Metrics summary bar */}
          <IterationDetails currentResult={currentResult} status={status} />

          {/* Interactive Workspace Grid: Map + Inspector */}
          <div className="workspace-grid">
            <ScatterPlot
              stickers={collection.stickers}
              centers={currentCenters}
              originalCenters={originalCollection?.centers ?? collection.centers}
              currentResult={currentResult}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
            />

            <StickerDetails
              stickers={collection.stickers}
              centers={currentCenters}
              currentResult={currentResult}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
              onUpdateSticker={handleUpdateSticker}
            />
          </div>

          {/* Panel Cards */}
          <section>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
              Display Panel Cards
            </h2>
            <PanelCards
              centers={currentCenters}
              stickers={collection.stickers}
              currentResult={currentResult}
              selectedStickerId={selectedStickerId}
              onSelectSticker={setSelectedStickerId}
            />
          </section>
        </main>
      )}
    </div>
  );
};
