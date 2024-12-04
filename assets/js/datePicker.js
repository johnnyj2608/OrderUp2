document.getElementById('calendar-icon').addEventListener('click', () => {
    document.getElementById('datePicker').showPicker();
});

document.getElementById('datePicker').addEventListener('change', handleDateClick);

function handleDateClick() {
    const dateInput = document.getElementById('datePicker');
    const selectedDate = dateInput.value;
    const convertedDate = new Date(dateInput.value + 'T00:00:00');

    const dateObj = new Date(convertedDate);
    const weekday = dateObj.getDay();
    if (weekday === 0) {
        alert('No menus available on Sunday');
    } else {
        window.location.href = `?date=${selectedDate}`;
    }
}