const leftFoot = document.getElementById('leftFoot');
const rightFoot = document.getElementById('rightFoot');
const rpmInput = document.getElementById('rpmInput');
const startStopButton = document.getElementById('startStop');
const currentRpm = document.getElementById('currentRpm');
const presetButtons = document.querySelectorAll('.preset-btn');
const timer = document.getElementById('timer');
const timerToggle = document.getElementById('timerToggle');
const timerReset = document.getElementById('timerReset');

let isPlaying = false;
let interval;
let isLeftFoot = true;
let timerInterval;
let timerSeconds = 0;
let isTimerRunning = false;

// 创建音频上下文和音频节点
const audioContext = new (window.AudioContext || window.webkitAudioContext)();

function formatTime(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

function startTimer() {
    timerInterval = setInterval(() => {
        timerSeconds++;
        timer.textContent = formatTime(timerSeconds);
    }, 1000);
    timerToggle.textContent = '暂停计时';
    isTimerRunning = true;
}

function pauseTimer() {
    clearInterval(timerInterval);
    timerToggle.textContent = '继续计时';
    isTimerRunning = false;
}

function resetTimer() {
    clearInterval(timerInterval);
    timerSeconds = 0;
    timer.textContent = formatTime(timerSeconds);
    timerToggle.textContent = '开始计时';
    isTimerRunning = false;
}

function createClickSound(isLeft) {
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = isLeft ? 800 : 1000;
    gainNode.gain.value = 0.1;

    oscillator.start();
    gainNode.gain.exponentialRampToValueAtTime(0.00001, audioContext.currentTime + 0.1);

    setTimeout(() => {
        oscillator.stop();
        oscillator.disconnect();
        gainNode.disconnect();
    }, 100);
}

function startMetronome() {
    const rpm = parseInt(rpmInput.value);
    const intervalTime = (60 / rpm / 2) * 1000;

    interval = setInterval(() => {
        if (isLeftFoot) {
            leftFoot.classList.add('active');
            rightFoot.classList.remove('active');
            createClickSound(true);
        } else {
            rightFoot.classList.add('active');
            leftFoot.classList.remove('active');
            createClickSound(false);
        }

        isLeftFoot = !isLeftFoot;

        setTimeout(() => {
            if (isLeftFoot) {
                rightFoot.classList.remove('active');
            } else {
                leftFoot.classList.remove('active');
            }
        }, intervalTime / 2);
    }, intervalTime);
}

function stopMetronome() {
    clearInterval(interval);
    leftFoot.classList.remove('active');
    rightFoot.classList.remove('active');
}

function updateActivePreset(rpm) {
    presetButtons.forEach(btn => {
        if (parseInt(btn.dataset.rpm) === rpm) {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
}

startStopButton.addEventListener('click', () => {
    if (!isPlaying) {
        startMetronome();
        startStopButton.textContent = '停止';
        isPlaying = true;
        if (!isTimerRunning) {
            startTimer();
        }
    } else {
        stopMetronome();
        startStopButton.textContent = '开始';
        isPlaying = false;
        pauseTimer();
    }
});

rpmInput.addEventListener('change', () => {
    let rpm = parseInt(rpmInput.value);

    rpmInput.value = rpm;
    currentRpm.textContent = `当前踏频: ${rpm} RPM (每分钟转数)`;
    updateActivePreset(rpm);

    if (isPlaying) {
        stopMetronome();
        startMetronome();
    }

});

// 预设按钮事件监听
presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const rpm = parseInt(btn.dataset.rpm);
        rpmInput.value = rpm;
        currentRpm.textContent = `当前踏频: ${rpm} RPM (每分钟转数)`;
        updateActivePreset(rpm);

        if (!isTimerRunning) {
            startTimer();
        }

        if (isPlaying) {
            stopMetronome();
            startMetronome();
        } else {
            startMetronome();
            startStopButton.textContent = '停止';
            isPlaying = true;
        }
    });
});

// 计时器控制
timerToggle.addEventListener('click', () => {
    if (!isTimerRunning) {
        startTimer();
    } else {
        pauseTimer();
    }
});

timerReset.addEventListener('click', resetTimer);
