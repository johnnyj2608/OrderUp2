function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');
    const rowId = content ? content.pop() : false;
    if (rowId) {
        newRow.setAttribute('data-id', rowId);
    }

    if (cols > 4 && content) {
        let count = content[content.length - 1];
        const activeDays = content.slice(2, 8)
            .map((isActive, index) => isActive ? weekdays[index] : null)
            .filter(day => day !== null);
        const activeDaysStr = activeDays.join(', ');
        content.splice(2);
        content.push(activeDaysStr);
        content.push(count);
        cols = content.length;
    }
    
    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i === 0) {  // New row has no rowId
            const radioID = rowId ? rowId : crypto.randomUUID();
            const radioBreakfast = document.createElement('input');
            radioBreakfast.type = 'radio';
            radioBreakfast.name = `radio-${radioID}`;
            radioBreakfast.value = 'B';
            radioBreakfast.id = `radioB-${radioID}`;

            const radioLunch = document.createElement('input');
            radioLunch.type = 'radio';
            radioLunch.name = `radio-${radioID}`;
            radioLunch.value = 'L';
            radioLunch.id = `radioL-${radioID}`;

            const labelB = document.createElement('label');
            labelB.textContent = typeB;
            labelB.style.padding = '0 5px';
            labelB.setAttribute('for', `radioB-${radioID}`);

            const labelL = document.createElement('label');
            labelL.textContent = typeL;
            labelL.style.padding = '0 5px';
            labelL.setAttribute('for', `radioL-${radioID}`);

            if (content) {
                if (content[0] === typeB) {
                    radioBreakfast.checked = true;
                } else if (content[0] === typeL) {
                    radioLunch.checked = true;
                }
            }

            radioBreakfast.addEventListener('change', function() {
                if (radioBreakfast.checked) {
                    undoStack.push({
                        action: 'click',
                        element: radioBreakfast,
                        oldElement: radioLunch,
                    });
                    toggleUndoRedoButtons();
                }
            });

            radioLunch.addEventListener('change', function() {
                if (radioLunch.checked) {
                    undoStack.push({
                        action: 'click',
                        element: radioLunch,
                        oldElement: radioBreakfast,
                    });
                    toggleUndoRedoButtons();
                }
            });

            newCell.appendChild(radioBreakfast);
            newCell.appendChild(labelB);
            newCell.appendChild(radioLunch);
            newCell.appendChild(labelL);
        } else if (i === cols-2) {
            newCell.style.display = 'flex';
            newCell.style.flexWrap = 'wrap';
            newCell.style.justifyContent = 'center';
            newCell.style.alignItems = 'center';

            let selectedDays = new Set();
            if (content) {
                selectedDays = new Set(content[i].split(', '));
            }

            weekdays.forEach((day) => {
                const label = document.createElement('label');
                label.style.display = 'flex'; 
                label.style.alignItems = 'center';
                label.style.padding = '0 5px';
                label.style.flexBasis = '30%';

                const checkbox = document.createElement('input');
                checkbox.type = 'checkbox';
                checkbox.value = day;
                
                if (selectedDays.has(day)) {
                    checkbox.checked = true;
                }

                label.appendChild(checkbox);
                label.appendChild(document.createTextNode(day));
                newCell.appendChild(label);

                checkbox.addEventListener('change', function() {
                    undoStack.push({
                        action: 'toggle',
                        element: checkbox,
                    });
                    toggleUndoRedoButtons();
                });
            });
        } else {
            const inputField = document.createElement('input');

            inputField.type = 'text';
            inputField.value = cellText;

            if (i === cols-1) {
                inputField.addEventListener('input', function() {
                    this.value = this.value.replace(/[^0-9]/g, '');
                });
            }
            inputField.style.width = (i === cols-1) ? '80%' : '100%';

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

    if (newRow.cells[cols-1]) {
        newRow.cells[cols-1].style.textAlign = 'left';
    }
    return newRow;
}

