const optionsContainer = document.querySelector('.options_container');
const likedinAlert = document.querySelector('.likedin_alert');
const toggleStatus = document.querySelector('.active_option .status');
const toggleInput = document.querySelector('.active_option input');

let open = true;
let working = false;

try {
    let url = await getUrl();
    url = url[0].result;

    async function getUrl() {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        return await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            func: () => location.href,
        });
    };

    if (!url.includes('linkedin.com')) notWorking();
} catch { notWorking() }

function notWorking() {
    optionsContainer.style.display = 'none';
    likedinAlert.style.display = 'grid';
}

(async () => {
    let status = await getStatus();
    status = status[0].result;
    if (status) setSwitchStatus(status);
})();

toggleStatus.onclick = () => toggleInput.click();

toggleInput.onchange = () => {
    const { checked } = toggleInput;

    setSwitchStatus(checked);

    if (checked) {
        run(apply);
        saveStatus(true);
    } else {
        run(removeAll);
        saveStatus(false);
    };
}

function setSwitchStatus(bool) {
    toggleStatus.innerHTML =
        bool ? 'Ativado' : 'Desativado';

    toggleInput.setAttribute('checked', bool);
    if (bool) run(apply);
    else run(removeAll)
}

async function getStatus() {
    let bool;
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    bool = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return JSON.parse(localStorage.getItem('@likedin_v1_status'));
        }
    });
    return bool;
};

async function run(func) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func
    });
}

function apply() {
    working = true;
    const posts = document.querySelectorAll('.feed-shared-update-v2');
    posts.forEach(post => {
        if (!hasAdded(post)) {
            let content =
                post.querySelector('.update-components-linkedin-video__container .relative') ||
                post.querySelector('.update-components-linkedin-video__container') ||
                post.querySelector('.update-components-article__link-container') ||
                post.querySelector('.feed-shared-external-video__container') ||
                post.querySelector('.feed-shared-event') ||
                post.querySelector('.feed-shared-celebration') ||
                post.querySelector('.artdeco-carousel__content') ||
                post.querySelector('.update-components-showcase') ||
                post.querySelector('.update-components-image .relative') ||
                post.querySelector('.update-components-image') ||
                post.querySelector('.feed-shared-update-v2__content') ||
                post.querySelector('.feed-shared-update-v2__update-content-wrapper');

            if (!content) return;

            const span = document.createElement('span');
            span.innerHTML = likeIcon();
            span.classList.add('likedin_v1');

            content.style.position = 'relative';
            content.style.userSelect = 'none';
            content.appendChild(span);

            if (content.querySelector('iframe')) span.classList.add('likedin_v1__iframe')
            else if (content.querySelector('video')) span.classList.add('likedin_v1__video')

            span.onclick = () => {
                const clickable =
                    content.querySelector('img') ||
                    content.querySelector('iframe') ||
                    content.querySelector('a');

                setTimeout(() => {
                    if (open) clickable.click();
                }, 500);

                open = true;
            }

            span.ondblclick = () => {
                open = false;
                const distance = window.scrollY;

                const button = post.querySelector('.reactions-react-button button');
                if (button.getAttribute('aria-pressed') === 'false') button.click();
                span.classList.add('likedin__liked');

                window.scrollTo(0, distance);

                setTimeout(() => {
                    span.classList.remove('likedin__liked');
                }, 1000);
            }

        } else {
        }
    });

    function hasAdded(element) {
        return element.querySelector('.likedin_v1');
    }

    function likeIcon() {
        return `<?xml version="1.0" encoding="utf-8"?>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_119_8)">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M12.69 9.5H5.06C4.58865 9.55997 4.16012 9.80389 3.86788 10.1785C3.57565 10.5532 3.44341 11.0282 3.5 11.5C3.53064 11.9138 3.71886 12.3 4.02585 12.5791C4.33284 12.8582 4.73521 13.0088 5.15 13H5.44C5.07924 13.0105 4.73694 13.1618 4.48645 13.4216C4.23596 13.6815 4.09724 14.0291 4.1 14.39C4.10124 14.7476 4.23644 15.0918 4.47894 15.3547C4.72144 15.6175 5.05363 15.78 5.41 15.81C5.18684 15.9746 5.01677 16.201 4.92077 16.4611C4.82478 16.7213 4.80706 17.0039 4.8698 17.274C4.93254 17.5441 5.07301 17.79 5.27385 17.9812C5.47469 18.1724 5.72713 18.3006 6 18.35C5.83163 18.6545 5.77839 19.0095 5.85 19.35C5.93799 19.6799 6.1352 19.9703 6.40944 20.1737C6.68368 20.3771 7.01876 20.4815 7.36 20.47H11.44C11.9663 20.4688 12.4904 20.4016 13 20.27L15.56 19.52H18.94C20.72 19.45 21.2 11.26 18.94 11.26H17.94C17.77 11.26 17.67 10.92 17.23 10.44C16.58 9.73 15.84 8.82 15.32 8.31C14.0717 7.21355 13.0522 5.88141 12.32 4.39C11.9 3.42 11.85 3 11 3C10.6518 3.04262 10.3329 3.21626 10.1081 3.4856C9.88336 3.75495 9.76961 4.09979 9.79 4.45C9.79 4.7 9.92 5.57 9.97 5.88C10.3201 7.188 10.9175 8.41682 11.73 9.5" fill="white"/>
        </g><defs><clipPath id="clip0_119_8"><rect width="24" height="24" fill="white"/>
        </clipPath></defs></svg>`
    }
}

function removeAll() {
    working = false;
    const items = document.querySelectorAll('.likedin_v1');
    items.forEach(item => {
        item.remove();
    });
}

function saveStatus(bool) {
    if (bool) {
        run(() => {
            localStorage.setItem('@likedin_v1_status', String(true))
        })
    } else {
        run(() => {
            localStorage.setItem('@likedin_v1_status', String(false))
        })
    }
}

run(() => {
    open = true;
    working = false;
})

run(() => {
    const bodyObserve = new MutationObserver(() => {
        try {
            const ob = new MutationObserver(() => {
                if (working) apply;
            });
            ob.observe(document.querySelector('.scaffold-layout__main'),
                { childList: true, subtree: true });

            bodyObserve.disconnect();
        } catch { }

    });

    bodyObserve.observe(document.body, { childList: true })
})

// 