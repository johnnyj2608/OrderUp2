function updateTable(date) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const data = result[date];
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.breakfast}</td>
            <td>${item.lunch}</td>
            <td>${item.timestamp}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

    const activeDate = document.getElementById(`${date}-tab`);
    activeDate.classList.add('active');

    handleCancel();
}

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
        
        viewRow.querySelectorAll('td').forEach(viewCell => {
            const editCell = document.createElement('td');

            const cellText = viewCell.textContent.trim();
            const inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.value = cellText;

            editCell.appendChild(inputField);
            editRow.appendChild(editCell);
        });
        editTableBody.appendChild(editRow);
    });

    viewTableBody.classList.add('hidden');
    editTableBody.classList.remove('hidden');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');
    editFooter.classList.remove('hidden');
    viewFooter.classList.add('hidden');
}

function handleDelete(deleteButton) {

}

function handleAdd(addButton) {

}

function toggleUndoRedoButtons() {
    const undoButton = document.getElementById('undo-button');
    const redoButton = document.getElementById('redo-button');

    undoButton.classList.toggle('desaturate', undoStack.length === 0);
    redoButton.classList.toggle('desaturate', redoStack.length === 0);
}

function undo() {

}

function redo() {

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

function handleSave() {
    const editButton = document.getElementById('edit-button');
    editButton.classList.remove('active-edit');
    
    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    editTableBody.querySelectorAll('tr').forEach(editRow => {
        const viewRow = document.createElement('tr');
        
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
}

document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/';
});