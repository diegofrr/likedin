run(() => { if (!localStorage.getItem('@likedin_theme')) location.reload(); })

const buttonContainer = document.querySelector('.toggle-theme_container');
const toggleBtn = buttonContainer.querySelector('span');

let _isDark = await getTheme();
_isDark = _isDark[0].result === 'dark';

if (_isDark) toggleBtn.classList.add('is-dark');
else toggleBtn.classList.remove('is-dark');

buttonContainer.onclick = toggleTheme;

toggleBtn.innerHTML = iconTheme(!_isDark);

async function getTheme() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return localStorage.getItem('@likedin_theme');
        }
    });
}

async function getStatus() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return JSON.parse(localStorage.getItem('@likedin_v1_status'));
        }
    });
};

async function run(func) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func
    });
}

function toggleTheme() {
    _isDark = toggleBtn.classList.contains('is-dark');
    toggleBtn.classList.toggle('is-dark');

    toggleBtn.innerHTML = iconTheme(_isDark);

    run(() => {
        const _html = document.querySelector('html');

        if (_html.classList.contains('theme--dark')) {
            _html.classList.remove('theme--dark', 'theme--dark-lix', 'theme--mercado-dark');
            _html.classList.add('theme', 'theme--mercado', 'artdeco')
            localStorage.setItem('@likedin_theme', 'light');
        } else {
            _html.classList.add('theme--dark', 'theme--dark-lix', 'theme--mercado-dark');
            localStorage.setItem('@likedin_theme', 'dark');
        }
    });
}

function iconTheme(isDark) {
    return isDark
        ? `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`
        : `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="css-i6dzq1"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`
}