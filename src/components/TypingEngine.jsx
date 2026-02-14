import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateWords, generateDailyWords } from '../utils/words';
import { MistakeAnalyzer } from '../utils/MistakeAnalyzer';
import { playClick, playError, toggleSound, getSoundEnabled } from '../utils/SoundManager';

const DURATION = 60;

export default function TypingEngine({ onComplete, onRestart, mode, customWords }) {
    const [words, setWords] = useState([]);
    const [author, setAuthor] = useState(null);
    const [currWordIndex, setCurrWordIndex] = useState(0);
    const [currCharIndex, setCurrCharIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [isActive, setIsActive] = useState(false);
    const [typedHistory, setTypedHistory] = useState({}); // { wordIndex: { charIndex: status } }

    const [isSoundEnabled, setIsSoundEnabled] = useState(getSoundEnabled());

    const analyzerRef = useRef(new MistakeAnalyzer());
    const timerRef = useRef(null);
    const inputRef = useRef(null);
    const startTimeRef = useRef(null);

    useEffect(() => {
        if (mode === 'daily') {
            const dailyData = generateDailyWords(new Date());
            setWords(dailyData.words);
            setAuthor(dailyData.author);
        } else if (customWords && customWords.length > 0) {
            setWords(customWords);
            setAuthor(null);
        } else {
            setWords(generateWords(200));
            setAuthor(null);
        }

        // Reset state
        setCurrWordIndex(0);
        setCurrCharIndex(0);
        setTimeLeft((mode === 'daily' || mode === 'code' || mode === 'custom') ? 0 : DURATION);
        setIsActive(false);
        setTypedHistory({});
        analyzerRef.current = new MistakeAnalyzer(); // Reset analyzer

        inputRef.current?.focus();
    }, [mode]);

    const endTest = useCallback(() => {
        setIsActive(false);
        clearInterval(timerRef.current);

        // Calculate final stats
        let correctChars = 0;
        let totalChars = 0;

        Object.values(typedHistory).forEach(wordObj => {
            Object.values(wordObj).forEach(status => {
                if (status === 'correct') correctChars++;
                totalChars++;
            });
        });

        const endTime = Date.now();
        const durationSeconds = (endTime - (startTimeRef.current || endTime)) / 1000;
        const durationMinutes = durationSeconds > 0 ? durationSeconds / 60 : (mode === 'training' ? 1 : 0.1);

        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        // WPM = (all typed / 5) / time_in_minutes
        // Standard WPM usually counts all characters / 5.
        const finalWpm = Math.round((correctChars / 5) / durationMinutes);

        onComplete({
            wpm: finalWpm,
            accuracy,
            analysis: analyzerRef.current.analyze(),
            words,
            author
        });
    }, [timeLeft, typedHistory, onComplete]);

    // Use a ref for endTest to call it inside effect without dependency issues
    const endTestRef = useRef(endTest);
    useEffect(() => { endTestRef.current = endTest; }, [endTest]);

    useEffect(() => {
        if (isActive) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (mode === 'daily' || mode === 'code' || mode === 'custom') {
                        return prev + 1;
                    } else {
                        if (prev <= 1) return 0;
                        return prev - 1;
                    }
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive, mode]);

    // Watch for 0 in training mode
    useEffect(() => {
        if (mode === 'training' && timeLeft === 0 && isActive) {
            clearInterval(timerRef.current);
            endTestRef.current();
        }
    }, [timeLeft, isActive, mode]);

    const activeWordRef = useRef(null);
    const containerRef = useRef(null);

    // Auto-scroll
    useEffect(() => {
        if (activeWordRef.current && containerRef.current) {
            const word = activeWordRef.current;
            const container = containerRef.current;

            // Scroll Logic
            const wordTop = word.offsetTop;
            const containerHeight = container.clientHeight;
            const targetScroll = wordTop - (containerHeight / 2) + (word.clientHeight / 2);

            container.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        }
    }, [currWordIndex]);

    const handleGlobalKeyDown = (e) => {
        if (mode === 'training' && timeLeft === 0) return;

        // TAB to restart
        if (e.key === 'Tab') {
            e.preventDefault();
            onRestart();
            return;
        }

        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const currentWord = words[currWordIndex];

        if (e.key === 'Backspace') {
            playClick(); // Or a specific backspace sound
            analyzerRef.current.recordKeystroke('Backspace', null); // Record for replay

            if (currCharIndex > 0) {
                setCurrCharIndex(prev => prev - 1);
                setTypedHistory(prev => {
                    const newHistory = { ...prev };
                    if (newHistory[currWordIndex]) {
                        delete newHistory[currWordIndex][currCharIndex - 1];
                    }
                    return newHistory;
                });
            } else if (currWordIndex > 0) {
                const prevWordIdx = currWordIndex - 1;
                setCurrWordIndex(prevWordIdx);
                setCurrCharIndex(words[prevWordIdx].length);
            }
            return;
        }

        if (e.key === ' ') {
            if (mode === 'code') {
                // In code mode, Space is just a character to type
                if (!isActive) {
                    setIsActive(true);
                    startTimeRef.current = Date.now();
                }

                const expectedChar = currentWord[currCharIndex];
                if (!expectedChar) return; // End of line

                const isCorrect = e.key === expectedChar;

                if (!isCorrect) {
                    playError();
                    analyzerRef.current.recordMistake(expectedChar, e.key);
                } else {
                    playClick();
                }
                analyzerRef.current.recordKeystroke(e.key, expectedChar);

                setTypedHistory(prev => ({
                    ...prev,
                    [currWordIndex]: {
                        ...(prev[currWordIndex] || {}),
                        [currCharIndex]: isCorrect ? 'correct' : 'incorrect'
                    }
                }));

                setCurrCharIndex(prev => prev + 1);
                return;
            }

            playClick();
            if (currWordIndex === words.length - 1) {
                endTestRef.current();
                return;
            }
            setCurrWordIndex(prev => prev + 1);
            setCurrCharIndex(0);
            return;
        }

        if (e.key === 'Enter' && mode === 'code') {
            // Enter moves to next line (next word)
            e.preventDefault();
            if (currWordIndex === words.length - 1) {
                endTestRef.current();
                return;
            }
            setCurrWordIndex(prev => prev + 1);
            setCurrCharIndex(0);
            return;
        }

        if (e.key.length === 1) {
            if (!isActive) {
                setIsActive(true);
                startTimeRef.current = Date.now();
            }

            const expectedChar = currentWord[currCharIndex];
            if (!expectedChar) return;

            const isCorrect = e.key === expectedChar;

            if (!isCorrect) {
                playError();
                analyzerRef.current.recordMistake(expectedChar, e.key);
            } else {
                playClick();
            }
            analyzerRef.current.recordKeystroke(e.key, expectedChar);

            setTypedHistory(prev => ({
                ...prev,
                [currWordIndex]: {
                    ...(prev[currWordIndex] || {}),
                    [currCharIndex]: isCorrect ? 'correct' : 'incorrect'
                }
            }));

            // Check if this was the very last character of the very last word
            const isLastWord = currWordIndex === words.length - 1;
            const isLastChar = currCharIndex === currentWord.length - 1;

            if (isLastWord && isLastChar && isCorrect) {
                // Wait for state update to reflect, then end
                // Use setTimeout to allow the UI to update the last char visual before showing results
                setTimeout(() => {
                    endTestRef.current();
                }, 100);
            } else {
                setCurrCharIndex(prev => prev + 1);
            }
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [currWordIndex, currCharIndex, isActive, words, timeLeft]);

    return (
        <div className="card" onClick={() => inputRef.current?.focus()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', color: '#999' }}>
                <div className="timer" style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{timeLeft}s</div>
                <button
                    onClick={(e) => { e.stopPropagation(); setIsSoundEnabled(toggleSound()); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                    title="Toggle Sound"
                >
                    {isSoundEnabled ? '🔊' : '🔇'}
                </button>
            </div>

            <div className={`typing-container ${mode === 'code' ? 'ide-mode' : ''}`} ref={containerRef}>
                {words.map((word, wIdx) => {
                    let className = "word";
                    if (wIdx < currWordIndex) className += " typed";

                    const isCurrent = wIdx === currWordIndex;

                    return (
                        <div key={wIdx} className={className} ref={isCurrent ? activeWordRef : null}>
                            {mode === 'code' && <span className="line-number">{wIdx + 1}</span>}
                            {word.split('').map((char, cIdx) => {
                                let status = '';
                                if (wIdx < currWordIndex) {
                                    const hist = typedHistory[wIdx]?.[cIdx];
                                    status = hist || '';
                                } else if (wIdx === currWordIndex) {
                                    const hist = typedHistory[wIdx]?.[cIdx];
                                    status = hist || '';

                                    if (cIdx === currCharIndex) {
                                        status += ' active';
                                    }
                                }

                                return (
                                    <span key={cIdx} className={`letter ${status}`}>
                                        {char}
                                    </span>
                                );
                            })}
                            {/* Explicit space definition for cursor */}
                            {wIdx === currWordIndex && currCharIndex === word.length && (
                                <span className="letter active"></span>
                            )}
                        </div>
                    );
                })}
            </div>

            <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>
                Start typing to begin. Press Space to next word. Backspace to correct.
            </p>

            {author && (
                <div style={{ marginTop: '1.5rem', fontStyle: 'italic', color: '#1d1d1f', opacity: 0.8 }}>
                    — {author}
                </div>
            )}
        </div>
    );
}
