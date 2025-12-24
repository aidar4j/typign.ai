import React, { useState, useEffect, useRef } from 'react';

export default function AIChat({ stats }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    useEffect(() => {
        // Initial greeting analysis
        const { wpm, accuracy, analysis } = stats;
        let initialMsg = `Hi! I'm your AI Typing Coach. I analyzed your session.\n\n`;

        if (wpm > 80) initialMsg += `Wow, ${wpm} WPM is professional speed! 🚀 `;
        else if (wpm > 50) initialMsg += `Solid pace at ${wpm} WPM. `;
        else initialMsg += `Good effort at ${wpm} WPM. `;

        if (accuracy < 90) initialMsg += `However, accuracy is ${accuracy}%. Focus on precision over speed next time.`;
        else if (accuracy === 100) initialMsg += `Perfection! 100% accuracy is amazing.`;
        else initialMsg += `Accuracy is solid at ${accuracy}%.`;

        if (analysis.slowKeys && analysis.slowKeys.length > 0) {
            const keys = analysis.slowKeys.map(k => `'${k.char}'`).join(', ');
            initialMsg += `\n\nI noticed you hesitated on: ${keys}. Want tips on these?`;
        }

        setMessages([{ role: 'ai', text: initialMsg }]);
    }, [stats]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(scrollToBottom, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setIsTyping(true);

        // Simulate AI thinking
        setTimeout(() => {
            const aiResponse = generateResponse(userMsg, stats);
            setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
            setIsTyping(false);
        }, 1500);
    };

    const generateResponse = (query, stats) => {
        const q = query.toLowerCase();

        // 1. Contextual Advice based on Stats
        if (q.includes('improve') || q.includes('better') || q.includes('faster')) {
            if (stats.accuracy < 92) {
                return "I see your accuracy is below 92%. Speed comes from precision. Try slowing down by 10% and focus entirely on not making mistakes. The speed will return naturally.";
            } else if (stats.wpm < 40) {
                return "To break past 40 WPM, focus on touch typing—using all 10 fingers and not looking at the keys. Practice consistent rhythm.";
            } else {
                return "You're doing great! To get even faster, try to read one word ahead so your brain prepares the fingers before they need to strike.";
            }
        }

        // 2. Specific Mistake Analysis
        if (q.includes('mistake') || q.includes('error') || q.includes('wrong')) {
            if (stats.analysis.slowKeys && stats.analysis.slowKeys.length > 0) {
                const worstKey = stats.analysis.slowKeys[0].char;
                return `Your biggest bottleneck seems to be the '${worstKey}' key. Try practicing words designed to target that finger explicitly.`;
            }
            return "Check the Confusion Matrix above. It shows exactly which fingers are getting mixed up. Often it's ring/pinky fingers.";
        }

        // 3. General Knowledge / Small Talk
        if (q.includes('tip')) {
            const tips = [
                "Keep your posture straight and feet flat on the floor.",
                "Your wrists should float above the keyboard, not rest on it.",
                "Take a break every 20 minutes to stretch your fingers.",
                "Consistency is key. 15 minutes a day is better than 2 hours once a week.",
                "Don't smash the keys! A light touch lets you move to the next key faster."
            ];
            return tips[Math.floor(Math.random() * tips.length)];
        }

        if (q.includes('thanks') || q.includes('thx')) {
            return "You're welcome! Keep practicing daily and you'll see results.";
        }

        // Default Fallback
        return "That's an interesting observation! The more you practice, the more data I have to help you. Ask me for a 'tip' if you're stuck!";
    };

    return (
        <div className="ai-chat-container">
            <div className="chat-header">
                <span>💬</span> <strong>Chat with AI Coach</strong>
            </div>
            <div className="chat-messages">
                {messages.map((m, i) => (
                    <div key={i} className={`message ${m.role}`}>
                        {m.text}
                    </div>
                ))}
                {isTyping && <div className="message ai typing">Typing...</div>}
                <div ref={messagesEndRef} />
            </div>
            <div className="chat-input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask about your typing..."
                />
                <button onClick={handleSend} className="btn-send">Send</button>
            </div>
        </div>
    );
}
