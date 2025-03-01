function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');
    const rowId = content ? content.pop() : false;
    if (rowId) {
        newRow.setAttribute('data-id', rowId);
    }

    const weekColor = content ? content.pop() : '';

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i === 0) {
            if (weekColor) {
                newCell.classList.add(weekColor);
            }
            const dateInput = document.createElement('input');
            dateInput.type = 'date';
            dateInput.style.width = '100%';

            const dateArray = cellText.split('/');
            const month = dateArray[0];
            const day = dateArray[1];
            let year = dateArray[2];
            if (year.length === 2) {
                year = '20' + year;
            }

            const formattedDate = `${year}-${month}-${day}`;
            dateInput.value = formattedDate;

            dateInput.addEventListener('change', async () => {
                const newDateValue = dateInput.value;
                const row = newCell.parentElement;
        
                const breakfastDropdown = row.querySelector('select[data-type="breakfast"]');
                const lunchDropdown = row.querySelector('select[data-type="lunch"]');
        
                if (breakfastDropdown || lunchDropdown) {
                    const menuData = await fetchMenu(newDateValue);
                    if (breakfastDropdown) {
                        breakfastDropdown.innerHTML = '';
                        populateDropdown(breakfastDropdown, menuData.breakfastItems);
                    }
                    if (lunchDropdown) {
                        lunchDropdown.innerHTML = '';
                        populateDropdown(lunchDropdown, menuData.lunchItems);
                    }
                }
            });

            newCell.appendChild(dateInput);
        } else if (i === 1) {
            // Name Search
        } else if (i == 2 || i == 4) {
            const dropdown = document.createElement('select');
            dropdown.dataset.type = i === 2 ? 'breakfast' : 'lunch';
            dropdown.style.width = '100%';

            const option = document.createElement('option');
            option.value = cellText;
            option.textContent = cellText;
            dropdown.appendChild(option);
            dropdown.value = cellText;

            dropdown.addEventListener('focus', async () => {
                const dateValue = newRow.cells[0].querySelector('input').value;
                const menuData = await fetchMenu(dateValue);
                populateDropdown(dropdown, i === 2 ? menuData.breakfastItems : menuData.lunchItems);
            });

            newCell.appendChild(dropdown);

        } else if (i == 3 || i == 5) {
            // Checkbox

        } else {
            // Timestamp
        }

        newRow.appendChild(newCell);
    }
    return newRow;
}

async function fetchMenu(date) {
    try {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const weekday = days[dayOfWeek]

        const response = await fetch(`/menuData?weekday=${weekday}`);
        const data = await response.json();

        return { breakfastItems: data.breakfastItems, lunchItems: data.lunchItems };
    } catch (error) {
        console.error('Error fetching menu:', error);
        return { breakfastItems: [], lunchItems: [] };
    }
}

function populateDropdown(dropdown, items) {
    items.forEach(item => {
        if ([...dropdown.options].some(option => option.value === item)) {
            return;
        }

        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;
        dropdown.appendChild(option);
    });
}

function createAddRow(cols) {
    return false;
}

async function handleSave() {
    activeEdit(false);

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    const editRows = editTableBody.querySelectorAll('tr');
    editRows.forEach((editRow) => {

        const viewRow = document.createElement('tr');
        
        editRow.querySelectorAll('td').forEach((editCell, i) => {
            const viewCell = document.createElement('td');
            const cellText = editCell.textContent.trim();

            const iconElement = editCell.querySelector('i');
            if (iconElement !== null && !iconElement.classList.contains('fa-trash')) {
                const icon = editCell.querySelector('i').outerHTML;
                viewCell.innerHTML = icon;
            } else {
                if (i === 0) {
                    viewCell.className = editCell.className;
                    viewCell.innerHTML = `<a class="date-link" href="/history/?date=${cellText}">${cellText}</a>`;
                } else if (i === 1) {
                    viewCell.innerHTML = `<span class="name-link" onclick="handleSearch('${cellText}')">${cellText}</span>`;
                } else {
                    viewCell.innerText = cellText;
                }
            }
            viewRow.appendChild(viewCell);
        });
        viewTableBody.appendChild(viewRow);
    });

    const modifiedElements = new Set();
    while (undoStack.length > 0) {
        const change = undoStack.pop();
        const action = change.action;

        if (action === "delete") {
            modifiedElements.add(change.element)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');
        
        const rowData = {
                id: id,
                breakfast: cells[2].innerText.trim(),
                lunch: cells[4].innerText.trim(),
            };
            dataUpdate.push(rowData);
    });

    if (dataUpdate.length > 0) {
        try {
            const response = await fetch('/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orders: dataUpdate })
            });
    
            if (response.ok) {
                console.log("Data saved successfully!");
            } else {
                console.log("Error saving data.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error saving data.");
        }
    } else {
        console.log("No data to update.");
    }    
}