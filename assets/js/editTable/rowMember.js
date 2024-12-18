function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i > 1) {
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

            
            inputField.type = 'text';
            inputField.value = cellText;

            if (i === 0) {
                inputField.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
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

        newRow.appendChild(newCell);
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
            
            if (i > 1) {
                const checkbox = editCell.querySelector('input[type="checkbox"]');
                const icon = checkbox.checked 
                    ? "<i class='fas fa-check'></i>"
                    : "<i class='fas fa-times'></i>";

                viewCell.innerHTML = icon;
            } else {
                const cellText = inputField.value.trim();
                
                viewCell.innerText = cellText;
            }
            viewRow.appendChild(viewCell);
        });
        viewTableBody.appendChild(viewRow);
    });

    const modifiedElements = new Set();
    while (undoStack.length > 0) {
        const change = undoStack.pop();
        const action = change.action;

        if (action === "upload") {
            const uploadedRows = change.elements;
            uploadedRows.forEach(uploadedRow => {
                modifiedElements.add(uploadedRow);
            });
        } else if (action !== "add" || action !== "delete") {
            modifiedRow = change.element.closest('tr');
            modifiedElements.add(modifiedRow);
        } else if (action === "add") {
            modifiedElements.add(change.element);
        } else if (action === "delete") {
            const deleteRow = document.createElement('tr');
            modifiedElements.add(deleteRow)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const cells = row.querySelectorAll('td');

        const rowData = {
            id: cells[0].querySelector('input').value,
            name: cells[1].querySelector('input').value,
            monday: cells[2].querySelector('input').checked,
            tuesday: cells[3].querySelector('input').checked,
            wednesday: cells[4].querySelector('input').checked,
            thursday: cells[5].querySelector('input').checked,
            friday: cells[6].querySelector('input').checked,
            saturday: cells[7].querySelector('input').checked,
        };
        dataUpdate.push(rowData);
    });

    try {
        const response = await fetch('/members/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ members: dataUpdate })
        });

        if (response.ok) {
            console.log("Data saved successfully!");
        } else {
            console.log("Error saving data.");
        }
    } catch (error) {
        console.error("Error:", error);
        alert("Error saving data.");
    }
}