document.getElementById('upload-plus').addEventListener('click', () => {
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
    const addButtonPosition = addButtonRow.getBoundingClientRect().top + window.scrollY;
    const headerHeight = window.innerHeight * 0.14; // Header + Sticky row

    const uploadedRows = [];

    rows.forEach((row) => {
        const trimmedRow = row.trim();
        if (trimmedRow === '') return;
        
        // const cells = row.split(',').map(cell => {
        //     const trimmedCell = cell.trim().toLowerCase();
        //     if (trimmedCell === 'true') {
        //         return true;
        //     } else if (trimmedCell === 'false') {
        //         return false;
        //     }
        //     return cell.trim();
        // });
        const cells = parseCSVRow(trimmedRow);
        const newRow = createEditRow(cells.length, [...cells, null]);

        const lastCell = newRow.cells[newRow.cells.length - 1];
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
    window.scrollTo({ top: addButtonPosition - headerHeight, behavior: 'smooth'});
}

function parseCSVRow(row) {
    const cells = [];
    let currentCell = '';
    let insideQuotes = false;

    for (let i = 0; i < row.length; i++) {
        const char = row[i];

        if (char === '"' && (i === 0 || row[i - 1] !== '"')) {
            insideQuotes = !insideQuotes;
        } else if (char === ',' && !insideQuotes) {
            cells.push(currentCell.trim());
            currentCell = '';
        } else {
            currentCell += char;
        }
    }

    if (currentCell.trim() !== '') {
        cells.push(currentCell.trim());
    }

    return cells;
}