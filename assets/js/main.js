function handleNameClick(name) {
    const listItems = document.querySelectorAll('#nameList li');
    listItems.forEach(item => item.classList.remove('selected'));
    event.target.classList.add('selected');
    console.log('Selected:', name);
}