function createAddRow(cols) {
    const addRow = document.createElement('tr');
    const addCell = document.createElement('td');
    addCell.colSpan = cols;

    addCell.classList.add('addButton');
    addCell.setAttribute('onclick', 'handleAdd()');
    addCell.innerHTML = `<i class="fas fa-plus"></i>`;
    addRow.appendChild(addCell);
    return addRow;
}

async function handleSave() {
    activeEdit(false);

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    const editRows = editTableBody.querySelectorAll('tr');
    editRows.forEach((editRow, index) => {
        if (index === editRows.length - 1) return;

        const viewRow = document.createElement('tr');
        viewRow.setAttribute('data-id', editRow.getAttribute('data-id'));
        
        let emptyAddRow = true
        editRow.querySelectorAll('td').forEach((editCell, i) => {
            const viewCell = document.createElement('td');
            const inputField = editCell.querySelector('input');

            if (i === 0) {
                const radioButtons = editCell.querySelectorAll('input[type="radio"]');

                if (radioButtons[0].checked) {
                    viewCell.innerText = typeB;
                } else if (radioButtons[1].checked) {
                    viewCell.innerText = typeL;
                }
            } else if (i === editRow.querySelectorAll('td').length - 2) {
                const checkboxes = editRow.querySelectorAll('input[type="checkbox"]');
                const selectedDays = Array.from(checkboxes)
                    .filter(checkbox => checkbox.checked)
                    .map(checkbox => checkbox.value);
                
                    viewCell.innerText = selectedDays.join(', ');
            } else {
                const cellText = inputField.value.trim();
                if (cellText !== '') {
                    emptyAddRow = false;
                }

                if (cellText === '' && i === editRow.querySelectorAll('td').length - 1) {
                    viewCell.innerText = 0;
                } else {
                    viewCell.innerText = cellText;
                }
            }
            viewRow.appendChild(viewCell);
        });
        if (!(emptyAddRow && editRow.getAttribute('data-id') === null)) {
            viewTableBody.appendChild(viewRow);
        }
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
        } else if (action === "toggle" || action === "edit" || action === "click") {
            modifiedRow = change.element.closest('tr');
            modifiedElements.add(modifiedRow);
        } else if (action === "add") {
            modifiedElements.add(change.element);
        } else if (action === "delete") {
            change.element.setAttribute('marked-for-deletion', 'true');
            modifiedElements.add(change.element)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');

        if (row.getAttribute('marked-for-deletion')) {
            dataUpdate.push({ id, delete: true });
        } else {
            const rowData = {
                id: id,
                type: (() => {
                    const radioButtons = cells[0].querySelectorAll('input[type="radio"]');
                    return radioButtons[0].checked ? radioButtons[0].value : radioButtons[1].value;
                })(),
                name: cells[1].querySelector('input').value.trim(),
                monday: cells[2].querySelector(`input[value="${weekdays[0]}"]`).checked,
                tuesday: cells[2].querySelector(`input[value="${weekdays[1]}"]`).checked,
                wednesday: cells[2].querySelector(`input[value="${weekdays[2]}"]`).checked,
                thursday: cells[2].querySelector(`input[value="${weekdays[3]}"]`).checked,
                friday: cells[2].querySelector(`input[value="${weekdays[4]}"]`).checked,
                saturday: cells[2].querySelector(`input[value="${weekdays[5]}"]`).checked,
                count: parseInt(cells[3].querySelector('input').value.trim(), 10) || 0,
            };
            if (rowData.id || rowData.name || rowData.image) {
                dataUpdate.push(rowData);
            }
        }
    });

    dataUpdate.reverse()

    if (dataUpdate.length > 0) {
        try {
            const response = await fetch('/menu', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ menu: dataUpdate })
            });
    
            if (response.ok) {
                const responseData = await response.json();
                console.log("Data saved successfully!");
                const newIds = responseData.newIds;

                const rows = viewTableBody.querySelectorAll('tr');

                for (let i = 0; i < newIds.length; i++) {
                    const rowIndex = rows.length - 1 - i;
                    rows[rowIndex].setAttribute('data-id', newIds[newIds.length - 1 - i]);
                }
            } else {
                console.log("Error saving data.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Error saving data.");
        }
    } else {
        console.log("No data to update.");
    }    
}