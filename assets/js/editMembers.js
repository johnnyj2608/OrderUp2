let undoStack = [];
let redoStack = [];
let originalText = "";

function handleEditClick() {
    const editButton = document.getElementById('edit-button');
    if (editButton.classList.contains('active-edit')) {
        return;
    }
    editButton.classList.toggle('active-edit');
    undoStack = [];
    redoStack = [];

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    editTableBody.innerHTML = '';
    viewTableBody.querySelectorAll('tr').forEach(viewRow => {
        const newRow = createRow(viewRow);
        editTableBody.appendChild(newRow);

        const lastCell = newRow.cells[7];
        lastCell.style.position = 'relative';

        const trashIcon = createTrashIcon();
        trashIcon.setAttribute('onclick', 'handleDelete(this)');

        lastCell.appendChild(trashIcon);
        editTableBody.appendChild(newRow);
    });

    // Add row to allow adding new rows
    const addRow = document.createElement('tr');
    const addCell = document.createElement('td');
    addCell.colSpan = 8;
    addCell.style.textAlign = 'center'; 

    addCell.classList.add('addButton');
    addCell.setAttribute('onclick', 'handleAdd()');
    addCell.innerHTML = `<i class="fas fa-plus"></i>`;

    addRow.appendChild(addCell);
    editTableBody.appendChild(addRow);

    viewTableBody.classList.add('hidden');
    editTableBody.classList.remove('hidden');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');
    editFooter.classList.remove('hidden');
    viewFooter.classList.add('hidden');
    toggleUndoRedoButtons();
}

function handleDelete(deleteButton) {
    const editRow = deleteButton.closest('tr');
    const nextRow = editRow.nextElementSibling;

    redoStack = [];
    undoStack.push({
        action: 'delete', 
        element: editRow, 
        nextSibling: nextRow
    });

    editRow.remove();
    toggleUndoRedoButtons();
}

function handleAdd() {
    const editTableBody = document.querySelector('#data-body.edit-mode');

    const newRow = createRow();

    const lastCell = newRow.cells[7];
    lastCell.style.position = 'relative';

    const trashIcon = createTrashIcon();
    trashIcon.setAttribute('onclick', 'handleDelete(this)');

    lastCell.appendChild(trashIcon);

    const addButtonRow = editTableBody.lastElementChild;
    editTableBody.insertBefore(newRow, addButtonRow);

    redoStack = [];
    undoStack.push({
        action: 'add', 
        element: newRow, 
        nextSibling: addButtonRow
    });
    toggleUndoRedoButtons();
}

function toggleUndoRedoButtons() {
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');

    undoButton.classList.toggle('desaturate', undoStack.length === 0);
    redoButton.classList.toggle('desaturate', redoStack.length === 0);
}

function undo() {
    const lastAction = undoStack.pop();

    if (lastAction) {
        const editTableBody = document.querySelector('#data-body.edit-mode');
        if (lastAction.action === 'toggle') {
            lastAction.element.checked = !lastAction.element.checked;
        } else if (lastAction.action === 'edit') {
            lastAction.element.value = lastAction.originalText;
        } else if (lastAction.action === 'add') {
            editTableBody.removeChild(lastAction.element);
        } else if (lastAction.action === 'delete') {
            editTableBody.insertBefore(lastAction.element, lastAction.nextSibling);
        }
        redoStack.push(lastAction);
        toggleUndoRedoButtons();
    }
}

function redo() {
    const lastAction = redoStack.pop();

    if (lastAction) {
        const editTableBody = document.querySelector('#data-body.edit-mode');
        if (lastAction.action === 'toggle') {
            lastAction.element.checked = !lastAction.element.checked;
        } else if (lastAction.action === 'edit') {
            lastAction.element.value = lastAction.newText;
        } else if (lastAction.action === 'add') {
            editTableBody.insertBefore(lastAction.element, lastAction.nextSibling);
        } else if (lastAction.action === 'delete') {
            editTableBody.removeChild(lastAction.element);
        }
        undoStack.push(lastAction);
        toggleUndoRedoButtons();
    }
}

function handleCancel() {
    const editButton = document.getElementById('edit-button');
    editButton.classList.remove('active-edit');

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    viewTableBody.classList.remove('hidden');
    editTableBody.classList.add('hidden');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');
    editFooter.classList.add('hidden');
    viewFooter.classList.remove('hidden');
}

