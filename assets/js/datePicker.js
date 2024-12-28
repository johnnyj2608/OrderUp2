document.getElementById('calendar-icon').addEventListener('click', () => {
    document.getElementById('datePicker').showPicker();
});

document.getElementById('datePicker').addEventListener('change', () => {
    let route = '';
    const currentPath = window.location.pathname;

    if (currentPath.includes('orders')) {
        route = 'orders'; 
    } else if (currentPath.includes('history')) {
        route = 'history';
    }
    handleDateClick(route);
});

function handleDateClick(route='') {
    const dateInput = document.getElementById('datePicker');
    
    const dateArray = dateInput.value.split("-");
    const year = dateArray[0];
    const month = parseInt(dateArray[1], 10) - 1;
    const day = dateArray[2];
    const selectedDate = new Date(year, month, day);

    const weekday = selectedDate.getDay();
    if (weekday === 0) {
        alert('No menus available on Sunday');
    } else {
        window.location.href = `/${route}?date=${dateInput.value}`;
    }
}