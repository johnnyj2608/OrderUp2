document.addEventListener('DOMContentLoaded', () => {
    const currentDayIndex = new Date().getDay(); 
    const buttonId = `day-${currentDayIndex}`; 

    const currentDayButton = document.getElementById(buttonId);
    currentDayButton.classList.add('selectedDay');
});

function handleDayClick(dayButton) {
    dayButton.classList.add('selectedDay');

    document.querySelectorAll('.dayButton').forEach(item => {
        if (item !== dayButton) {
            item.classList.remove('selectedDay');
        }
    });
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
        resetSelection();
    }
});