const buddy = getElement('buddy');
const buddyImage = getElement('buddy-image');
const statusText = getElement('status-text');
const codingTime = getElement('coding-time');

const cuteMessages = [
    'You got this.',
    'Tiny progress is still progress.',
    'I am watching the brackets.',
    'Your code and I are bonding.',
    'One bug at a time.',
    'That looks interesting...',
    'Keep going.',
    'Hydration check.',
    'Moon Buddy approves.',
    'You are doing great.'
];

let messageTimer;

function getElement(id) {
    const element = document.getElementById(id);

    if (!element) {
        throw new Error(`Moon Buddy webview is missing #${id}`);
    }

    return element;
}

function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return (
        String(minutes).padStart(2, '0') +
        ':' +
        String(remainingSeconds).padStart(2, '0')
    );
}

function randomMessage() {
    return cuteMessages[
        Math.floor(
            Math.random() * cuteMessages.length
        )
    ];
}

function setMood(mood, image, message) {
    buddy.classList.remove(
        'idle',
        'coding',
        'streak',
        'sleeping',
        'error',
        'fixed'
    );

    buddy.classList.add(mood);
    buddyImage.src = image;
    statusText.textContent = message;
}

function startPersonality() {
    clearInterval(messageTimer);

    messageTimer = setInterval(() => {
        setMood(
            'coding',
            buddyImage.dataset.coding,
            randomMessage()
        );
    }, 20000);
}

function codingMood() {
    if (buddy.classList.contains('coding')) {
        return;
    }

    setMood(
        'coding',
        buddyImage.dataset.coding,
        randomMessage()
    );

    startPersonality();
}

function debugStartedMood() {
    clearInterval(messageTimer);

    setMood(
        'coding',
        buddyImage.dataset.coding,
        'Debug session started...'
    );

    startPersonality();
}

function streakMood() {
    clearInterval(messageTimer);

    setMood(
        'streak',
        buddyImage.dataset.fixed,
        'You are on a roll.'
    );
}

function errorMood() {
    clearInterval(messageTimer);

    setMood(
        'error',
        buddyImage.dataset.error,
        'Something looks wrong...'
    );
}

function fixedMood() {
    clearInterval(messageTimer);

    setMood(
        'fixed',
        buddyImage.dataset.fixed,
        'You fixed it.'
    );
}

window.addEventListener('message', event => {
    const message = event.data;

    if (message.type === 'state') {
        const labels = {
            sleeping: 'Taking a little nap...',
            coding: 'Working with you...',
            error: 'Something looks wrong...'
        };

        const imageMap = {
            sleeping: buddyImage.dataset.sleeping,
            coding: buddyImage.dataset.coding,
            error: buddyImage.dataset.error
        };

        setMood(
            message.mood,
            imageMap[message.mood],
            labels[message.mood]
        );

        codingTime.textContent =
            formatTime(message.seconds);

        if (message.mood === 'coding') {
            startPersonality();
        } else {
            clearInterval(messageTimer);
        }

        return;
    }

    if (message.type === 'typing') {
        codingMood();
    }

    if (message.type === 'coding-streak') {
        streakMood();
    }

    if (message.type === 'error') {
        errorMood();
    }

    if (message.type === 'fixed') {
        fixedMood();
    }

    if (message.type === 'coding-time') {
        codingTime.textContent =
            formatTime(message.seconds);
    }

    if (message.type === 'idle') {
        clearInterval(messageTimer);

        setMood(
            'sleeping',
            buddyImage.dataset.sleeping,
            'Taking a little nap...'
        );
    }

    if (message.type === 'coding-achievement') {
        clearInterval(messageTimer);

        setMood(
            'fixed',
            buddyImage.dataset.fixed,
            `${message.minutes} minute streak.`
        );
    }

    if (message.type === 'debug-started') {
        debugStartedMood();
    }
});

if (buddy.classList.contains('coding')) {
    startPersonality();
}
