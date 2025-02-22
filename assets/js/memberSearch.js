function toggleSearch() {
    const searchContainer = document.getElementById('searchContainer');
    searchContainer.classList.toggle('hidden');

    const searchField = document.getElementById('memberSearch');
    searchField.focus();
}

function handleSearch(member = document.getElementById('memberSearch').value.trim()) {
    let route = '';
    const currentPath = window.location.pathname;

    if (currentPath.includes('members')) {
        route = 'members'; 
    } else if (currentPath.includes('history')) {
        route = 'history';
    }
    window.location.href = `/${route}/?member=${encodeURIComponent(member)}`;
}

document.addEventListener('keydown', (event) => {
    const searchField = document.getElementById('memberSearch');
    if (event.key === 'Enter' && document.activeElement === searchField) {
        handleSearch();
    }
});