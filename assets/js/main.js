document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const selectedDay = params.get('day') || new Date().getDay(); ;
    
    const currentDayButton = document.querySelector(`.dayButton[data-day="${selectedDay}"]`);
    currentDayButton.classList.add('selectedDay');
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
    });

    document.querySelectorAll('#nameList li').forEach(item => {
        item.classList.remove('selected');
    });

    updateButtonState();
}

document.getElementById('submitButton').addEventListener('click', async function() {
    if (!this.classList.contains('disabled')) {
        const weekday = (document.querySelector('.selectedDay')?.getAttribute('data-day')) || 'none';

        const breakfastID = (document.querySelector('.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const lunchID = (document.querySelector('.selectedLunch')?.getAttribute('data-order')) || 'none';

        const breakfastName = (document.querySelector('.selectedBreakfast')?.getAttribute('data-text')) || 'none';
        const lunchName = (document.querySelector('.selectedLunch')?.getAttribute('data-text')) || 'none';

        const selectedName = document.querySelector('#nameList li.selected');
        const memberName = selectedName ? selectedName.textContent : 'None';

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
                    memberName,}),
            });

            const result = await response.json();
            if (result.success) {
                resetSelection();
            } else {
                alert("error")
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
});