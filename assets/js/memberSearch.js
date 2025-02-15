function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    searchContainer.classList.toggle('hidden');

    const searchField = document.getElementById('memberSearch');
    searchField.focus();
}

function handleSearch(member = document.getElementById('memberSearch').value.trim()) {
    window.location.href = `/history/?member=${encodeURIComponent(member)}`;
}

document.addEventListener('keydown', (event) => {
    const searchField = document.getElementById('memberSearch');
    if (event.key === 'Enter' && document.activeElement === searchField) {
        handleSearch();
    }
});