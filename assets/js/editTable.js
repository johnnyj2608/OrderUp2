let undoStack = [];
let redoStack = [];
let originalText = "";
let cols = 0;
let filterType = "";

function handleEditClick(columns, table) {
    const editButton = document.getElementById('edit-button');
    if (editButton.classList.contains('active-edit')) {
        return;
    }
    activeEdit(true);
    undoStack = [];
    redoStack = [];
    cols = Number(columns)
    filterType = table;

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    editTableBody.innerHTML = '';
    viewTableBody.querySelectorAll('tr').forEach(viewRow => {
        const rowData = Array.from(viewRow.querySelectorAll('td')).map(cell => {
            const icon = cell.querySelector('i');
            if (icon) {
                if (icon.classList.contains('fa-times')) {
                    return false;
                } else {
                    return true;
                }
            } else {
                return cell.textContent.trim();
            }
        });
        const newRow = createEditRow(rowData);
        editTableBody.appendChild(newRow);

        const lastCell = newRow.cells[cols-1];
        lastCell.style.position = 'relative';

        const trashIcon = createTrashIcon();
        trashIcon.setAttribute('onclick', 'handleDelete(this)');

        lastCell.appendChild(trashIcon);
        editTableBody.appendChild(newRow);
    });

    // Add row to allow adding new rows
    const addRow = document.createElement('tr');
    const addCell = document.createElement('td');
    addCell.colSpan = cols;

    addCell.classList.add('addButton');
    addCell.setAttribute('onclick', 'handleAdd()');
    addCell.innerHTML = `<i class="fas fa-plus"></i>`;

    addRow.appendChild(addCell);
    editTableBody.appendChild(addRow);

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

    const newRow = createEditRow();

    const lastCell = newRow.cells[cols-1];
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
        } else if (lastAction.action === 'upload') {
            lastAction.elements.forEach(element => {
                editTableBody.removeChild(element);
            });
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
        } else if (lastAction.action === 'upload') {
            lastAction.elements.forEach(element => {
                editTableBody.insertBefore(element, lastAction.nextSibling);
            });
        }
        undoStack.push(lastAction);
        toggleUndoRedoButtons();
    }
}

function handleCancel() {
    activeEdit(false);
}

async function handleSave() {
    if (!checkEmptyTextInputs()) {
        alert("Please fill in all text fields.");
        return;
    }
    activeEdit(false);

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
        
        editRow.querySelectorAll('td').forEach((editCell, i) => {
            const viewCell = document.createElement('td');
            const inputField = editCell.querySelector('input');
            
            if (i > 1 && filterType === "days") {
                const checkbox = editCell.querySelector('input[type="checkbox"]');
                const icon = checkbox.checked 
                    ? "<i class='fas fa-check'></i>"
                    : "<i class='fas fa-times'></i>";

                viewCell.innerHTML = icon;
            } else {
                const cellText = inputField.value.trim();
                const convertedDate = new Date(cellText + 'T00:00:00');
    
                if (isNaN(convertedDate.getTime())) {
                    viewCell.innerText = cellText;
                } else {
                    const formattedDate = new Intl.DateTimeFormat('en-US', { 
                        year: '2-digit', 
                        month: '2-digit', 
                        day: '2-digit' 
                    }).format(convertedDate);

                    viewCell.innerText = formattedDate;
                }
            }
            viewRow.appendChild(viewCell);
        });
        viewTableBody.appendChild(viewRow);
    });

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
}

function createEditRow(content = false) {
    const newRow = document.createElement('tr');

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i > 1 && filterType === "days") {
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

            if (i === 0 && filterType === "date") {
                inputField.type = 'date';

                const dateObj = new Date(cellText);
                inputField.value = dateObj.toISOString().split('T')[0];
            } else {
                inputField.type = 'text';
                inputField.value = cellText;
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

        // if (i === 0) {
        //     inputField.addEventListener('input', function() {
        //         this.value = this.value.replace(/[^0-9]/g, '');
        //     });
        // }

        newRow.appendChild(newCell);
    }

    if (newRow.cells[cols-1]) {
        newRow.cells[cols-1].style.textAlign = 'left';
    }
    return newRow;
}

function activeEdit(status) {
    const editButton = document.getElementById('edit-button');
    
    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    if (status) {
        editButton.classList.add('active-edit');

        viewTableBody.classList.add('hidden');
        editTableBody.classList.remove('hidden');

        editFooter.classList.remove('hidden');
        viewFooter.classList.add('hidden');
    } else {
        editButton.classList.remove('active-edit');

        viewTableBody.classList.remove('hidden');
        editTableBody.classList.add('hidden');

        editFooter.classList.add('hidden');
        viewFooter.classList.remove('hidden');
    }
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
        const cell = rows[tr].querySelectorAll('td')[0];
        const inputField = cell.querySelector('input');
        if (inputField && inputField.value.trim() === '') {
            return false;
        }
    }
    return true;
}