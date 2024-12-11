function scrollToBottom() {
    window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
    });
}

function buttonVisibility() {
    const button = document.getElementById('bottom-scroll');
    const isScrollable = document.body.scrollHeight > window.innerHeight;
    const atBottom = (window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight

    if (isScrollable && !atBottom) {
        button.style.display = 'block';
    } else {
        button.style.display = 'none';
    }
}

window.addEventListener('scroll', buttonVisibility);

const observer = new MutationObserver(buttonVisibility);
observer.observe(document, { childList: true, subtree: true });

buttonVisibility();
