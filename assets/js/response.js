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

let editMode = false;
function handleEditClick() {
    editMode = !editMode;

    const editButtons = document.getElementById('edit-buttons');
    const viewButtons = document.getElementById('view-buttons');

    if (editMode) {
        viewButtons.style.display = 'none';
        editButtons.style.display = 'flex';

        const trashIcons = document.querySelectorAll('.trash-icon');
        trashIcons.forEach(icon => {
            icon.style.display = 'inline';
        });
    } else {
        viewButtons.style.display = 'flex';
        editButtons.style.display = 'none';

        const trashIcons = document.querySelectorAll('.trash-icon');
        trashIcons.forEach(icon => {
            icon.style.display = 'none';
        });
    }

    // Edit image link
    // Edit item name
    // Back -> Cancel
    // Views -> Save
    // Use Stack to track changes
    // Undo / Redo buttons
}

document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/';
});