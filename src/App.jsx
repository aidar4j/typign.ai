import React, { useState } from 'react';
import TypingEngine from './components/TypingEngine';
import Results from './components/Results';
import { getRandomSnippet } from './utils/codeSnippets';

function App() {
  const [results, setResults] = useState(null);
  const [mode, setMode] = useState('daily'); // 'training' | 'daily' | 'code' | 'custom'
  const [restartKey, setRestartKey] = useState(0);
  const [customWords, setCustomWords] = useState([]);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);
  const [customTextInput, setCustomTextInput] = useState('');

  const handleComplete = (stats) => {
    setResults({ ...stats, mode });
  };

  const handleRestart = () => {
    setResults(null);

    // Regenerate data if needed based on mode
    if (mode === 'code') {
      const snippet = getRandomSnippet();
      setCustomWords(snippet.words);
    }
    // For custom, we keep the same customWords unless changed via modal

    setRestartKey(prev => prev + 1);
  };

  const handleStartCustom = () => {
    if (!customTextInput.trim()) return;
    const words = customTextInput.trim().split(/\s+/).filter(w => w.length > 0);
    setCustomWords(words);
    setMode('custom');
    setIsCustomModalOpen(false);
    setResults(null);
    setRestartKey(prev => prev + 1);
  };

  return (
    <>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1>typign.ai</h1>
        <p className="subtitle">AI-powered typing analysis</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <button
            className={`btn ${mode === 'training' ? '' : 'btn-secondary'}`}
            onClick={(e) => { e.target.blur(); setMode('training'); handleRestart(); }}
          >
            Training
          </button>
          <button
            className={`btn ${mode === 'daily' ? '' : 'btn-secondary'}`}
            onClick={(e) => { e.target.blur(); setMode('daily'); handleRestart(); }}
          >
            Daily Challenge
          </button>
          <button
            className={`btn ${mode === 'code' ? '' : 'btn-secondary'}`}
            onClick={(e) => {
              e.target.blur();
              setMode('code');
              // Need to set initial words for code mode immediately
              const snippet = getRandomSnippet();
              setCustomWords(snippet.words);
              setResults(null);
              setRestartKey(prev => prev + 1);
            }}
          >
            Code
          </button>
          <button
            className={`btn ${mode === 'custom' ? '' : 'btn-secondary'}`}
            onClick={(e) => { e.target.blur(); setIsCustomModalOpen(true); }}
          >
            Custom
          </button>
        </div>
      </header>

      <main style={{ width: '100%' }}>
        {results ? (
          <Results stats={results} onRestart={handleRestart} />
        ) : (
          <TypingEngine
            key={`${mode}-${restartKey}`}
            onComplete={handleComplete}
            onRestart={handleRestart}
            mode={mode}
            customWords={mode === 'code' || mode === 'custom' ? customWords : []}
          />
        )}
      </main>

      {isCustomModalOpen && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div className="card" style={{ width: '500px', maxWidth: '90%' }}>
            <h3>Paste your text</h3>
            <textarea
              value={customTextInput}
              onChange={(e) => setCustomTextInput(e.target.value)}
              style={{ width: '100%', height: '200px', marginTop: '1rem', padding: '1rem', borderRadius: '8px', border: '1px solid #ddd' }}
              placeholder="Paste a book chapter, article, or anything you want to practice..."
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
              <button className="btn btn-secondary" onClick={() => setIsCustomModalOpen(false)}>Cancel</button>
              <button className="btn" onClick={handleStartCustom}>Start Typing</button>
            </div>
          </div>
        </div>
      )}

      <footer style={{ marginTop: '4rem', color: '#ccc', fontSize: '0.8rem' }}>
        <p>Press TAB to restart • Minimalistic MVP</p>
      </footer>
    </>
  );
}

export default App;
