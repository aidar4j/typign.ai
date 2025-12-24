import React, { useState } from 'react';
import ReplayViewer from './ReplayViewer';
import AIChat from './AIChat';

export default function Results({ stats, onRestart }) {
    const { wpm, accuracy, analysis, words, author } = stats;
    const [showReplay, setShowReplay] = useState(false);

    return (
        <div className="card" style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                <h2 style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>Test Complete</h2>
                <p style={{ color: '#86868b', fontSize: '1.2rem' }}>Here is your performance breakdown</p>
            </div>

            {/* Primary Stats */}
            <div className="stats-grid" style={{ marginBottom: '3rem' }}>
                <div className="stat-item">
                    <span className="stat-value" style={{ color: '#0071e3' }}>{wpm}</span>
                    <span className="stat-label">WPM</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{accuracy}%</span>
                    <span className="stat-label">Accuracy</span>
                </div>
                <div className="stat-item">
                    <span className="stat-value">{analysis.consistency}%</span>
                    <span className="stat-label">Consistency</span>
                </div>
            </div>

            {/* Replay Toggle */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <button
                    className="btn btn-secondary"
                    onClick={() => setShowReplay(!showReplay)}
                >
                    {showReplay ? 'Hide Replay' : 'Watch Typing Replay'}
                </button>
            </div>

            {showReplay && (
                <ReplayViewer keystrokes={analysis.keystrokes} words={words} author={author} />
            )}

            {/* AI Coach */}
            <div className="analysis-section" style={{ background: '#fafafa', padding: '2rem', borderRadius: '18px', border: '1px solid #eaeaea', marginTop: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '10px' }}>
                    <span style={{ fontSize: '1.5rem' }}>🤖</span>
                    <h3 style={{ fontSize: '1.3rem', margin: 0 }}>AI Coach Report</h3>
                </div>

                <div style={{ marginBottom: '2rem' }}>
                    <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Typing Style</h4>
                    <div style={{ fontSize: '1.2rem', fontWeight: 600, color: '#1d1d1f' }}>
                        {analysis.rhythmType}
                    </div>
                    <p style={{ marginTop: '0.5rem', lineHeight: '1.6', color: '#555' }}>
                        {analysis.summary}
                    </p>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
                    {analysis.patterns.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Confusion Matrix</h4>
                            <ul className="recommendation-list">
                                {analysis.patterns.map((p, i) => (
                                    <li key={i} className="recommendation-item">
                                        <div>
                                            <strong>{p.actual} ➔ {p.expected}</strong>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {analysis.slowKeys && analysis.slowKeys.length > 0 && (
                        <div>
                            <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Slowest Keys</h4>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                {analysis.slowKeys.map((k, i) => (
                                    <div key={i} style={{
                                        padding: '6px 10px',
                                        background: '#fff',
                                        border: '1px solid #ddd',
                                        borderRadius: '6px',
                                        fontSize: '0.9rem'
                                    }}>
                                        <span style={{ fontWeight: 600 }}>'{k.char}'</span>
                                        <span style={{ color: '#86868b', marginLeft: '4px', fontSize: '0.8rem' }}>{Math.round(k.avg)}ms</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <AIChat stats={stats} />

            <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'center', gap: '1rem' }}>
                <button className="btn" onClick={onRestart} style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}>Start New Test</button>

                {stats.mode === 'daily' && (
                    <button
                        className="btn btn-secondary"
                        onClick={() => {
                            const date = new Date().toLocaleDateString();
                            const text = `Typing Daily ${date}: ${wpm} WPM | ${accuracy}% | typign.ai`;
                            navigator.clipboard.writeText(text);
                            alert('Result copied to clipboard!');
                        }}
                        style={{ fontSize: '1.1rem', padding: '1rem 2.5rem' }}
                    >
                        Share Result
                    </button>
                )}
            </div>
        </div>
    );
}
