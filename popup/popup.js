const toggleStatus = document.querySelector('.active_option .status');
const toggleInput = document.querySelector('.active_option input');

let open = true;
let working = false;

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
        <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z" fill="#000000"/>
        </svg>`
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