let undoStack = [];
let redoStack = [];
let originalText = "";
function handleEditClick() {
    const editButton = document.getElementById('edit-button');
    if (editButton.classList.contains('active-edit')) {
        return;
    }
    editButton.classList.add('active-edit');
    undoStack = [];
    redoStack = [];

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    viewSections.forEach(viewSection => {
        const viewTitle = viewSection.querySelector('.panel-title');
        const viewImage = viewSection.querySelector('.image-container img');
        const viewListItems = viewSection.querySelectorAll('.nameResponses li');

        const editSection = viewSection.closest('.panel').querySelector('.edit-mode');
        const editTitleInput = editSection.querySelector('.panel-title');
        const editImageTextarea = editSection.querySelector('.panel-img');
        const editList = editSection.querySelector('.nameResponses');

        if (viewTitle && editTitleInput) {
            editTitleInput.value = viewTitle.innerText;

            editTitleInput.addEventListener('focus', function() {
                originalText = editTitleInput.value;
            });
            editTitleInput.addEventListener('blur', function() {
                if (editTitleInput.value !== originalText) {
                    undoStack.push({
                        action: 'edit', 
                        element: editTitleInput, 
                        originalText: originalText,
                        newText: editTitleInput.value
                    });
                    toggleUndoRedoButtons();
                }
            });
        }

        if (viewImage && editImageTextarea) {
            editImageTextarea.value = viewImage.src;
            editImageTextarea.addEventListener('focus', function() {
                originalText = editImageTextarea.value;
            });
            editImageTextarea.addEventListener('blur', function() {
                if (editImageTextarea.value !== originalText) {
                    undoStack.push({
                        action: 'edit', 
                        element: editImageTextarea, 
                        originalText: originalText,
                        newText: editImageTextarea.value
                    });
                    toggleUndoRedoButtons();
                }
            });
        }

        editList.innerHTML = '';
        viewListItems.forEach(name => {
            const newLi = document.createElement('li');
            newLi.textContent = name.textContent;

            const trashIcon = document.createElement('span');
            trashIcon.classList.add('trash-icon');
            trashIcon.setAttribute('onclick', 'handleDelete(this)');
            trashIcon.style.position = "absolute";
            trashIcon.style.right = "3px";
            trashIcon.innerHTML = '<i class="fas fa-trash"></i>';

            newLi.appendChild(trashIcon);
            editList.appendChild(newLi);
        });

        const addButtonLi = document.createElement('li');
        addButtonLi.classList.add('addButton');
        addButtonLi.setAttribute('onclick', 'handleAdd(this)');
        addButtonLi.innerHTML = `<i class="fas fa-plus"></i>`;
        editList.appendChild(addButtonLi);

        viewSection.classList.add('hidden');
    });

    editSections.forEach(editSection => {
        editSection.classList.remove('hidden');
    });

    editFooter.classList.remove('hidden');
    viewFooter.classList.add('hidden');
    toggleUndoRedoButtons();
}

function handleDelete(deleteButton) {
    const liElement = deleteButton.parentNode;
    const parentElement = liElement.parentNode;
    const nextSibling = liElement.nextElementSibling;

    redoStack = [];
    undoStack.push({
        action: 'delete', 
        element: liElement, 
        parent: parentElement,
        nextSibling: nextSibling
    });

    parentElement.removeChild(liElement);
    toggleUndoRedoButtons();
}

function handleAdd(addButton) {
    const newLi = document.createElement('li');

    const input = document.createElement('input');
    input.type = 'text';
    input.style.width = '100%';
    input.style.textAlign = 'center';

    newLi.appendChild(input);

    const nameResponsesList = addButton.parentElement;
    nameResponsesList.insertBefore(newLi, addButton);

    input.focus();

    let keyPressed = false;

    function handleInput() {
        const nameValue = input.value.trim();

        if (nameValue) {
            newLi.innerText = nameValue;

            const trashIcon = document.createElement('span');
            trashIcon.className = 'trash-icon';
            trashIcon.onclick = function() {
                handleDelete(this);
            };
            trashIcon.innerHTML = '<i class="fas fa-trash"></i>';

            const nextSibling = newLi.nextElementSibling;
            redoStack = [];
            undoStack.push({
                action: 'add', 
                element: newLi, 
                parent: nameResponsesList,
                nextSibling: nextSibling
            });
            newLi.appendChild(trashIcon);
            toggleUndoRedoButtons();
        } else {
            newLi.remove();
        }
    }

    input.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            keyPressed = true;
            handleInput();
        } else if (event.key === 'Escape') {
            keyPressed = true;
            input.value = '';
            handleInput();
        }
    });

    input.addEventListener('blur', function() {
        if (!keyPressed) {
            handleInput();
        }
    });
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
        if (lastAction.action === 'edit') {
            lastAction.element.value = lastAction.originalText;
        }
        else if (lastAction.action === 'add') {
            lastAction.parent.removeChild(lastAction.element);
        } else if (lastAction.action === 'delete') {
            lastAction.parent.insertBefore(lastAction.element, lastAction.nextSibling);
            
        }
        redoStack.push(lastAction);
        toggleUndoRedoButtons();
    }
}

function redo() {
    const lastAction = redoStack.pop();

    if (lastAction) {
        if (lastAction.action === 'edit') {
            lastAction.element.value = lastAction.newText;
        }
        else if (lastAction.action === 'add') {
            lastAction.parent.insertBefore(lastAction.element, lastAction.nextSibling);
        } else if (lastAction.action === 'delete') {
            lastAction.parent.removeChild(lastAction.element);
            
        }
        undoStack.push(lastAction);
        toggleUndoRedoButtons();
    }
}

function handleCancel() {
    const editButton = document.getElementById('edit-button');
    editButton.classList.remove('active-edit');

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    viewSections.forEach(viewSection => {
        viewSection.classList.remove('hidden');
    });

    editSections.forEach(editSection => {
        editSection.classList.add('hidden');
    });

    editFooter.classList.add('hidden');
    viewFooter.classList.remove('hidden');
}

function handleSave() {
    const editButton = document.getElementById('edit-button');
    editButton.classList.remove('active-edit');

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');

    const editFooter = document.getElementById('edit-footer');
    const viewFooter = document.getElementById('view-footer');

    viewSections.forEach(viewSection => {
        const viewTitle = viewSection.querySelector('.panel-title');
        const viewImage = viewSection.querySelector('.image-container img');
        const viewList = viewSection.querySelector('.nameResponses');

        const editSection = viewSection.closest('.panel').querySelector('.edit-mode');
        const editTitleInput = editSection.querySelector('.panel-title');
        const editImageTextarea = editSection.querySelector('.panel-img');
        const editListItems = editSection.querySelectorAll('.nameResponses li');

        if (viewTitle && editTitleInput) {
            viewTitle.innerText = editTitleInput.value;
        }

        if (viewImage && editImageTextarea) {
            viewImage.src = editImageTextarea.value;
        }
        
        viewList.innerHTML = '';
        editListItems.forEach((name, index) => {
            if (index === editListItems.length - 1) return;

            const newLi = document.createElement('li');
            newLi.innerHTML = `
                ${name.textContent}
            `;
            viewList.appendChild(newLi);
        });
        const liCount = viewList.querySelectorAll('li').length;
        const amountOverlay = viewSection.querySelector('.amount-overlay');
        amountOverlay.textContent = liCount;

        viewSection.classList.remove('hidden');
    });

    editSections.forEach(editSection => {
        editSection.classList.add('hidden');
    });

    editFooter.classList.add('hidden');
    viewFooter.classList.remove('hidden');
}