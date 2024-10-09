document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const selectedDay = params.get('day') || 0;
    
    if (selectedDay == 0) {
        const todayCheckbox = document.getElementById('today-icon');
        todayCheckbox.classList.add('fa-calendar-check');
        todayCheckbox.classList.remove('fa-calendar');
    } else {
        const currentDayButton = document.querySelector(`.dayButton[data-day="${selectedDay}"]`);
        currentDayButton.classList.add('selectedDay');
    }
});

function handleDayClick(dayIndex) {
    window.location.href = `?day=${dayIndex}`;
}

function handleMealClick(menuItem, menuType) {
    const selectedMenu = `selected${menuType}`;
    menuItem.classList.toggle(selectedMenu);

    document.querySelectorAll('.panel').forEach(btn => {
        if (btn !== menuItem) {
            btn.classList.remove(selectedMenu);
        }
    });
    updateButtonState();
}

function handleNameClick(listItem) {
    listItem.classList.toggle('selected');
    const menuType = listItem.getAttribute('data-menu');

    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('desaturate');
    });

    if (menuType !== 'A') {
        panels.forEach(panel => {
            if (menuType === 'L' && panel.id.startsWith('btn-b')) {
                panel.classList.add('desaturate');
                panel.classList.remove('selectedBreakfast');
            } else if (menuType === 'B' && panel.id.startsWith('btn-l')) {
                panel.classList.add('desaturate');
                panel.classList.remove('selectedLunch');
            }
        });
    }
    document.querySelectorAll('#nameList li').forEach(item => {
        if (item !== listItem) {
            item.classList.remove('selected');
        }
    });
    updateButtonState();
}

function updateButtonState() {
    const selectedName = document.querySelector('#nameList li.selected');
    const selectedMeal = document.querySelector('.panel.selectedBreakfast, .panel.selectedLunch');

    const submitButton = document.getElementById('submitButton');

    if (selectedName && selectedMeal) {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

function resetSelection() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('selectedBreakfast', 'selectedLunch');
        panel.classList.remove('desaturate');
    });

    document.querySelectorAll('#nameList li').forEach(item => {
        item.classList.remove('selected');
    });

    updateButtonState();
}

document.getElementById('submitButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {
        const weekday = (document.querySelector('.selectedDay')?.getAttribute('data-day')) || '0';

        const breakfastID = (document.querySelector('.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const lunchID = (document.querySelector('.selectedLunch')?.getAttribute('data-order')) || 'none';

        const breakfastName = (document.querySelector('.selectedBreakfast')?.getAttribute('data-text')) || 'none';
        const lunchName = (document.querySelector('.selectedLunch')?.getAttribute('data-text')) || 'none';

        const selectedName = document.querySelector('#nameList li.selected');
        const memberTitle = selectedName ? selectedName.textContent : 'None';
        const memberRow = selectedName ? selectedName.getAttribute('data-index') : null;

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    weekday,
                    breakfastID, 
                    breakfastName, 
                    lunchID, 
                    lunchName,
                    memberTitle,
                    memberRow,
                }),
            });

            const result = await response.json();
            if (result.success) {

                const menuValue = selectedName.getAttribute('data-menu');
                const menuTypeSpan = selectedName.querySelector('.menu-type');
                if (breakfastID !== 'none' && lunchID !== 'none' || menuValue !== 'A') {
                    selectedName.parentNode.removeChild(selectedName);
                } else if (breakfastID !== 'none') {
                    selectedName.setAttribute('data-menu', 'L');
                    menuTypeSpan.innerText = 'L';
                } else if (lunchID !== 'none') {
                    selectedName.setAttribute('data-menu', 'B');
                    menuTypeSpan.innerText = 'B';
                }
                
                resetSelection();
            } else {
                alert("error")
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});