function toggleCalendar() {
    const searchBar = document.getElementById('searchContainer');
    if (searchBar) {
        searchBar.classList.add('hidden');
    }
    const datePicker = document.getElementById('datePicker');
    datePicker.click();         // Safari
    datePicker.focus();         // Mobile
    datePicker.showPicker();    // Chrome
}

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
    const dateInput = document.getElementById('datePicker').value;
    
    const dateArray = dateInput.split("-");
    const year = dateArray[0];
    const month = dateArray[1];
    const day = dateArray[2];
    const selectedDate = new Date(year, parseInt(month, 10)-1, day);

    const weekday = selectedDate.getDay();
    if (weekday === 0) {
        alert('No menus available on Sunday');
    } else {
        window.location.href = `/${route}?date=${dateInput}`;
    }
}