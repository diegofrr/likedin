const theme = localStorage.getItem('@likedin_theme');

if (!theme) {
    const ifr = document.createElement('iframe')
    ifr.src = '/mypreferences/d/dark-mode'
    ifr.width = 200
    ifr.height = 200
    ifr.style.display = 'none';
    document.body.insertBefore(ifr, document.body.firstChild)

    const _interval = setInterval(() => {
        try {
            const _body = ifr.contentDocument.body;
            if (_body.classList.contains('boot-complete')) {
                clearInterval(_interval)
                const _html = document.querySelector('html');
                if (_html.classList.contains('theme--dark')) {
                    localStorage.setItem('@likedin_theme', 'dark');
                    _html.classList.remove('theme--dark')
                } else localStorage.setItem('@likedin_theme', 'light');
                _body.querySelectorAll('.config-setting-card__setting-item-ctrl div label')[1].click();
                location.reload()
            }
        } catch { }

    }, 1000)
} else {
    if (theme === 'dark') {
        document.querySelector('html').classList.add('theme--dark');
    } else {
        document.querySelector('html').classList.remove('theme--dark');
    }
}
