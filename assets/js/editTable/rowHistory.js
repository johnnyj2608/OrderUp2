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

        if (i === 0 && weekColor) {
            newCell.classList.add(weekColor);
        }

        if (i == 3 || i == 5) {
            // Dropdown Menu
            const dropdown = document.createElement('select');
            dropdown.dataset.type = i === 2 ? 'breakfast' : 'lunch';
            dropdown.style.width = '100%';

            const blankOption = document.createElement('option');
            blankOption.value = ''; 
            blankOption.textContent = '';
            dropdown.appendChild(blankOption);

            if (cellText) {
                const option = document.createElement('option');
                option.value = cellText;
                option.textContent = cellText;
                dropdown.appendChild(option);
                dropdown.value = cellText;
            }

            dropdown.addEventListener('focus', async () => {
                originalText = dropdown.value;

                const dateValue = newRow.cells[0].textContent;
                const menuData = await fetchMenu(dateValue);
                populateDropdown(dropdown, i === 3 ? menuData.breakfastItems : menuData.lunchItems);
            });

            dropdown.addEventListener('blur', function() {
                if (dropdown.value !== originalText) {
                    undoStack.push({
                        action: 'edit', 
                        element: dropdown, 
                        originalText: originalText,
                        newText: dropdown.value
                    });
                    toggleUndoRedoButtons();
                }
            });

            newCell.appendChild(dropdown);

        } else {
            // Date, Name, Checkbox, Timestamp
            if (cellText === true || cellText === false) {
                const icon = cellText 
                    ? "<i class='fas fa-check'></i>"
                    : "<i class='fas fa-times'></i>";
                newCell.innerHTML = icon;
            } else {
                newCell.textContent = cellText;
            }
        }

        newRow.appendChild(newCell);
    }
    return newRow;
}

async function fetchMenu(date) {
    try {
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();

        const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
        const weekday = days[dayOfWeek];

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
        viewRow.setAttribute('data-id', editRow.getAttribute('data-id'));

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
                } else if (i === 2) {
                    viewCell.innerHTML = `<span class="name-link" onclick="handleSearch('history', '${cellText}')">${cellText}</span>`;
                } else if (i === 3 || i === 5) {
                    viewCell.innerText = editCell.querySelector('select').value;
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

        if (action === "edit") {
            modifiedRow = change.element.closest('tr');
            modifiedElements.add(modifiedRow);
        } else if (action === "delete") {
            change.element.setAttribute('marked-for-deletion', 'true');
            modifiedElements.add(change.element)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');

        if (row.getAttribute('marked-for-deletion')) {
            dataUpdate.push({ id, delete: true });
        } else {
            const breakfastValue = cells[3].querySelector('select').value.trim();
            const lunchValue = cells[5].querySelector('select').value.trim();
            const b_received = cells[4].querySelector('i') && cells[4].querySelector('i').classList.contains('fa-check');
            const l_received = cells[6].querySelector('i') && cells[6].querySelector('i').classList.contains('fa-check');

            const rowData = {
                id: id,
                breakfast: breakfastValue.length === 0 ? null : breakfastValue,
                lunch: lunchValue.length === 0 ? null : lunchValue,
                b_received: breakfastValue.length === 0 ? false : b_received,
                l_received: lunchValue.length === 0 ? false : l_received,
            };
            dataUpdate.push(rowData);
        }
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

                const rowCount = document.querySelector('#data-body.view-mode').querySelectorAll('tr').length;
                
                const dateTitleTextElement = document.getElementById('dateTitleText');
                const dateTitleText = dateTitleTextElement.textContent;
                const updatedDateTitleText = dateTitleText.replace(/\(\d+\)/, `(${rowCount})`);
                dateTitleTextElement.textContent = updatedDateTitleText;
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