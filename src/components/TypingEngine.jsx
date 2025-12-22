import React, { useState, useEffect, useRef, useCallback } from 'react';
import { generateWords } from '../utils/words';
import { MistakeAnalyzer } from '../utils/MistakeAnalyzer';

const DURATION = 60;

export default function TypingEngine({ onComplete }) {
    const [words, setWords] = useState([]);
    const [currWordIndex, setCurrWordIndex] = useState(0);
    const [currCharIndex, setCurrCharIndex] = useState(0);
    const [timeLeft, setTimeLeft] = useState(DURATION);
    const [isActive, setIsActive] = useState(false);
    const [typedHistory, setTypedHistory] = useState({}); // { wordIndex: { charIndex: status } }

    const analyzerRef = useRef(new MistakeAnalyzer());
    const timerRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        setWords(generateWords(200));
        inputRef.current?.focus();
    }, []);

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

        const accuracy = totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 100;
        const finalWpm = Math.round((correctChars / 5));

        onComplete({
            wpm: finalWpm,
            accuracy,
            analysis: analyzerRef.current.analyze()
        });
    }, [timeLeft, typedHistory, onComplete]);

    // Use a ref for endTest to call it inside effect without dependency issues
    const endTestRef = useRef(endTest);
    useEffect(() => { endTestRef.current = endTest; }, [endTest]);

    useEffect(() => {
        if (isActive && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(timerRef.current);
    }, [isActive]);

    // Watch for 0
    useEffect(() => {
        if (timeLeft === 0 && isActive) {
            clearInterval(timerRef.current);
            endTestRef.current();
        }
    }, [timeLeft, isActive]);

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
        if (timeLeft === 0) return;
        if (e.ctrlKey || e.metaKey || e.altKey) return;

        const currentWord = words[currWordIndex];

        if (e.key === 'Backspace') {
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
            if (currWordIndex === words.length - 1) {
                endTestRef.current();
                return;
            }
            setCurrWordIndex(prev => prev + 1);
            setCurrCharIndex(0);
            return;
        }

        if (e.key.length === 1) {
            if (!isActive) setIsActive(true);

            const expectedChar = currentWord[currCharIndex];
            if (!expectedChar) return;

            const isCorrect = e.key === expectedChar;

            if (!isCorrect) {
                analyzerRef.current.recordMistake(expectedChar, e.key);
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
        }
    };

    useEffect(() => {
        window.addEventListener('keydown', handleGlobalKeyDown);
        return () => window.removeEventListener('keydown', handleGlobalKeyDown);
    }, [currWordIndex, currCharIndex, isActive, words, timeLeft]);

    return (
        <div className="card" onClick={() => inputRef.current?.focus()}>
            <div className="timer">{timeLeft}s</div>

            <div className="typing-container" ref={containerRef}>
                {words.map((word, wIdx) => {
                    let className = "word";
                    if (wIdx < currWordIndex) className += " typed";

                    const isCurrent = wIdx === currWordIndex;

                    return (
                        <div key={wIdx} className={className} ref={isCurrent ? activeWordRef : null}>
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
                        </div>
                    );
                })}
            </div>

            <p style={{ marginTop: '2rem', color: '#999', fontSize: '0.9rem' }}>
                Start typing to begin. Press Space to next word. Backspace to correct.
            </p>
        </div>
    );
}
