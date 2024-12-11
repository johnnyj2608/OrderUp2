function selectAllFilters() {
    document.getElementById('filter-monday').checked = true;
    document.getElementById('filter-tuesday').checked = true;
    document.getElementById('filter-wednesday').checked = true;
    document.getElementById('filter-thursday').checked = true;
    document.getElementById('filter-friday').checked = true;
    document.getElementById('filter-saturday').checked = true;
}

function clearAllFilters() {
    document.getElementById('filter-monday').checked = false;
    document.getElementById('filter-tuesday').checked = false;
    document.getElementById('filter-wednesday').checked = false;
    document.getElementById('filter-thursday').checked = false;
    document.getElementById('filter-friday').checked = false;
    document.getElementById('filter-saturday').checked = false;

    document.getElementById('search-bar').value = '';
}

function applyFilter(startIndex) {
    const selectedDays = [];
    const searchTerm = document.getElementById('search-bar').value.toLowerCase();

    // Get selected days from checkboxes
    if (document.getElementById('filter-monday').checked) selectedDays.push(startIndex+0);
    if (document.getElementById('filter-tuesday').checked) selectedDays.push(startIndex+1);
    if (document.getElementById('filter-wednesday').checked) selectedDays.push(startIndex+2);
    if (document.getElementById('filter-thursday').checked) selectedDays.push(startIndex+3);
    if (document.getElementById('filter-friday').checked) selectedDays.push(startIndex+4);
    if (document.getElementById('filter-saturday').checked) selectedDays.push(startIndex+5);

    const rows = document.querySelectorAll('#data-body.view-mode tr');
    rows.forEach(row => {
        let shouldShowRow = false;
    
        const type = row.cells[0].innerText.toLowerCase();
        const name = row.cells[1].innerText.toLowerCase();
    
        // Check if the searchTerm is a single character or an integer
        const isSingleCharacter = searchTerm.length === 1;
        const isInteger = !isNaN(searchTerm) && Number.isInteger(Number(searchTerm));

        if (searchTerm) {
            // Needs to take into account for days
            if (isSingleCharacter || isInteger) {
                // Search column 1 only
                if (type === searchTerm.toLowerCase()) {
                    shouldShowRow = isDaySelected(row, selectedDays);
                }
            } else {
                // Search column 2 only
                if (name.includes(searchTerm.toLowerCase())) {
                    shouldShowRow = isDaySelected(row, selectedDays);
                }
            }
        } else if (selectedDays.length === 6) {
            // If all days selected, show every row
            shouldShowRow = true;
        } else if (selectedDays.length === 0) {
            // If no days selected, show only rows without days
            shouldShowRow = true;
            for (let i = startIndex; i <= startIndex + 6; i++) {
                const cell = row.cells[i];
                if (cell && cell.querySelector('i.fas.fa-check')) {
                    shouldShowRow = false;
                    break;
                }
            }
        } else {
            // If some days selected, show only rows with those days
            shouldShowRow = isDaySelected(row, selectedDays);
        }
        row.style.display = shouldShowRow ? '' : 'none';
    });

    buttonVisibility();

    const dropdown = document.getElementById('filter-dropdown');
    const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown);
    bootstrapDropdown.hide();
}

function isDaySelected(row, selectedDays) {
    for (let i = 0; i < selectedDays.length; i++) {
        const dayColumnIndex = selectedDays[i];
        const cell = row.cells[dayColumnIndex];
        if (cell && cell.querySelector('i.fas.fa-check')) {
            return true;
        }
    }
    return false;
}