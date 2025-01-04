function switchMenu() {
    const switchText = document.getElementById('switch-text');
    const breakfastPanel = document.getElementById('breakfast-panel');
    const lunchPanel = document.getElementById('lunch-panel');

    if (breakfastPanel.classList.contains('hidden')) {
        breakfastPanel.classList.remove('hidden');
        lunchPanel.classList.add('hidden');
        switchText.innerHTML = 'B';
    } else {
        breakfastPanel.classList.add('hidden');
        lunchPanel.classList.remove('hidden');
        switchText.innerHTML = 'L';
    }
}
