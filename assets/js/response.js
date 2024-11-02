document.addEventListener('DOMContentLoaded', () => {
    const params = new URLSearchParams(window.location.search);
    const selectedDay = params.get('day') || 0;
    
    if (selectedDay == 0) {
        const todayCheckbox = document.getElementById('today-icon');
        todayCheckbox.classList.add('fa-calendar-check');
        todayCheckbox.classList.remove('fa-calendar');
    } else {
        const currentDayButton = document.querySelector(`.dayButton[data-day="${selectedDay}"]`);
        currentDayButton.classList.add('selectedDay');
    }
});

function handleDayClick(dayIndex) {
    window.location.href = `?day=${dayIndex}`;
}

let editMode = false;
function handleEditClick() {
    editMode = !editMode;

    const editSections = document.querySelectorAll('.edit-mode');
    const viewSections = document.querySelectorAll('.view-mode');
    const trashIcons = document.querySelectorAll('.trash-icon');

    if (editMode) {
        editSections.forEach(section => {
            section.classList.remove('hidden');
            if (section.hasAttribute('data-orig')) {
                section.value = section.getAttribute('data-orig');
            }
        });
    
        viewSections.forEach(section => {
            section.classList.add('hidden');
        });
    
        trashIcons.forEach(icon => {
            icon.classList.remove('hidden');
        });
    } else {
        editSections.forEach(section => {
            section.classList.add('hidden');
        });
    
        viewSections.forEach(section => {
            section.classList.remove('hidden');
        });
    
        trashIcons.forEach(icon => {
            icon.classList.add('hidden');
        });
    }
}

function handleDelete(deleteButton) {
    const liElement = deleteButton.parentNode;
    liElement.parentNode.removeChild(liElement);
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

    input.addEventListener('blur', function() {
        const nameValue = input.value.trim();
        
        if (nameValue) {
            newLi.innerText = nameValue;
            
            const trashIcon = document.createElement('span');
            trashIcon.className = 'trash-icon';
            trashIcon.onclick = function() {
                handleDelete(this); 
            };
            trashIcon.innerHTML = '<i class="fas fa-trash"></i>';
            
            newLi.appendChild(trashIcon);
        } else {
            newLi.remove();
        }
    });
}

document.getElementById('backButton').addEventListener('click', async () => {
    window.location.href = '/';
});