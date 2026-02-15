export class MistakeAnalyzer {
    constructor() {
        this.mistakes = []; // { expected, actual, timestamp }
        this.keystrokes = []; // { char, timestamp, expected }
        this.lastKeystrokeTime = null;
        this.wordTimings = {}; // { word: [duration, duration] }
        this.currentWordStart = null;
        this.currentWord = "";
    }

    startWord(word) {
        this.currentWordStart = Date.now();
        this.currentWord = word;
    }

    endWord() {
        if (this.currentWordStart && this.currentWord) {
            const duration = Date.now() - this.currentWordStart;
            if (!this.wordTimings[this.currentWord]) this.wordTimings[this.currentWord] = [];
            this.wordTimings[this.currentWord].push(duration);
        }
        this.currentWordStart = null;
        this.currentWord = "";
    }

    recordMistake(expected, actual) {
        this.mistakes.push({
            expected,
            actual,
            timestamp: Date.now()
        });
    }

    recordKeystroke(char, expected) {
        const now = Date.now();
        const latency = this.lastKeystrokeTime ? now - this.lastKeystrokeTime : 0;
        this.lastKeystrokeTime = now;

        // First keystroke of test?
        if (this.keystrokes.length === 0) {
            this.currentWordStart = now;
        }

        this.keystrokes.push({
            char,
            expected: expected || null,
            timestamp: now,
            latency
        });
    }

    analyze() {
        // 1. Confusion Patterns
        const confusionMatrix = {};
        this.mistakes.forEach(({ expected, actual }) => {
            const key = `${actual}->${expected}`;
            confusionMatrix[key] = (confusionMatrix[key] || 0) + 1;
        });

        const patterns = Object.entries(confusionMatrix)
            .map(([key, count]) => {
                const [actual, expected] = key.split('->');
                return {
                    type: 'confusion',
                    actual,
                    expected,
                    count,
                    message: `Confused '${actual}' for '${expected}'.`
                };
            })
            .sort((a, b) => b.count - a.count)
            .slice(0, 3);

        // 2. Slowest Keys
        const latencies = {};
        this.keystrokes.forEach(k => {
            if (k.latency > 50 && k.latency < 2000) {
                if (!latencies[k.expected]) latencies[k.expected] = [];
                latencies[k.expected].push(k.latency);
            }
        });

        const slowKeys = Object.entries(latencies)
            .map(([char, times]) => {
                const avg = times.reduce((a, b) => a + b, 0) / times.length;
                return { char, avg, count: times.length };
            })
            .filter(k => k.count > 2)
            .sort((a, b) => b.avg - a.avg)
            .slice(0, 3);

        // 3. Rhythm & Consistency
        const validLatencies = this.keystrokes.map(k => k.latency).filter(l => l > 20 && l < 2000);
        let consistencyScore = 100;
        let rhythmType = "Unknown";

        if (validLatencies.length > 10) {
            const mean = validLatencies.reduce((a, b) => a + b, 0) / validLatencies.length;
            const variance = validLatencies.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / validLatencies.length;
            const stdDev = Math.sqrt(variance);

            // CV (Coefficient of Variation) is better for rhythm type
            const cv = stdDev / mean;

            if (cv < 0.2) rhythmType = "Metronome (Steady)";
            else if (cv < 0.4) rhythmType = "Variable Flow";
            else rhythmType = "Burst (Stop & Go)";

            consistencyScore = Math.max(0, Math.round(100 - (stdDev / 1.5)));
        }

        // 4. Word Difficulty (Coach)
        // Identify words that took disproportionately long per character
        // We didn't perfectly track word lengths in wordTimings, but we can guess avg char time.
        // Simplifying: Just return generic coach messages.

        const coachMessages = [];
        const accuracyRate = this.keystrokes.length > 0 ? ((this.keystrokes.length - this.mistakes.length) / this.keystrokes.length) * 100 : 100;

        // Enhanced rhythm-based feedback
        if (rhythmType === "Burst (Stop & Go)") {
            coachMessages.push("You type in bursts—fast on familiar keys but pause between challenging ones. Focus on maintaining a steady pace rather than rushing.");
        } else if (rhythmType === "Metronome (Steady)") {
            if (accuracyRate > 95) {
                coachMessages.push("Excellent! Your rhythm is steady and consistent like a metronome. This is the hallmark of expert typing.");
            } else {
                coachMessages.push("Great steady rhythm! Now focus on accuracy to reach expert level.");
            }
        } else {
            coachMessages.push("Your rhythm varies—some keys flow smoothly while others create hesitation. Practice difficult key combinations to smooth your flow.");
        }

        // Accuracy-based feedback
        if (accuracyRate < 90) {
            coachMessages.push("⚠️ Slow down! Prioritize accuracy over speed. Speed will come naturally once muscle memory is solid.");
        } else if (accuracyRate >= 98) {
            coachMessages.push("💯 Outstanding accuracy! You're building excellent muscle memory.");
        }

        // Specific key improvement suggestions
        if (slowKeys.length > 0) {
            const slowKeysList = slowKeys.map(k => `'${k.char}'`).join(", ");
            const avgDelay = Math.round(slowKeys[0].avg);
            coachMessages.push(`🎯 Your slowest keys are ${slowKeysList}. Practice typing these in common words to build speed (current avg: ${avgDelay}ms).`);
        }

        // Pattern-based feedback
        if (patterns.length > 0) {
            const topPattern = patterns[0];
            coachMessages.push(`📊 You frequently confuse '${topPattern.actual}' for '${topPattern.expected}'. Focus on these keys in practice drills.`);
        }

        // Consistency feedback
        if (consistencyScore < 70) {
            coachMessages.push("🌊 Your timing fluctuates significantly. Try to maintain a more even rhythm throughout the test.");
        } else if (consistencyScore >= 90) {
            coachMessages.push("⭐ Exceptional consistency! Your timing is remarkably stable.");
        }

        return {
            score: Math.max(0, 100 - (this.mistakes.length * 2)),
            mistakesCount: this.mistakes.length,
            summary: coachMessages[0], // Primary message
            coachMessages, // All messages
            patterns,
            slowKeys,
            consistency: consistencyScore,
            rhythmType,
            keystrokes: this.keystrokes // Export for replay
        };
    }
}
