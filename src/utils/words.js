const QUOTES = [
    { text: "The only way to do great work is to love what you do. If you haven't found it yet, keep looking. Don't settle. As with all matters of the heart, you'll know when you find it. And, like any great relationship, it just gets better and better as the years roll on.", author: "Steve Jobs" },
    { text: "Success is not final, failure is not fatal: it is the courage to continue that counts. Success consists of going from failure to failure without loss of enthusiasm. Never give in, never give in, never, never, never, never—in nothing, great or small, large or petty—never give in except to convictions of honor and good sense.", author: "Winston Churchill" },
    { text: "In the end, it's not the years in your life that count. It's the life in your years. Most people are about as happy as they make up their minds to be. The best thing about the future is that it comes one day at a time.", author: "Abraham Lincoln" },
    { text: "It is not the critic who counts; not the man who points out how the strong man stumbles, or where the doer of deeds could have done them better. The credit belongs to the man who is actually in the arena, whose face is marred by dust and sweat and blood.", author: "Theodore Roosevelt" },
    { text: "I have not failed. I've just found 10,000 ways that won't work. Many of life's failures are people who did not realize how close they were to success when they gave up. Genius is one percent inspiration and ninety-nine percent perspiration.", author: "Thomas A. Edison" },
    { text: "Mastering the art of typing requires patience, consistency, and a focus on accuracy above speed. When you stop rushing, your fingers naturally find the rhythm, effectively dancing across the keyboard with minimal effort.", author: "Typign Coach" },
    { text: "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time. Deep work will make you better at what you do and provide the sense of true fulfillment that comes from craftsmanship.", author: "Cal Newport" },
    { text: "The mind is everything. What you think you become. We are shaped by our thoughts; we become what we think. When the mind is pure, joy follows like a shadow that never leaves.", author: "Buddha" },
    { text: "To be yourself in a world that is constantly trying to make you something else is the greatest accomplishment. Ralph Waldo Emerson once said that for every minute you are angry you lose sixty seconds of happiness.", author: "Ralph Waldo Emerson" },
    { text: "Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away. Design is not just what it looks like and feels like. Design is how it works.", author: "Antoine de Saint-Exupéry" }
];

export const commonWords = [
    "the", "be", "of", "and", "a", "to", "in", "he", "have", "it", "that", "for", "they", "i", "with", "as", "not", "on", "she", "at", "by", "this", "we", "you", "do", "but", "from", "or", "which", "one", "would", "all", "will", "there", "say", "who", "make", "when", "can", "more", "if", "no", "man", "out", "other", "so", "what", "time", "up", "go", "about", "than", "into", "could", "state", "only", "new", "year", "some", "take", "come", "these", "know", "see", "use", "get", "like", "then", "first", "any", "work", "now", "may", "such", "give", "over", "think", "most", "even", "find", "day", "also", "after", "way", "many", "must", "look", "before", "great", "back", "through", "long", "where", "much", "should", "well", "people", "down", "own", "just", "because", "good", "each", "those", "feel", "seem", "how", "high", "too", "place", "little", "world", "very", "still", "nation", "hand", "old", "life", "tell", "write", "become", "here", "show", "house", "both", "between", "need", "mean", "call", "develop", "under", "last", "right", "move", "thing", "general", "school", "never", "same", "another", "begin", "while", "number", "part", "turn", "real", "leave", "might", "want", "point", "form", "off", "child", "few", "small", "since", "against", "ask", "late", "home", "interest", "large", "person", "end", "open", "public", "follow", "during", "present", "without", "again", "hold", "govern", "around", "possible", "head", "consider", "word", "program", "problem", "however", "lead", "system", "set", "order", "eye", "plan", "run", "keep", "face", "fact", "group", "play", "stand", "increase", "early", "course", "change", "help", "line"
];

// Simple Linear Congruential Generator for consistent daily randoms
function seededRandom(seed) {
    const m = 0x80000000;
    const a = 1103515245;
    const c = 12345;
    let state = seed ? seed : Math.floor(Math.random() * (m - 1));

    return function () {
        state = (a * state + c) % m;
        return state / (m - 1);
    }
}

export const generateWords = (count = 100) => {
    const words = [];
    for (let i = 0; i < count; i++) {
        words.push(commonWords[Math.floor(Math.random() * commonWords.length)]);
    }
    return words;
};

export const generateDailyWords = (date) => {
    // Creating a seed from the date: YYYYMMDD
    const seedString = date.getFullYear().toString() +
        (date.getMonth() + 1).toString().padStart(2, '0') +
        date.getDate().toString().padStart(2, '0');
    const seed = parseInt(seedString, 10);

    const random = seededRandom(seed);

    // Pick a quote
    const quoteIndex = Math.floor(random() * QUOTES.length);
    const quote = QUOTES[quoteIndex];

    return {
        words: quote.text.split(' '),
        author: quote.author,
        text: quote.text
    };
};
