function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        const inputField = document.createElement('input');

        if (i === 0) {
            inputField.type = 'date';

            if (cellText) {
                inputField.value = new Date(cellText).toISOString().split('T')[0];
            }
        } else {
            inputField.type = 'text';
            inputField.value = cellText;

            if (i === 0) {
                inputField.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }
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

    if (newRow.cells[cols-1]) {
        newRow.cells[cols-1].style.textAlign = 'left';
    }
    return newRow;
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

        const viewRow = document.createElement('tr');
        
        editRow.querySelectorAll('td').forEach((editCell, i) => {
            const viewCell = document.createElement('td');
            const inputField = editCell.querySelector('input');
            
            const cellText = inputField.value.trim();
            const isDateString = cellText.includes('-');

            if (isDateString) {
                const convertedDate = new Date(cellText + 'T00:00:00');
                const formattedDate = new Intl.DateTimeFormat('en-US', { 
                    year: '2-digit', 
                    month: '2-digit', 
                    day: '2-digit' 
                }).format(convertedDate);

                viewCell.innerText = formattedDate;
            } else {
                viewCell.innerText = cellText;
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

        if (action !== "delete") {
            modifiedElements.add(row);
        } else {
            const deleteRow = document.createElement('tr');
            modifiedElements.add(deleteRow)
        }
    }
}