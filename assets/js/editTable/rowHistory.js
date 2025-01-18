function createEditRow(cols, content = false) {
    const newRow = document.createElement('tr');
    const rowId = content ? content.pop() : false;
    if (rowId) {
        newRow.setAttribute('data-id', rowId);
    }

    const weekColor = content ? content.pop() : '';

    for (let i = 0; i < cols; i++) {
        const newCell = document.createElement('td');
        const cellText = content ? content[i] : '';

        if (i === 0 && weekColor) {
            newCell.classList.add(weekColor);
        }

        if (cellText === true || cellText === false) {
            const icon = cellText 
                ? "<i class='fas fa-check'></i>"
                : "<i class='fas fa-times'></i>";
            newCell.innerHTML = icon;
        } else {
            newCell.textContent = cellText;
        }

        newRow.appendChild(newCell);
    }
    return newRow;
}

function createAddRow(cols) {
    return false;
}

async function handleSave() {
    activeEdit(false);

    const viewTableBody = document.querySelector('#data-body.view-mode');
    const editTableBody = document.querySelector('#data-body.edit-mode');
    
    viewTableBody.innerHTML = '';
    const editRows = editTableBody.querySelectorAll('tr');
    editRows.forEach((editRow) => {

        const viewRow = document.createElement('tr');
        
        editRow.querySelectorAll('td').forEach((editCell, index) => {
            const viewCell = document.createElement('td');
            const cellText = editCell.textContent.trim();

            const iconElement = editCell.querySelector('i');
            if (iconElement !== null && !iconElement.classList.contains('fa-trash')) {
                const icon = editCell.querySelector('i').outerHTML;
                viewCell.innerHTML = icon;
            } else {
                if (index === 0) {
                    viewCell.className = editCell.className;
                }
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

        if (action === "delete") {
            modifiedElements.add(change.element)
        } else {
            console.log("Error, action not recognized")
        }
    }

    dataUpdate = []
    modifiedElements.forEach(row => {
        const id = row.getAttribute('data-id') || null;
        const cells = row.querySelectorAll('td');
        
        const rowData = {
                id: id,
                breakfast: cells[2].innerText.trim(),
                lunch: cells[4].innerText.trim(),
            };
            dataUpdate.push(rowData);
    });

    if (dataUpdate.length > 0) {
        try {
            const response = await fetch('/history', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ orders: dataUpdate })
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
    } else {
        console.log("No data to update.");
    }    
}