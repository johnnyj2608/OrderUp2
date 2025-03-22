let goBreakfast = true;
let goLunch = true;

function handleMealClick(menuItem) {
    const menuType = menuItem.getAttribute('data-type'); 
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
    const breakfastCount = listItem.getAttribute('data-breakfast');
    const lunchCount = listItem.getAttribute('data-lunch');
    const maxCount = listItem.getAttribute('data-max');

    const panels = document.querySelectorAll('.panel');
    panels.forEach(panel => {
        panel.classList.remove('desaturate');
    });
    
    goBreakfast = true;
    goLunch = true;

    if (listItem.classList.contains('selected')){
        if (breakfastCount >= maxCount || lunchCount >= maxCount) {
            panels.forEach(panel => {
                if (breakfastCount >= maxCount && panel.getAttribute('data-type') === 'breakfast') {
                    panel.classList.add('desaturate');
                    panel.classList.remove('selectedBreakfast');
                    goBreakfast = false;
                } else if (lunchCount >= maxCount && panel.getAttribute('data-type') === 'lunch') {
                    panel.classList.add('desaturate');
                    panel.classList.remove('selectedLunch');
                    goLunch = false;
                }
            });
        }
    }
    document.querySelectorAll('#nameList li').forEach(item => {
        if (item !== listItem) {
            item.classList.remove('selected');
        }
    });
    
    updateButtonState();
    handleScroll();
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

function handleScroll() {
    const selectedBreakfast = document.querySelector('.selectedBreakfast');
    const selectedLunch = document.querySelector('.selectedLunch');
    const selectedName = document.querySelector('#nameList li.selected');

    const breakfastSection = document.getElementById('breakfastSection');
    const lunchSection = document.getElementById('lunchSection');

    const viewportOffset = window.innerHeight * 0.2;

    function scrollToSection(section) {
        const sectionTop = section.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({
            top: sectionTop - viewportOffset,
            behavior: 'smooth',
        });
    }

    if (selectedName) {
        if ((selectedBreakfast || !goBreakfast) && goLunch) {
            scrollToSection(lunchSection);
        } else {
            scrollToSection(breakfastSection);
        }
    } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

async function submitOrder(button) {
    if (!button.classList.contains('disabled')) {
        button.classList.add('disabled');
        const dateInput = document.getElementById('datePicker').value || new Date().toLocaleString();;

        const selectedName = document.querySelector('#nameList li.selected');
        const memberID = selectedName ? selectedName.getAttribute('data-index') : null;

        const selectedBreakfast = document.querySelector('.selectedBreakfast');
        const breakfastID = selectedBreakfast?.id?.replace(/^menu-/, '') || null;
        const breakfastName = selectedBreakfast?.getAttribute('data-text') || null;

        const selectedLunch = document.querySelector('.selectedLunch');
        const lunchID = selectedLunch?.id?.replace(/^menu-/, '') || null;
        const lunchName = selectedLunch?.getAttribute('data-text') || null;

        const memberDailyMax = selectedName ? parseInt(selectedName.getAttribute('data-max')) : 0;
        const memberBreakfastCount = selectedName ? parseInt(selectedName.getAttribute('data-breakfast')) : 0;
        const memberLunchCount = selectedName ? parseInt(selectedName.getAttribute('data-lunch')) : 0;

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    memberID,
                    dateInput,
                    breakfastID,
                    breakfastName,
                    lunchID,
                    lunchName,
                }),
            });

            const result = await response.json();
            if (result.success) {
                const orderedBreakfast = selectedBreakfast ? 1 : 0;
                const orderedLunch = selectedLunch ? 1 : 0;

                if (memberBreakfastCount + orderedBreakfast >= memberDailyMax &&
                    memberLunchCount + orderedLunch >= memberDailyMax
                ) {
                    document.getElementById('searchBar').value = '';
                    searchNames();
                }

                // Handled by real time subscription

                // const menuValue = selectedName.getAttribute('data-menu');
                // const menuTypeSpan = selectedName.querySelector('.menu-type');
                // if (breakfastName !== null && lunchName !== null || menuValue !== 'A') {
                //     selectedName.parentNode.removeChild(selectedName);
                // } else if (breakfastName !== null) {
                //     selectedName.setAttribute('data-menu', 'L');
                //     menuTypeSpan.innerText = 'L';
                // } else if (lunchName !== null) {
                //     selectedName.setAttribute('data-menu', 'B');
                //     menuTypeSpan.innerText = 'B';
                // }
                
                resetSelection();
                handleScroll();

                console.log("Order submitted successfully!");
            } else {
                alert("error")
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }
}

document.ondblclick = function (e) {
    e.preventDefault();
}