function handleMealClick(menuType, menuItem) {
    const panel = document.getElementById(`btn-${menuItem}`);

    const selectedMenu = `selected${menuType}`;
    panel.classList.toggle(selectedMenu);
    document.querySelectorAll('.panel').forEach(btn => {
        if (btn !== panel) {
            btn.classList.remove(selectedMenu);
        }
    });
    updateButtonState();
}

function handleNameClick(name) {
    const listItem = document.getElementById(`name-${name.replace(/ /g, '_')}`);

    listItem.classList.toggle('selected');
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