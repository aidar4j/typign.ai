import React, { useState, useEffect } from 'react';
import ReplayViewer from './ReplayViewer';
import AIChat from './AIChat';
import { getDailyChallengeNumber, updateStreak, getStreakData, getStreakEmojis } from '../utils/streakManager';
import './DailyResults.css';

export default function Results({ stats, onRestart }) {
    const { wpm, accuracy, analysis, words, author, mode } = stats;
    const [showReplay, setShowReplay] = useState(false);
    const [streakData, setStreakData] = useState(null);
    const [showFireAnimation, setShowFireAnimation] = useState(false);

    useEffect(() => {
        if (mode === 'daily') {
            const data = updateStreak({ wpm, accuracy });
            setStreakData(data);
            setShowFireAnimation(true);
            setTimeout(() => setShowFireAnimation(false), 2000);
        }
    }, [mode, wpm, accuracy]);

    // Wordle-style compact view for Daily Challenge
    if (mode === 'daily') {
        const challengeNum = getDailyChallengeNumber();
        const streak = streakData?.currentStreak || 0;
        const streakEmojis = getStreakEmojis(streak);

        const handleShare = () => {
            const shareText = `typign.ai Daily Challenge #${challengeNum}\n${streakEmojis} ${streak} day streak\n${wpm} WPM | ${accuracy}% accuracy\n\ntypign.ai`;

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(shareText).then(() => {
                    alert('✅ Copied to clipboard!');
                }).catch(() => {
                    // Fallback
                    prompt('Copy this text:', shareText);
                });
            } else {
                prompt('Copy this text:', shareText);
            }
        };

        return (
            <div className="daily-results-card">
                {showFireAnimation && (
                    <div className="fire-celebration">
                        <span className="fire-emoji">🔥</span>
                    </div>
                )}

                <div className="daily-results-header">
                    <div className="star-icon">⭐</div>
                    <h2>Daily Challenge #{challengeNum}</h2>
                    <p className="daily-subtitle">Challenge Complete!</p>
                </div>

                {streak > 0 && (
                    <div className="streak-display">
                        <span className="streak-emoji">{streakEmojis}</span>
                        <span className="streak-text">{streak} day streak!</span>
                    </div>
                )}

                <div className="daily-stats">
                    <div className="daily-stat">
                        <div className="daily-stat-value">{wpm}</div>
                        <div className="daily-stat-label">WPM</div>
                    </div>
                    <div className="daily-stat">
                        <div className="daily-stat-value">{accuracy}%</div>
                        <div className="daily-stat-label">Accuracy</div>
                    </div>
                </div>

                <button className="share-button" onClick={handleShare}>
                    <span>Share</span>
                    <span className="share-icon">📤</span>
                </button>

                <div className="daily-actions">
                    <button className="daily-secondary-btn" onClick={onRestart}>
                        Try Again
                    </button>
                    <button
                        className="daily-secondary-btn"
                        onClick={() => {
                            // Switch to detailed view
                            const detailedView = document.querySelector('.daily-results-card');
                            if (detailedView) {
                                detailedView.classList.add('hide');
                                setTimeout(() => {
                                    window.location.reload(); // Quick hack to show detailed view
                                }, 300);
                            }
                        }}
                    >
                        View Details
                    </button>
                </div>

                {author && (
                    <div className="daily-quote-author">
                        — {author}
                    </div>
                )}
            </div>
        );
    }

    // Compact view for Training mode, detailed view for Code and Custom
    const isTrainingMode = mode === 'training';
    const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(!isTrainingMode);

    if (isTrainingMode) {
        return (
            <div className="daily-results-card">
                <div className="daily-results-header">
                    <div className="star-icon" style={{ background: 'linear-gradient(135deg, #0071e3 0%, #005bb5 100%)' }}>⚡</div>
                    <h2>Training Complete!</h2>
                    <p className="daily-subtitle">Great practice session</p>
                </div>

                <div className="daily-stats">
                    <div className="daily-stat">
                        <div className="daily-stat-value">{wpm}</div>
                        <div className="daily-stat-label">WPM</div>
                    </div>
                    <div className="daily-stat">
                        <div className="daily-stat-value">{accuracy}%</div>
                        <div className="daily-stat-label">Accuracy</div>
                    </div>
                </div>

                {/* Key AI Insight */}
                <div style={{ background: '#f8f9fa', padding: '1.2rem', borderRadius: '12px', marginTop: '1.5rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.8rem' }}>
                        <span style={{ fontSize: '1.3rem' }}>🤖</span>
                        <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', margin: 0 }}>AI Insight</h4>
                    </div>
                    <p style={{ fontSize: '1rem', color: '#1d1d1f', margin: 0, lineHeight: '1.5' }}>
                        {analysis.summary}
                    </p>
                </div>

                {/* Action Buttons */}
                <div className="daily-actions">
                    <button className="daily-secondary-btn" onClick={onRestart}>
                        Try Again
                    </button>
                    <button
                        className="daily-secondary-btn"
                        onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                    >
                        {showDetailedAnalysis ? 'Hide Details' : 'View Details'}
                    </button>
                </div>

                {/* Expandable Detailed Analysis */}
                {showDetailedAnalysis && (
                    <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid #e0e0e0' }}>
                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '1rem' }}>Full Stats</h4>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{wpm}</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>WPM</div>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{accuracy}%</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Accuracy</div>
                                </div>
                                <div style={{ background: '#f8f9fa', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>{analysis.consistency}%</div>
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>Consistency</div>
                                </div>
                            </div>
                        </div>

                        <div style={{ marginBottom: '2rem' }}>
                            <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Typing Style</h4>
                            <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1d1d1f', marginBottom: '0.5rem' }}>
                                {analysis.rhythmType}
                            </div>
                        </div>

                        {analysis.patterns.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Common Mistakes</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {analysis.patterns.slice(0, 5).map((p, i) => (
                                        <span key={i} style={{
                                            padding: '0.5rem 0.8rem',
                                            background: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {p.actual} → {p.expected}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {analysis.slowKeys && analysis.slowKeys.length > 0 && (
                            <div style={{ marginBottom: '2rem' }}>
                                <h4 style={{ fontSize: '0.9rem', color: '#86868b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Slowest Keys</h4>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {analysis.slowKeys.slice(0, 5).map((k, i) => (
                                        <span key={i} style={{
                                            padding: '0.5rem 0.8rem',
                                            background: '#fff',
                                            border: '1px solid #ddd',
                                            borderRadius: '6px',
                                            fontSize: '0.9rem'
                                        }}>
                                            <strong>'{k.char}'</strong> <span style={{ color: '#86868b' }}>{Math.round(k.avg)}ms</span>
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        );
    }

    // Original detailed view for Code and Custom modes
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
            </div>
        </div>
    );
}
