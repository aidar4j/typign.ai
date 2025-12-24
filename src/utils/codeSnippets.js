export const CODE_SNIPPETS = [
    {
        language: 'javascript',
        code: `const fibonacci = (n) => {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
};`
    },
    {
        language: 'python',
        code: `def binary_search(arr, x):
    low = 0
    high = len(arr) - 1
    mid = 0
    while low <= high:
        mid = (high + low) // 2
        if arr[mid] < x:
            low = mid + 1
        elif arr[mid] > x:
            high = mid - 1
        else:
            return mid
    return -1`
    },
    {
        language: 'css',
        code: `.container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f0f0f0;
}`
    },
    {
        language: 'react',
        code: `useEffect(() => {
    const handleResize = () => {
        setWindowSize({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
}, []);`
    }
];

export const getRandomSnippet = () => {
    const random = CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)];
    // Simple robust tokenizer: split by spaces but preserve structure somewhat
    // For this engine, we flatten newlines to spaces for now or treat them as part of the word
    return {
        words: random.code.split(/\s+/).filter(w => w.length > 0),
        raw: random.code
    };
};
