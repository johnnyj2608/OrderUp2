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
        const selectedDay = document.querySelector('.selectedDay');
        const weekday = selectedDay ? selectedDay.textContent : 'None';

        const breakfastID = (document.querySelector('.selectedBreakfast')?.getAttribute('data-order')) || 'none';
        const lunchID = (document.querySelector('.selectedLunch')?.getAttribute('data-order')) || 'none';

        const breakfastName = (document.querySelector('.selectedBreakfast')?.getAttribute('data-text')) || 'none';
        const lunchName = (document.querySelector('.selectedLunch')?.getAttribute('data-text')) || 'none';

        const selectedName = document.querySelector('#nameList li.selected');
        const memberName = selectedName ? selectedName.textContent : 'None';

        console.log(`Weekday: ${weekday}`);
        console.log(`Breakfast ID : ${breakfastID}`);
        console.log(`Breakfast Name: ${breakfastName}`);
        console.log(`Lunch ID: ${lunchID}`);
        console.log(`Lunch Name: ${lunchName}`);
        console.log(`Member Name: ${memberName}`);
        
        resetSelection();
    }
});