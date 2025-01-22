function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');
    const rowId = content ? content.pop() : false;
    if (rowId) {
        newRow.setAttribute('data-id', rowId);
    }

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        const inputField = document.createElement('input');

        
        inputField.type = 'text';
        inputField.value = cellText;

        if (i === 0) {
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

        newRow.appendChild(newCell);
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
            
            
            const cellText = inputField.value.trim();

            if (cellText !== '') {
                emptyAddRow = false;
            }
            viewCell.innerText = cellText;
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

    let dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');
    
        if (cells.length === 0) {
            dataUpdate.push({ id, delete: true });
        } else {
            const rowData = {
                id: id,
                index: cells[0].querySelector('input').value.trim(),
                name: cells[1].querySelector('input').value.trim(),
                units: cells[2].querySelector('input').value.trim(),
            }
            if (rowData.id || rowData.index || rowData.name) {
                dataUpdate.push(rowData);
            }
        }
    });

    dataUpdate.reverse()

    if (dataUpdate.length > 0) {
        try {
            const response = await fetch('/members', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ members: dataUpdate })
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
};