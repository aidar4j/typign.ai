import React, { useState } from 'react';
import TypingEngine from './components/TypingEngine';
import Results from './components/Results';

function App() {
  const [results, setResults] = useState(null);

  const handleComplete = (stats) => {
    setResults(stats);
  };

  const handleRestart = () => {
    setResults(null);
  };

  return (
    <>
      <header style={{ marginBottom: '3rem', textAlign: 'center' }}>
        <h1>typign.ai</h1>
        <p className="subtitle">AI-powered typing analysis</p>
      </header>

      <main style={{ width: '100%' }}>
        {results ? (
          <Results stats={results} onRestart={handleRestart} />
        ) : (
          <TypingEngine onComplete={handleComplete} />
        )}
      </main>

      <footer style={{ marginTop: '4rem', color: '#ccc', fontSize: '0.8rem' }}>
        <p>Press TAB to restart (not implemented yet) • Minimalistic MVP</p>
      </footer>
    </>
  );
}

export default App;
