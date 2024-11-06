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

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');
    const trashIcons = document.querySelectorAll('.trash-icon');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    viewSections.forEach(viewSection => {
        viewSection.classList.add('hidden');
    });

    editSections.forEach(editSection => {
        editSection.classList.remove('hidden');
    });

    trashIcons.forEach(icon => {
        icon.classList.remove('hidden');
    });

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

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');
    const trashIcons = document.querySelectorAll('.trash-icon');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    viewSections.forEach(viewSection => {
        viewSection.classList.remove('hidden');
    });

    editSections.forEach(editSection => {
        editSection.classList.add('hidden');
    });

    trashIcons.forEach(icon => {
        icon.classList.add('hidden');
    });

    editFooter.classList.add('hidden');
    viewFooter.classList.remove('hidden');
}

function handleSave() {

}

document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/';
});

document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/';
});