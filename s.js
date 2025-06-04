document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const clockSection = document.getElementById('clock-section');
    const stopwatchSection = document.getElementById('stopwatch-section');
    const clockModeBtn = document.getElementById('clock-mode-btn');
    const stopwatchModeBtn = document.getElementById('stopwatch-mode-btn');
    const themeToggle = document.getElementById('theme-toggle');

    const clockHoursSpan = document.getElementById('clock-hours');
    const clockMinutesSpan = document.getElementById('clock-minutes');
    const clockSecondsSpan = document.getElementById('clock-seconds');

    const swHoursSpan = document.getElementById('sw-hours');
    const swMinutesSpan = document.getElementById('sw-minutes');
    const swSecondsSpan = document.getElementById('sw-seconds');
    const swMillisecondsSpan = document.getElementById('sw-milliseconds');

    const startBtn = document.getElementById('start-btn');
    const stopBtn = document.getElementById('stop-btn');
    const resetBtn = document.getElementById('reset-btn');

    // --- Game State Variables ---
    let stopwatchInterval;
    let elapsedTime = 0; // in milliseconds
    let startTime;
    let isStopwatchRunning = false;
    let animationTimeout; // To manage the ticking animation

    // --- Sound Effects ---
    const SOUND_PATHS = {
        start: 'start.mp3',
        stop: 'stop.mp3',
        reset: 'reset.mp3',
        tick: 'tick.mp3' // Optional: for a subtle clock tick
    };

    const sounds = {};
    for (const key in SOUND_PATHS) {
        sounds[key] = new Audio(SOUND_PATHS[key]);
        sounds[key].preload = 'auto';
        sounds[key].volume = 0.5; // Adjust volume as needed
    }

    function playSound(soundKey) {
        if (sounds[soundKey]) {
            sounds[soundKey].currentTime = 0; // Rewind to start
            sounds[soundKey].play().catch(e => console.warn("Error playing sound:", e.message));
        }
    }

    // --- Helper Functions ---
    function formatTime(ms) {
        const totalSeconds = Math.floor(ms / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        const milliseconds = ms % 1000;

        return {
            hours: String(hours).padStart(2, '0'),
            minutes: String(minutes).padStart(2, '0'),
            seconds: String(seconds).padStart(2, '0'),
            milliseconds: String(milliseconds).padStart(3, '0')
        };
    }

    // --- Clock Logic ---
    function updateClock() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');

        animateTick(clockSecondsSpan);
        clockHoursSpan.textContent = hours;
        clockMinutesSpan.textContent = minutes;
        clockSecondsSpan.textContent = seconds;
        // playSound('tick'); // Uncomment if you want a ticking sound for the clock
    }

    // --- Stopwatch Logic ---
    function startStopwatch() {
        if (isStopwatchRunning) return;

        playSound('start');
        isStopwatchRunning = true;
        startTime = Date.now() - elapsedTime; // Adjust startTime for resuming
        stopwatchInterval = setInterval(updateStopwatch, 10); // Update every 10ms for precision

        startBtn.disabled = true;
        stopBtn.disabled = false;
        resetBtn.disabled = false;
    }

    function stopStopwatch() {
        if (!isStopwatchRunning) return;

        playSound('stop');
        isStopwatchRunning = false;
        clearInterval(stopwatchInterval);
        clearTimeout(animationTimeout); // Clear any pending animations

        startBtn.disabled = false;
        stopBtn.disabled = true;
        resetBtn.disabled = false;
    }

    function resetStopwatch() {
        playSound('reset');
        stopStopwatch(); // Ensure it's stopped
        elapsedTime = 0;
        updateStopwatchDisplay(0); // Reset display immediately
        startBtn.disabled = false;
        resetBtn.disabled = true; // Disable reset after full reset
    }

    function updateStopwatch() {
        elapsedTime = Date.now() - startTime;
        updateStopwatchDisplay(elapsedTime);
    }

    function updateStopwatchDisplay(ms) {
        const time = formatTime(ms);
        animateTick(swMillisecondsSpan); // Animate milliseconds for continuous feel
        swHoursSpan.textContent = time.hours;
        swMinutesSpan.textContent = time.minutes;
        swSecondsSpan.textContent = time.seconds;
        swMillisecondsSpan.textContent = time.milliseconds;
    }

    // --- UI Animations ---
    function animateTick(element) {
        element.classList.add('animate-tick');
        // Remove the class after a short delay to reset for the next animation
        if (animationTimeout) {
            clearTimeout(animationTimeout);
        }
        animationTimeout = setTimeout(() => {
            element.classList.remove('animate-tick');
        }, 100); // Animation duration is 0.1s in CSS
    }

    // --- Mode Switching ---
    function showClockMode() {
        clockSection.classList.add('active');
        stopwatchSection.classList.remove('active');
        clockModeBtn.classList.add('active');
        stopwatchModeBtn.classList.remove('active');
        stopStopwatch(); // Stop stopwatch if it's running when switching to clock
    }

    function showStopwatchMode() {
        clockSection.classList.remove('active');
        stopwatchSection.classList.add('active');
        clockModeBtn.classList.remove('active');
        stopwatchModeBtn.classList.add('active');
        // No action needed for stopwatch state on switch, it maintains its state
    }

    // --- Dark Mode Functionality ---
    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        saveThemePreference();
    }

    function loadThemePreference() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        } else {
            document.body.classList.remove('dark-mode');
        }
    }

    function saveThemePreference() {
        const isDarkMode = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }

    // --- Event Listeners ---
    startBtn.addEventListener('click', startStopwatch);
    stopBtn.addEventListener('click', stopStopwatch);
    resetBtn.addEventListener('click', resetStopwatch);
    clockModeBtn.addEventListener('click', showClockMode);
    stopwatchModeBtn.addEventListener('click', showStopwatchMode);
    themeToggle.addEventListener('click', toggleTheme);

    // --- Initial Setup ---
    loadThemePreference();
    setInterval(updateClock, 1000); // Update clock every second
    updateClock(); // Initial clock display
    updateStopwatchDisplay(0); // Initial stopwatch display (00:00:00.000)

    // Start in clock mode by default
    showClockMode();
});