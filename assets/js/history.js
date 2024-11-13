function updateTable(date) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const data = result[date];
    const tbody = document.getElementById('data-body');
    tbody.innerHTML = '';

    data.forEach(item => {
        const row = `<tr>
            <td>${item.name}</td>
            <td>${item.breakfast}</td>
            <td>${item.lunch}</td>
            <td>${item.timestamp}</td>
        </tr>`;
        tbody.innerHTML += row;
    });

    const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
        });

    const activeDate = document.getElementById(`${date}-tab`);
    activeDate.classList.add('active');

    handleCancel();
}