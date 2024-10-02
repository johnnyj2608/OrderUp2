function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

var userLang = getCookie('lang') || navigator.language; 
const storedLang = sessionStorage.getItem('language');
if (!storedLang) {
    sessionStorage.setItem('language', userLang);
}

document.querySelectorAll('.dropdown-item').forEach(item => {
    item.addEventListener('click', function(event) {
        event.preventDefault();
        const selectedLang = this.getAttribute('data-lang');
        sessionStorage.setItem('language', selectedLang);
        
        window.location.href = `/switch/${selectedLang}`;
    });
});