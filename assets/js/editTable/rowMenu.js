function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');
    const rowId = content ? content.pop() : false;
    if (rowId) {
        newRow.setAttribute('data-id', rowId);
    }

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i === 0) {
            const dropdown = document.createElement('select');

            const optionNone = document.createElement('option');
            optionNone.value = ''
            optionNone.textContent = '';
            dropdown.appendChild(optionNone);

            const optionBreakfast = document.createElement('option');
            optionBreakfast.value = 'B';
            optionBreakfast.textContent = 'B';
            dropdown.appendChild(optionBreakfast);

            const optionLunch = document.createElement('option');
            optionLunch.value = 'L';
            optionLunch.textContent = 'L';
            dropdown.appendChild(optionLunch);

            if (content && (content[i] === 'B' || content[i] === 'L')) {
                dropdown.value = content[i];
            }

            dropdown.addEventListener('focus', function() {
                originalText = dropdown.value;
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
        } else if (i > 2 && i < cols-1) {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = content ? content[i] : false;
            checkbox.classList.add('checkbox-large');

            checkbox.addEventListener('change', function() {
                undoStack.push({
                    action: 'toggle',
                    element: checkbox,
                });
                toggleUndoRedoButtons();
            });

            newCell.appendChild(checkbox);
        } else {
            const inputField = document.createElement('input');

            inputField.type = 'text';
            inputField.value = cellText;

            if (i === cols-1) {
                inputField.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }
            inputField.style.width = (i === cols-1) ? '85%' : '100%';

            inputField.addEventListener('focus', function() {
                originalText = inputField.value;
            });
            inputField.addEventListener('blur', function() {
                if (inputField.value !== originalText) {
                    undoStack.push({
                        action: 'edit', 
                        element: inputField, 
                        originalText: originalText,
                        newText: inputField.value
                    });
                    toggleUndoRedoButtons();
                }
            });

            newCell.appendChild(inputField);
        }

        newRow.appendChild(newCell);
    }

    if (newRow.cells[cols-1]) {
        newRow.cells[cols-1].style.textAlign = 'left';
    }
    return newRow;
}

function createAddRow(cols) {
    const addRow = document.createElement('tr');
    const addCell = document.createElement('td');
    addCell.colSpan = cols;

    addCell.classList.add('addButton');
    addCell.setAttribute('onclick', 'handleAdd()');
    addCell.innerHTML = `<i class="fas fa-plus"></i>`;
    addRow.appendChild(addCell);
    return addRow;
}

async function handleSave() {
    activeEdit(false);

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    const editRows = editTableBody.querySelectorAll('tr');
    editRows.forEach((editRow, index) => {
        if (index === editRows.length - 1) return;

        const viewRow = document.createElement('tr');
        viewRow.setAttribute('data-id', editRow.getAttribute('data-id'));
        
        let emptyAddRow = true
        editRow.querySelectorAll('td').forEach((editCell, i) => {
            const viewCell = document.createElement('td');
            const inputField = editCell.querySelector('input');

            if (i === 0) {
                const dropdown = editCell.querySelector('select');
                viewCell.innerText = dropdown.value;
                if (dropdown.value !== '') {
                    emptyAddRow = false;
                }
            } else if (i > 2 && i < editRow.querySelectorAll('td').length - 1) {
                const checkbox = editCell.querySelector('input[type="checkbox"]');
                const icon = checkbox.checked 
                    ? "<i class='fas fa-check'></i>"
                    : "<i class='fas fa-times'></i>";

                viewCell.innerHTML = icon;
            } else {
                const cellText = inputField.value.trim();
                if (cellText !== '') {
                    emptyAddRow = false;
                }

                if (cellText === '' && i === editRow.querySelectorAll('td').length - 1) {
                    viewCell.innerText = 0;
                } else {
                    viewCell.innerText = cellText;
                }
            }
            viewRow.appendChild(viewCell);
        });
        if (!(emptyAddRow && editRow.getAttribute('data-id') === null)) {
            viewTableBody.appendChild(viewRow);
        }
    });

    const modifiedElements = new Set();
    while (undoStack.length > 0) {
        const change = undoStack.pop();
        const action = change.action;

        if (action === "upload") {
            const uploadedRows = change.elements;
            uploadedRows.forEach(uploadedRow => {
                modifiedElements.add(uploadedRow);
            });
        } else if (action === "toggle" || action === "edit") {
            modifiedRow = change.element.closest('tr');
            modifiedElements.add(modifiedRow);
        } else if (action === "add") {
            modifiedElements.add(change.element);
        } else if (action === "delete") {
            change.element.innerHTML = '';
            modifiedElements.add(change.element)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');

        if (cells.length === 0) {
            dataUpdate.push({ id, delete: true });
        } else {
            const rowData = {
                id: id,
                type: cells[0].querySelector('select').value.trim(),
                name: cells[1].querySelector('input').value.trim(),
                image: cells[2].querySelector('input').value.trim(),
                monday: cells[3].querySelector('input').checked,
                tuesday: cells[4].querySelector('input').checked,
                wednesday: cells[5].querySelector('input').checked,
                thursday: cells[6].querySelector('input').checked,
                friday: cells[7].querySelector('input').checked,
                saturday: cells[8].querySelector('input').checked,
                count: cells[9].querySelector('input').value.trim() || 0,
            };
            if (rowData.id || rowData.type || rowData.name || rowData.image) {
                dataUpdate.push(rowData);
            }
        }
    });

    dataUpdate.reverse()

    if (dataUpdate.length > 0) {
        try {
            const response = await fetch('/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menu: dataUpdate })
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log("Data saved successfully!");
                const newIds = responseData.newIds;

                const rows = viewTableBody.querySelectorAll('tr');

                for (let i = 0; i < newIds.length; i++) {
                    const rowIndex = rows.length - 1 - i;
                    rows[rowIndex].setAttribute('data-id', newIds[newIds.length - 1 - i]);
                }
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