function handleMealClick(menuItem) {
    const menuType = menuItem.getAttribute('data-meal-type'); 
    const selectedMenu = `selected${menuType.charAt(0).toUpperCase() + menuType.slice(1)}`;
    menuItem.classList.toggle(selectedMenu);

    document.querySelectorAll('.panel').forEach(btn => {
        if (btn !== menuItem) {
            btn.classList.remove(selectedMenu);
        }
    });
    updateButtonState();
    handleScroll();
}

function searchNames() {
    const input = document.getElementById('searchBar').value.toLowerCase();
    const listItems = document.querySelectorAll('#nameList li');

    listItems.forEach(item => {
        const name = item.textContent.toLowerCase();
        item.style.display = name.includes(input) ? '' : 'none';
    });
}

function handleNameClick(listItem) {
    listItem.classList.toggle('selected');
    const menuType = listItem.getAttribute('data-menu');

    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('desaturate');
    });

    if (menuType !== 'A') {
        panels.forEach(panel => {
            if (menuType === 'L' && panel.id.startsWith('btn-b')) {
                panel.classList.add('desaturate');
                panel.classList.remove('selectedBreakfast');
            } else if (menuType === 'B' && panel.id.startsWith('btn-l')) {
                panel.classList.add('desaturate');
                panel.classList.remove('selectedLunch');
            }
        });
    }
    document.querySelectorAll('#nameList li').forEach(item => {
        if (item !== listItem) {
            item.classList.remove('selected');
        }
    });
    updateButtonState();
}

function updateButtonState() {
    const selectedName = document.querySelector('#nameList li.selected');
    const selectedMeal = document.querySelector('.panel.selectedBreakfast, .panel.selectedLunch');

    const submitButton = document.getElementById('submitButton');

    if (selectedName && selectedMeal) {
        submitButton.classList.remove('disabled');
    } else {
        submitButton.classList.add('disabled');
    }
}

function resetSelection() {
    document.querySelectorAll('.panel').forEach(panel => {
        panel.classList.remove('selectedBreakfast', 'selectedLunch');
        panel.classList.remove('desaturate');
    });

    document.querySelectorAll('#nameList li').forEach(item => {
        item.classList.remove('selected');
    });

    updateButtonState();
}

async function submitOrder(button) {
    if (!button.classList.contains('disabled')) {
        const selectedDate = document.getElementById('datePicker').value;
        const convertedDate = new Date(selectedDate + 'T00:00:00');

        const breakfastName = (document.querySelector('.selectedBreakfast')?.getAttribute('data-text')) || 'none';
        const lunchName = (document.querySelector('.selectedLunch')?.getAttribute('data-text')) || 'none';

        const selectedName = document.querySelector('#nameList li.selected');
        const memberID = selectedName ? selectedName.getAttribute('data-index') : null;

        try {
            const response = await fetch('/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    memberID,
                    convertedDate,
                    breakfastName, 
                    lunchName,
                }),
            });

            const result = await response.json();
            if (result.success) {

                const menuValue = selectedName.getAttribute('data-menu');
                const menuTypeSpan = selectedName.querySelector('.menu-type');
                if (breakfastName !== 'none' && lunchName !== 'none' || menuValue !== 'A') {
                    selectedName.parentNode.removeChild(selectedName);
                } else if (breakfastName !== 'none') {
                    selectedName.setAttribute('data-menu', 'L');
                    menuTypeSpan.innerText = 'L';
                } else if (lunchName !== 'none') {
                    selectedName.setAttribute('data-menu', 'B');
                    menuTypeSpan.innerText = 'B';
                }
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                resetSelection();
            } else {
                alert("error")
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}
