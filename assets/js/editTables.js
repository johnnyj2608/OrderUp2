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
        const editRow = document.createElement('tr');
        editRow.setAttribute('data-row', viewRow.getAttribute('data-row'));
        
        const totalCells = viewRow.querySelectorAll('td')
        totalCells.forEach((viewCell, index) => {
            const editCell = document.createElement('td');

            const cellText = viewCell.textContent.trim();
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = cellText;
            inputField.style.width = "100%";

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

            editCell.appendChild(inputField);

            if (index === totalCells.length - 1) {
                editCell.style.display = 'flex';
                editCell.style.justifyContent = "space-between";

                const trashIcon = document.createElement('span');
                trashIcon.classList.add('trash-icon');
                trashIcon.setAttribute('onclick', 'handleDelete(this)');
                trashIcon.innerHTML = '<i class="fas fa-trash"></i>';
                editCell.appendChild(trashIcon);
            }
            editRow.appendChild(editCell);
        });
        editTableBody.appendChild(editRow);
    });

    const addRow = document.createElement('tr');
    const addCell = document.createElement('td');
    addCell.colSpan = 4;
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
    const editCell = deleteButton.closest('td');
    const editRow = editCell.closest('tr');
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

    const newRow = document.createElement('tr');
    newRow.setAttribute('data-row', 0)
    for (let i = 0; i < 4; i++) {
        const newCell = document.createElement('td');
        const inputField = document.createElement('input');
        inputField.type = 'text';
        inputField.style.width = "100%";

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

        if (i === 3) {
            newCell.style.display = 'flex';
            newCell.style.justifyContent = "space-between";

            const trashIcon = document.createElement('span');
            trashIcon.classList.add('trash-icon');
            trashIcon.setAttribute('onclick', 'handleDelete(this)');
            trashIcon.innerHTML = '<i class="fas fa-trash"></i>';
            newCell.appendChild(trashIcon);
        }
        newRow.appendChild(newCell);
    }
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
        if (lastAction.action === 'edit') {
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
        if (lastAction.action === 'edit') {
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
        viewRow.setAttribute('data-row', editRow.getAttribute('data-row'));
        
        editRow.querySelectorAll('td').forEach(editCell => {
            const viewCell = document.createElement('td');

            const inputField = editCell.querySelector('input');
            const cellText = inputField.value;
            viewCell.innerText = cellText;
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

        if (change.action === "edit") {
            row = change.element.closest('tr');
        }
        const hasData = Array.from(row.querySelectorAll('td')).some(cell => {
            const inputField = cell.querySelector('input');
            return inputField && inputField.value.trim() !== '';
        });
    
        if (hasData) {
            modifiedElements.add(row);
        }
    }
    
    dataUpdate = []
    modifiedElements.forEach(row => {
        const dataRow = row.getAttribute('data-row');
        const cells = row.querySelectorAll('td');
        
        const rowData = {
            row: dataRow, // data-row attribute
            name: cells[0].querySelector('input').value,
            breakfast: cells[1].querySelector('input').value,
            lunch: cells[2].querySelector('input').value,
            timestamp: cells[3].querySelector('input').value,
        };

        dataUpdate.push(rowData);
    });

    console.log(dataUpdate)

    try {
        const response = await fetch('/historyEdit', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                dataUpdate
            }),
        });

        const result = await response.json();
        if (result.success) {

        } else {
            alert("error")
        }
    } catch (error) {
        console.error('Error:', error);
    }
}