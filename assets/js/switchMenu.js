function switchMenu() {
    const switchText = document.getElementById('switch-text');
    const breakfastPanel = document.getElementById('breakfast-panel');
    const lunchPanel = document.getElementById('lunch-panel');

    if (breakfastPanel.classList.contains('hidden')) {
        breakfastPanel.classList.remove('hidden');
        lunchPanel.classList.add('hidden');
        switchText.innerHTML = typeB;
    } else {
        breakfastPanel.classList.add('hidden');
        lunchPanel.classList.remove('hidden');
        switchText.innerHTML = typeL;
    }

    window.scrollTo({
        top: 0,
    });
}

const currentTime = new Date();
const currentHour = currentTime.getHours();

if (currentHour >= 10 && currentHour <= 23) {
    switchMenu();
}

document.addEventListener('DOMContentLoaded', () => {
    const infoButton = document.getElementById('info-button');
    if (infoButton) {
        const tooltip = new bootstrap.Tooltip(infoButton);
    }
});

document.ondblclick = function (e) {
    e.preventDefault();
}