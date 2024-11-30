let undoStack = [];
let redoStack = [];
let originalText = "";

function handleEditClick() {
    const editButton = document.getElementById('edit-button');
    if (editButton.classList.contains('active-edit')) {
        return;
    }
    activeEdit(true);
    undoStack = [];
    redoStack = [];

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

    for (let i = 0; i < 8; i++) {
        const newCell = document.createElement('td');
    
        if (i < 2) {
            const cellText = content ? content[i] : '';
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
        }
        newRow.appendChild(newCell);
    }
    return newRow;
}

function activeEdit(status) {
    const editButton = document.getElementById('edit-button');
    
    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');

    const editHeader = document.getElementById('edit-header');
    const viewHeader = document.getElementById('view-header');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    if (status) {
        editButton.classList.add('active-edit');

        viewTableBody.classList.add('hidden');
        editTableBody.classList.remove('hidden');

        editHeader.classList.remove('hidden');
        viewHeader.classList.add('hidden');

        editFooter.classList.remove('hidden');
        viewFooter.classList.add('hidden');
    } else {
        editButton.classList.remove('active-edit');

        viewTableBody.classList.remove('hidden');
        editTableBody.classList.add('hidden');

        editHeader.classList.add('hidden');
        viewHeader.classList.remove('hidden');

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

document.getElementById('edit-header').addEventListener('click', () => {
    document.getElementById('fileInput').value = '';
    document.getElementById('fileInput').click();
});
document.getElementById('fileInput').addEventListener('change', handleUploadClick);

function handleUploadClick() {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    const isCSV = file.name.endsWith('.csv');

    if (isCSV) {
        reader.onload = function (e) {
            const content = e.target.result;
            populateTableFromCSV(content);
        };
        reader.readAsText(file);
    } else {
        alert('Invalid file format. Please upload a .csv file.');
    }
}

function populateTableFromCSV(content) {
    const rows = content.split('\n');
    const tableBody = document.querySelector('#data-body.edit-mode');
    const addButtonRow = tableBody.lastElementChild;

    const uploadedRows = [];

    rows.forEach((row) => {
        const cells = row.split(',').map(cell => {
            const trimmedCell = cell.trim().toLowerCase();
            if (trimmedCell === 'true') {
                return true;
            } else if (trimmedCell === 'false') {
                return false;
            }
            return cell.trim();
        });
        const newRow = createEditRow(cells);

        const lastCell = newRow.cells[7];
        lastCell.style.position = 'relative';

        const trashIcon = createTrashIcon();
        trashIcon.setAttribute('onclick', 'handleDelete(this)');

        lastCell.appendChild(trashIcon);

        tableBody.insertBefore(newRow, addButtonRow);
        uploadedRows.push(newRow);
    });
    undoStack.push({
        action: 'upload',
        elements: uploadedRows,
        nextSibling: addButtonRow
    });
    toggleUndoRedoButtons();
}

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

    if (document.getElementById('filter-monday').checked) selectedDays.push(3);
    if (document.getElementById('filter-tuesday').checked) selectedDays.push(4);
    if (document.getElementById('filter-wednesday').checked) selectedDays.push(5);
    if (document.getElementById('filter-thursday').checked) selectedDays.push(6);
    if (document.getElementById('filter-friday').checked) selectedDays.push(7);
    if (document.getElementById('filter-saturday').checked) selectedDays.push(8);

    const rows = document.querySelectorAll('#data-body tr');

    rows.forEach(row => {
        let shouldShowRow = false;

        
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
        row.style.display = shouldShowRow ? '' : 'none';
    });

    const dropdown = document.getElementById('filter-dropdown');
    const bootstrapDropdown = bootstrap.Dropdown.getInstance(dropdown);
    bootstrapDropdown.hide();
}