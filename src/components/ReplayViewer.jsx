import React, { useState, useEffect, useRef } from 'react';

export default function ReplayViewer({ keystrokes, words, author }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [typedState, setTypedState] = useState({
        wordIndex: 0,
        charIndex: 0,
        history: {} // { wordIdx: { charIdx: status } }
    });
    const [isPlaying, setIsPlaying] = useState(false);

    // Sort keystrokes by timestamp to be safe
    const sortedKeystrokes = React.useMemo(() => {
        return [...keystrokes].sort((a, b) => a.timestamp - b.timestamp);
    }, [keystrokes]);

    const startTimeRef = useRef(null);
    const requestRef = useRef(null);

    const reset = () => {
        setCurrentIndex(0);
        setTypedState({
            wordIndex: 0,
            charIndex: 0,
            history: {}
        });
        setIsPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };

    const processKeystroke = (k, currentState) => {
        const { wordIndex, charIndex, history } = currentState;
        let nextState = { ...currentState };

        // Deep copy history needed? 
        // We can just mutate a copy for performance in this loop if needed, but let's be immutableish
        const newHistory = { ...history };

        if (k.char === 'Backspace') {
            if (charIndex > 0) {
                nextState.charIndex = charIndex - 1;
                // clear history for that char
                if (newHistory[wordIndex]) {
                    const wordHist = { ...newHistory[wordIndex] };
                    delete wordHist[charIndex - 1];
                    newHistory[wordIndex] = wordHist;
                }
            } else if (wordIndex > 0) {
                const prevWordIdx = wordIndex - 1;
                nextState.wordIndex = prevWordIdx;
                nextState.charIndex = words[prevWordIdx].length; // Move to end of prev word
            }
        } else if (k.char === ' ') {
            // Space moves next word
            // Only if we are not at last word
            if (wordIndex < words.length - 1) {
                nextState.wordIndex = wordIndex + 1;
                nextState.charIndex = 0;
            }
        } else if (k.char.length === 1) {
            // Regular char
            const currentWord = words[wordIndex];
            const expectedChar = currentWord ? currentWord[charIndex] : null;

            if (expectedChar) {
                if (!newHistory[wordIndex]) newHistory[wordIndex] = {};

                const isCorrect = k.char === expectedChar;
                newHistory[wordIndex] = {
                    ...newHistory[wordIndex],
                    [charIndex]: isCorrect ? 'correct' : 'incorrect'
                };

                nextState.charIndex = charIndex + 1;
            }
        }

        nextState.history = newHistory;
        return nextState;
    };

    const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;

        // Calculate logical time in the recording
        // We want to map 'timestamp' (real time) to 'recording time'
        // But we are processing an array.
        // It's easier to just use a timeout loop or interval, but let's try RAF loop tracking 'playbackTime'
    };

    // Simpler approach: Just use a useEffect with setTimeout for the next event
    useEffect(() => {
        if (isPlaying && currentIndex < sortedKeystrokes.length) {
            const currentKeystroke = sortedKeystrokes[currentIndex];
            const nextKeystroke = sortedKeystrokes[currentIndex + 1];

            // Process current
            setTypedState(prev => processKeystroke(currentKeystroke, prev));

            if (nextKeystroke) {
                const delay = nextKeystroke.timestamp - currentKeystroke.timestamp;
                const safeDelay = Math.max(10, Math.min(delay, 1000)); // Cap delay to 1s max key wait

                const timeout = setTimeout(() => {
                    setCurrentIndex(prev => prev + 1);
                }, safeDelay);
                return () => clearTimeout(timeout);
            } else {
                setIsPlaying(false); // Done
            }
        }
    }, [isPlaying, currentIndex, sortedKeystrokes]);

    return (
        <div style={{ marginTop: '2rem', borderTop: '1px solid #eaeaea', paddingTop: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ fontSize: '1.3rem', margin: 0 }}>Session Replay</h3>
                <div>
                    {!isPlaying && currentIndex >= sortedKeystrokes.length && (
                        <button className="btn btn-secondary" onClick={reset} style={{ marginRight: '10px' }}>Reset</button>
                    )}
                    <button className="btn" onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? 'Pause' : currentIndex > 0 ? 'Resume' : 'Play Replay'}
                    </button>
                </div>
            </div>

            <div className="card" style={{ background: '#fafafa' }}>
                <div className="typing-container" style={{ height: 'auto', maxHeight: '300px', overflowY: 'auto' }}>
                    {words.map((word, wIdx) => {
                        let className = "word";
                        if (wIdx < typedState.wordIndex) className += " typed";

                        const isCurrent = wIdx === typedState.wordIndex;

                        return (
                            <div key={wIdx} className={className}>
                                {word.split('').map((char, cIdx) => {
                                    let status = '';
                                    if (wIdx < typedState.wordIndex) {
                                        const hist = typedState.history[wIdx]?.[cIdx];
                                        status = hist || '';
                                    } else if (wIdx === typedState.wordIndex) {
                                        const hist = typedState.history[wIdx]?.[cIdx];
                                        status = hist || '';

                                        if (cIdx === typedState.charIndex) {
                                            status += ' active';
                                        }
                                    }

                                    return (
                                        <span key={cIdx} className={`letter ${status}`}>
                                            {char}
                                        </span>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                {author && (
                    <div style={{ marginTop: '1rem', fontStyle: 'italic', color: '#666' }}>
                        — {author}
                    </div>
                )}
            </div>
        </div>
    );
}
