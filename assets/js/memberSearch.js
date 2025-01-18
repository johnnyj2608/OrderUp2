function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    searchContainer.classList.toggle('hidden');

    const searchField = document.getElementById('memberSearch');
    searchField.focus();
}

function handleSearch() {
    const searchValue = document.getElementById('memberSearch').value;
    
    window.location.href = `/history/?member=${searchValue}`;
}

document.addEventListener('keydown', (event) => {
    const searchField = document.getElementById('memberSearch');
    if (event.key === 'Enter' && document.activeElement === searchField) {
        handleSearch();
    }
});