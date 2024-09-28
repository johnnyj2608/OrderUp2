function isMobileDevice() {
    return /Mobi|Android/i.test(navigator.userAgent);
}

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

document.addEventListener('DOMContentLoaded', () => {
    const muteButton = document.getElementById('muteButton');
    if (sessionStorage.getItem('mute') === null) {
        sessionStorage.setItem('mute', true);
    }
    let isMuted = sessionStorage.getItem('mute') === 'true';
    
    const icon = muteButton.querySelector('i');
    if (isMuted) {
        icon.classList.remove('fa-volume-up');
        icon.classList.add('fa-volume-mute');
    } else {
        icon.classList.remove('fa-volume-mute');
        icon.classList.add('fa-volume-up');
    }

    muteButton.addEventListener('click', () => {
        stopSpeak();
        isMuted = !isMuted;
        if (isMuted) {
            icon.classList.remove('fa-volume-up');
            icon.classList.add('fa-volume-mute');
        } else {
            icon.classList.remove('fa-volume-mute');
            icon.classList.add('fa-volume-up');
        }
        sessionStorage.setItem('mute', isMuted);
    });
});
