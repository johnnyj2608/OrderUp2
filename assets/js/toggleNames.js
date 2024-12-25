function toggleNames(ulElement) {
    const namesList = ulElement.querySelector('div');
    const icon = ulElement.querySelector('i');

    if (!namesList.classList.contains('hidden')) {
        return;
    }
    
    namesList.classList.toggle('hidden');
    icon.classList.toggle('hidden');
}