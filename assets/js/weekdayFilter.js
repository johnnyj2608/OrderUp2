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
}

function applyFilter() {
    const selectedDays = [];
    const searchTerm = document.getElementById('search-member').value.toLowerCase();

    // Get selected days from checkboxes
    if (document.getElementById('filter-monday').checked) selectedDays.push(3);
    if (document.getElementById('filter-tuesday').checked) selectedDays.push(4);
    if (document.getElementById('filter-wednesday').checked) selectedDays.push(5);
    if (document.getElementById('filter-thursday').checked) selectedDays.push(6);
    if (document.getElementById('filter-friday').checked) selectedDays.push(7);
    if (document.getElementById('filter-saturday').checked) selectedDays.push(8);

    const rows = document.querySelectorAll('#data-body.view-mode tr');

    rows.forEach(row => {
        let shouldShowRow = false;

        const type = row.cells[0].innerText;
        const name = row.cells[1].innerText.toLowerCase();

        if (searchTerm && !type.includes(searchTerm) && !name.includes(searchTerm)) {
            shouldShowRow = false;
        } else {
            // If search term matches, proceed with day filtering
            if (selectedDays.length === 6) {
                // If all days selected, show every row
                shouldShowRow = true;
            } else if (selectedDays.length === 0) {
                // If no days selected, show only rows without days
                shouldShowRow = true;
                for (let i = 3; i <= 8; i++) {
                    const cell = row.cells[i - 1];
                    if (cell && cell.querySelector('i.fas.fa-check')) {
                        shouldShowRow = false;
                        break;
                    }
                }
            } else {
                // If some days selected, show only rows with those days
                for (let i = 0; i < selectedDays.length; i++) {
                    const dayColumnIndex = selectedDays[i];
                    const cell = row.cells[dayColumnIndex - 1];
                    if (cell && cell.querySelector('i.fas.fa-check')) {
                        shouldShowRow = true;
                        break;
                    }
                }
            }
        }

        row.style.display = shouldShowRow ? '' : 'none';
    });

    buttonVisibility();

    const dropdown = document.getElementById('filter-dropdown');
    const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown);
    bootstrapDropdown.hide();
}
