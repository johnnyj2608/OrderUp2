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