const mainContent = document.querySelector('#likedin_main');
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

    if (!url.includes('linkedin.com')) {
        if (!url.includes('google.com')) notWorking();
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
                span.classList.add('likedin_v1');

                content.style.position = 'relative';
                content.style.userSelect = 'none';
                content.appendChild(span);

                if (content.querySelector('iframe')) span.classList.add('likedin_v1__iframe')
                else if (content.querySelector('video')) span.classList.add('likedin_v1__video')

                const likeContainer = post.querySelector('.reactions-react-button');
                const trigger = post.querySelector('.reactions-react-button .reactions-menu__trigger');

                const ob = new MutationObserver(() => {
                    const menu = likeContainer.querySelector('.reactions-menu');
                    if (menu) {
                        menu.style.opacity = 0;
                        menu.children[getReaction()].click();
                        ob.disconnect();
                        setTimeout(() => {
                            enableScroll();
                        }, 400);
                    }
                });

                span.onclick = () => {
                    const clickable =
                        content.querySelector('img') ||
                        content.querySelector('iframe') ||
                        content.querySelector('a');

                    setTimeout(() => {
                        if (openned) clickable.click();
                    }, 500);

                    openned = true;
                }

                span.ondblclick = () => {
                    openned = false;
                    span.innerHTML = likeIcon(getReaction());
                    ob.observe(likeContainer, { childList: true, subtree: true })
                    disableScroll(window.scrollY);

                    trigger.click();

                    span.classList.add('likedin__liked');

                    setTimeout(() => {
                        span.classList.remove('likedin__liked');
                    }, 3000);
                }

            }
        });
    }

    function disableScroll(distance) {
        window.onscroll = () => {
            window.scrollTo(0, distance);
        };
    }

    function enableScroll() {
        window.onscroll = function () { };
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
} catch { notWorking(); }

function notWorking() {
    mainContent.style.display = 'none';
    likedinAlert.style.display = 'grid';
}
