let undoStack = [];
let redoStack = [];
let originalText = "";
let cols = 0;

function handleEditClick(columns) {
    const editButton = document.getElementById('edit-button');
    if (editButton.classList.contains('active-edit')) {
        return;
    }
    activeEdit(true);
    undoStack = [];
    redoStack = [];
    cols = Number(columns)

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
        const dataId = viewRow.getAttribute('data-id') || null;
        rowData.push(dataId);
        const newRow = createEditRow(cols, rowData);
        editTableBody.appendChild(newRow);

        const lastCell = newRow.cells[cols-1];
        lastCell.style.position = 'relative';

        const trashIcon = createTrashIcon();
        trashIcon.setAttribute('onclick', 'handleDelete(this)');

        lastCell.appendChild(trashIcon);
        editTableBody.appendChild(newRow);
    });

    // Add row to allow adding new rows
    const addRow = createAddRow(cols);
    if (addRow) {
        editTableBody.appendChild(addRow);
    }

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

    const newRow = createEditRow(cols);

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

function activeEdit(status) {
    const editButton = document.getElementById('edit-button');
    
    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    const filterElement = document.getElementById('filter-dropdown');
    const uploadPlus = document.getElementById('upload-plus');

    if (status) {
        editButton.classList.add('active-edit');

        viewTableBody.classList.add('hidden');
        editTableBody.classList.remove('hidden');

        editFooter.classList.remove('hidden');
        viewFooter.classList.add('hidden');

        if (filterElement) {
            filterElement.classList.add('hidden');
        }
        if (uploadPlus) {
            uploadPlus.classList.remove('hidden');
        }
    } else {
        editButton.classList.remove('active-edit');

        viewTableBody.classList.remove('hidden');
        editTableBody.classList.add('hidden');
        
        editFooter.classList.add('hidden');
        viewFooter.classList.remove('hidden');

        if (filterElement) {
            filterElement.classList.remove('hidden');
        }
        
        if (uploadPlus) {
            uploadPlus.classList.add('hidden');
        }
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