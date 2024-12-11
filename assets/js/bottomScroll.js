function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

window.addEventListener('scroll', function() {
    const button = document.getElementById('bottom-scroll');
    const isScrollable = document.body.scrollHeight > window.innerHeight;

    if (isScrollable && window.scrollY < document.body.scrollHeight - window.innerHeight) {
        button.style.display = 'block';
    } else {
        button.style.display = 'none';
    }
});

const button = document.getElementById('bottom-scroll');
const isScrollable = document.body.scrollHeight > window.innerHeight;
button.style.display = isScrollable ? 'block' : 'none';

