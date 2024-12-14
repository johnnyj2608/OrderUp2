function switchMenu() {
    const breakfastPanel = document.querySelector('.breakfast-panel');
    const lunchPanel = document.querySelector('.lunch-panel');

    if (breakfastPanel.style.display === 'none') {
        breakfastPanel.style.display = 'flex';
        lunchPanel.style.display = 'none';
    } else {
        breakfastPanel.style.display = 'none';
        lunchPanel.style.display = 'flex';
    }
}