// Streak Manager for Daily Challenge
const STORAGE_KEY = 'typign_streak';
const START_DATE = new Date('2024-01-01'); // Epoch for challenge numbering

export const getDailyChallengeNumber = () => {
    const now = new Date();
    const daysSinceStart = Math.floor((now - START_DATE) / (1000 * 60 * 60 * 24));
    return daysSinceStart + 1;
};

export const getTodayDateKey = () => {
    const now = new Date();
    return now.toISOString().split('T')[0]; // YYYY-MM-DD
};

export const getStreakData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) {
            return { currentStreak: 0, lastCompletedDate: null, completedDays: {}, lastDailyStats: null };
        }
        return JSON.parse(data);
    } catch (e) {
        return { currentStreak: 0, lastCompletedDate: null, completedDays: {}, lastDailyStats: null };
    }
};

export const updateStreak = (stats = null) => {
    const todayKey = getTodayDateKey();
    const streakData = getStreakData();

    // If already completed today, just return current data
    if (streakData.completedDays[todayKey]) {
        return streakData;
    }

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = yesterday.toISOString().split('T')[0];

    let newStreak = streakData.currentStreak;

    // Check if we're continuing a streak or starting fresh
    if (!streakData.lastCompletedDate) {
        // First ever completion
        newStreak = 1;
    } else if (streakData.lastCompletedDate === yesterdayKey) {
        // Continuing streak from yesterday
        newStreak = streakData.currentStreak + 1;
    } else if (streakData.lastCompletedDate === todayKey) {
        // Already completed today (shouldn't happen, but just in case)
        newStreak = streakData.currentStreak;
    } else {
        // Streak broken, start over
        newStreak = 1;
    }

    const updatedData = {
        currentStreak: newStreak,
        lastCompletedDate: todayKey,
        completedDays: {
            ...streakData.completedDays,
            [todayKey]: true
        },
        // Store the stats from this completion
        lastDailyStats: stats ? {
            wpm: stats.wpm,
            accuracy: stats.accuracy,
            challengeNumber: getDailyChallengeNumber(),
            date: todayKey
        } : streakData.lastDailyStats
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
    return updatedData;
};

export const getStreakEmojis = (streak) => {
    if (streak === 0) return '';
    if (streak === 1) return '🔥';
    if (streak < 7) return '🔥'.repeat(Math.min(streak, 3));
    if (streak < 30) return '🔥🔥🔥 ';
    return '🔥🔥🔥💯'; // Super streak!
};

export const isTodayCompleted = () => {
    const todayKey = getTodayDateKey();
    const streakData = getStreakData();
    return !!streakData.completedDays[todayKey];
};

export const getLastDailyStats = () => {
    const streakData = getStreakData();
    return streakData.lastDailyStats;
};
