document.getElementById('calendar-icon').addEventListener('click', () => {
    document.getElementById('datePicker').showPicker();
});

document.getElementById('datePicker').addEventListener('change', handleDateClick);

function handleDateClick() {
    const dateInput = document.getElementById('datePicker');
    const ordersTitle = document.querySelector('h3.text-center');

    const selectedDate = new Date(dateInput.value + 'T00:00:00');

    const daysOfWeek = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = daysOfWeek[selectedDate.getDay()];

    const month = selectedDate.getMonth() + 1;
    const day = selectedDate.getDate();
    const year = selectedDate.getFullYear().toString().slice(-2);

    const formattedDate = `${dayOfWeek}, ${month}/${day}/${year}`;
    ordersTitle.innerHTML = `Orders for ${formattedDate}`;
}

document.addEventListener('DOMContentLoaded', () => {
    const dateInput = document.getElementById('datePicker');

    const today = new Date().toISOString().split('T')[0];
    dateInput.value = today;
    handleDateClick();
});