async function handleSave() {
    if (!checkEmptyTextInputs()) {
        return;
    }
    const editButton = document.getElementById('edit-button');
    editButton.classList.remove('active-edit');

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    const editRows = editTableBody.querySelectorAll('tr');
    editRows.forEach((editRow, index) => {
        if (index === editRows.length - 1) return;

        const hasData = Array.from(editRow.querySelectorAll('td')).some(editCell => {
            const inputField = editCell.querySelector('input');
            return inputField && inputField.value.trim() !== '';
        });
        if (!hasData) return;

        const viewRow = document.createElement('tr');
        viewRow.classList.add("text-center");
        
        editRow.querySelectorAll('td').forEach((editCell, index) => {
            const viewCell = document.createElement('td');

            const inputField = editCell.querySelector('input');
            if (index < 2) {
                const cellText = inputField.value.trim();
                viewCell.innerText = cellText;
            } else {
                const checkbox = editCell.querySelector('input[type="checkbox"]');
                const icon = checkbox.checked 
                    ? "<i class='fas fa-check'></i>"
                    : "<i class='fas fa-times'></i>";

                viewCell.innerHTML = icon;
            }
            viewRow.appendChild(viewCell);
        });
        viewTableBody.appendChild(viewRow);
    });

    viewTableBody.classList.remove('hidden');
    editTableBody.classList.add('hidden');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');
    editFooter.classList.add('hidden');
    viewFooter.classList.remove('hidden');

    const modifiedElements = new Set();
    while (undoStack.length > 0) {
        const change = undoStack.pop();
        let row = change.element
        const action = change.action;

        if (action === "edit") {
            row = change.element.closest('tr');
        }

        const hasData = Array.from(row.querySelectorAll('td')).some(cell => {
            const inputField = cell.querySelector('input');
            return inputField && inputField.value.trim() !== '';
        });

        if (hasData) {  // Not an empty add
            if (action !== "delete") {
                modifiedElements.add(row);
            } else {
                const deleteRow = document.createElement('tr');
                modifiedElements.add(deleteRow)
            }
        }
    }

    // dataUpdate = []
    // modifiedElements.forEach(row => {
    //     const dataRow = row.getAttribute('data-row');
    //     const cells = row.querySelectorAll('td');
        
    //     const rowData = {
    //         row: dataRow, // data-row attribute
    //         name: cells[0]?.querySelector('input')?.value ?? '',
    //         breakfast: cells[1]?.querySelector('input')?.value ?? '',
    //         lunch: cells[2]?.querySelector('input')?.value ?? '',
    //         timestamp: cells[3]?.querySelector('input')?.value ?? '',
    //     };

    //     dataUpdate.push(rowData);
    // });

    // try {
    //     const response = await fetch('/historyEdit', {
    //         method: 'POST',
    //         headers: {
    //             'Content-Type': 'application/json',
    //         },
    //         body: JSON.stringify({ 
    //             dataUpdate
    //         }),
    //     });

    //     const result = await response.json();
    //     if (result.success) {
    //         // Update data-row attributes for newly added rows
    //     } else {
    //         alert("error")
    //     }
    // } catch (error) {
    //     console.error('Error:', error);
    // }
}

function createRow(viewRow = false) {
    const newRow = document.createElement('tr');
    newRow.classList.add('text-center');

    for (let i = 0; i < 8; i++) {
        const newCell = document.createElement('td');
    
        if (i < 2) {
            const cellText = viewRow ? viewRow.cells[i].textContent.trim() : '';
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.width = "100%";
            inputField.value = cellText;

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

            if (i === 0) {
                inputField.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }

            newCell.appendChild(inputField);
        } else {
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.checked = viewRow ? viewRow.cells[i].querySelector('i').classList.contains('fa-check') : false;
            checkbox.classList.add('checkbox-large');

            checkbox.addEventListener('change', function() {
                undoStack.push({
                    action: 'toggle',
                    element: checkbox,
                });
                toggleUndoRedoButtons();
            });

            newCell.appendChild(checkbox);
        }
        newRow.appendChild(newCell);
    }
    return newRow;
}

function createTrashIcon() {
    const trashIcon = document.createElement('span');
    trashIcon.classList.add('trash-icon');
    trashIcon.style.position = 'absolute';
    trashIcon.style.right = '10px';
    trashIcon.style.top = '45%';
    trashIcon.style.transform = 'translateY(-50%)';
    trashIcon.style.fontSize = '20px';
    trashIcon.innerHTML = '<i class="fas fa-trash"></i>';
    return trashIcon;
}

function checkEmptyTextInputs() {
    const editTableBody = document.querySelector('#data-body.edit-mode');
    const rows = editTableBody.querySelectorAll('tr');

    for (let tr = 0; tr < rows.length - 1; tr++) {
        for (let td = 0; td < 2; td++) {
            const cell = rows[tr].querySelectorAll('td')[td];
            const inputField = cell.querySelector('input[type="text"]');
            if (inputField.value.trim() === '') {
                return false;
            }
        }
    }
    return true
}