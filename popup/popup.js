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
                        }, 500);
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
                    }, 4000);
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

function likeIcon(id) {
    return id == 0 ?
        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="like-consumption-medium" data-supported-dps="24x24">
      <g>
      <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none"/>
      <circle cx="12" cy="12" r="11" fill="#378fe9"/>
      <path d="M11.71 9.54H5.88A1.37 1.37 0 004.5 11 1.43 1.43 0 006 12.34h.25a1.25 1.25 0 00-.1 2.5 1.25 1.25 0 00.52 2.23 1.23 1.23 0 00-.13.88 1.33 1.33 0 001.33 1h3.6a5.54 5.54 0 001.4-.18l2.26-.66h3c1.58-.06 2-7.29 0-7.29h-.86c-.14 0-.23-.3-.62-.72-.58-.62-1.23-1.42-1.69-1.88a11.19 11.19 0 01-2.68-3.46c-.37-.8-.41-1.17-1.18-1.17a1.22 1.22 0 00-1 1.28c0 .42.09.84.16 1.26a12.52 12.52 0 001.55 3.46" fill="#d0e8ff" fill-rule="evenodd"/>
      <path d="M11.71 9.54H5.88a1.43 1.43 0 00-1 .43A1.43 1.43 0 006 12.36h.25A1.23 1.23 0 005 13.61a1.25 1.25 0 001.15 1.25 1.22 1.22 0 00-.47 1.28 1.24 1.24 0 001 .94 1.23 1.23 0 00-.13.88 1.33 1.33 0 001.33 1h3.6a6 6 0 001.4-.18l2.26-.66h3c1.58-.05 2-7.28 0-7.28h-.86c-.14 0-.23-.3-.62-.72-.59-.62-1.24-1.43-1.66-1.88a11.19 11.19 0 01-2.68-3.46c-.37-.81-.41-1.2-1.18-1.17a1.15 1.15 0 00-1 1.28c0 .4.05.81.11 1.21a12.12 12.12 0 001.55 3.44" fill="none" stroke="#004182" stroke-linecap="round" stroke-linejoin="round"/>
      </g>
        </svg>`
        : id == 1 ?
            `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="praise-consumption-medium" data-supported-dps="24x24">
      <defs>
        <mask id="reactions-praise-consumption-medium-a" x="1" y="1" width="22.37" height="22" maskUnits="userSpaceOnUse">
          <circle cx="12" cy="12" r="11" fill="#fff"/>
        </mask>
      </defs>
      <g>
        <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none"/>
        <circle cx="12" cy="12" r="11" fill="#6dae4f"/>
        <g>
          <circle cx="12" cy="12" r="11" fill="#6dae4f"/>
        </g>
        <g mask="url(#reactions-praise-consumption-medium-a)">
          <path d="M19.86 15l-.71-.53s-.29-2.82-.8-3.36a9.23 9.23 0 01-1.91-3.75c-.24-.83-.41-1.12-1.16-1.14a1.14 1.14 0 00-1 1.26 8.47 8.47 0 00.1 1.13 16.13 16.13 0 00.9 2.89l-.28-.22-6.88-5.2a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.54 2.66 1.06.8-5.66-4.26a1.18 1.18 0 00-.89-.33 1.17 1.17 0 00-.84.44 1.11 1.11 0 00-.17.92 1.1 1.1 0 00.57.74l3.54 2.66 2.12 1.6-4.6-3.46a1.11 1.11 0 00-1.9 1 1.1 1.1 0 00.57.74l3.54 2.66 1.77 1.33-3.54-2.63a1.18 1.18 0 00-.9-.35 1.19 1.19 0 00-.84.41 1.12 1.12 0 00-.19.94 1.15 1.15 0 00.57.77L11 19.38a4.31 4.31 0 003.28.79l1.06.8a12.33 12.33 0 002.48-2.57 17.72 17.72 0 002-3.4z" fill="#dcf0cb" fill-rule="evenodd"/>
          <path d="M15.61 11.76L14.55 11" fill="#93d870" fill-rule="evenodd"/>
          <path d="M19.1 13.94c-.11-.83-.19-3.31-.57-3.71a6.71 6.71 0 01-2.09-2.92c-.24-.83-.41-1.12-1.16-1.14a1.14 1.14 0 00-1 1.26 8.47 8.47 0 00.1 1.13 20.26 20.26 0 00.9 3.06L8.12 6.25a1.16 1.16 0 00-1.74.11A1.16 1.16 0 006.79 8l3.54 2.68 1.06.8-5.66-4.26a1.18 1.18 0 00-.89-.33 1.15 1.15 0 00-.84.44 1.12 1.12 0 00-.17.92A1.14 1.14 0 004.4 9l3.54 2.66 2.12 1.6-4.6-3.47a1.14 1.14 0 00-.89-.34 1.17 1.17 0 00-.85.44 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.54 2.67 1.77 1.33-3.54-2.66a1.14 1.14 0 00-.9-.33 1.11 1.11 0 00-1 1.38 1.16 1.16 0 00.57.76L11 19.38a4.31 4.31 0 003.28.79" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M22.78 15.48l-.7-.53s-.3-2.82-.81-3.36a9.35 9.35 0 01-1.91-3.75C19.12 7 19 6.72 18.2 6.7a1.08 1.08 0 00-.76.42 1.12 1.12 0 00-.24.88 8.47 8.47 0 00.1 1.13c.28 1.45.58 2.65.62 2.72l-6.77-5.09a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.53 2.66 1.07.8-5.66-4.25a1.18 1.18 0 00-.9-.35 1.08 1.08 0 00-1 1.38 1.19 1.19 0 00.59.73L11 12.17l2.13 1.59-4.64-3.46a1.17 1.17 0 00-.9-.33 1.19 1.19 0 00-.85.44 1.15 1.15 0 00-.16.92 1.14 1.14 0 00.58.74l3.53 2.66 1.77 1.33-3.53-2.66a1.14 1.14 0 00-1.71.07 1.12 1.12 0 00-.19.94 1.16 1.16 0 00.57.76l6.33 4.74a7.09 7.09 0 003.1.94 9.75 9.75 0 001.24.65 5.07 5.07 0 003.19-2 7.61 7.61 0 001.32-4.02z" fill="#ddf6d1" fill-rule="evenodd"/>
          <path d="M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48M7.79 2.72l.35 1.56M12.75 4.63l-1.31.92M10.74 2.43l-1 2.48" fill="#231f20" fill-rule="evenodd"/>
          <path d="M7.59 13.8c.89.69 7 5.39 7.68 5.64a3.28 3.28 0 002.31 0 2.54 2.54 0 00.74-.48M18.06 7.82a18.86 18.86 0 00.69 3.79" fill="none"/>
          <path d="M22.71 15.48A3.24 3.24 0 0122 14.3c-.08-.33-.1-.67-.17-1a3.57 3.57 0 00-.56-1.7 9.35 9.35 0 01-1.91-3.75C19.12 7 19 6.72 18.2 6.7a1.08 1.08 0 00-.76.42 1.12 1.12 0 00-.24.88 8.47 8.47 0 00.1 1.13c.28 1.45.58 2.65.62 2.72l-6.77-5.09a1.18 1.18 0 00-1.74.11 1.11 1.11 0 00-.17.92 1.14 1.14 0 00.58.74l3.53 2.66 1.07.8-5.66-4.25a1.18 1.18 0 00-.9-.35 1.08 1.08 0 00-1 1.38 1.19 1.19 0 00.59.73L11 12.17l2.13 1.59-4.64-3.46a1.17 1.17 0 00-.9-.33 1.19 1.19 0 00-.85.44 1.15 1.15 0 00-.16.92 1.14 1.14 0 00.58.74l3.53 2.66 1.77 1.33-3.53-2.66a1.14 1.14 0 00-1.71.07 1.12 1.12 0 00-.19.94 1.16 1.16 0 00.57.76l6.33 4.74a4.12 4.12 0 001.78.77c.28.06.58.08.91.15a4.41 4.41 0 011.37.45 1.29 1.29 0 001 .08 5.85 5.85 0 002.77-2 5.67 5.67 0 001.1-3.12 1.34 1.34 0 00-.15-.76z" fill="none" stroke="#165209" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
      </g>
            </svg>`
            : id == 2 ?
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="support-consumption-medium" data-supported-dps="24x24">
                  <defs>
                    <mask id="reactions-support-consumption-medium-a" x="0" y="0" width="24" height="24" maskUnits="userSpaceOnUse">
                      <path d="M12 23A11 11 0 101 12a11 11 0 0011 11z" fill="#fff"/>
                    </mask>
                  </defs>
                  <g mask="url(#reactions-support-consumption-medium-a)">
                    <circle cx="12" cy="12" r="12" fill="none"/>
                    <path d="M12 23A11 11 0 101 12a11 11 0 0011 11z" fill="#d8d8d8"/>
                    <path d="M12 23A11 11 0 101 12a11 11 0 0011 11z" fill="#bba9d1"/>
                    <path d="M8.36 14.28H8c-.36-.13-2.16-.82-3.38-1.16a.39.39 0 01-.28-.33 1.06 1.06 0 01.21-.79.65.65 0 01.52-.26 1.06 1.06 0 01.31 0 2.73 2.73 0 01.66.39l.09.07.56.39.52.37 1.31.52c.18.08.92.42.87.6s-.83.17-1 .17z" fill="#fde7ff"/>
                    <path d="M5.09 11.93a1 1 0 01.24.05 3.1 3.1 0 01.7.42l1.11.77 2.19.94a5.18 5.18 0 01-1.18 0H8.1c-.49-.19-2.2-.83-3.39-1.16a.18.18 0 01-.13-.15.87.87 0 01.13-.63.42.42 0 01.37-.17zm0-.39a.88.88 0 00-.7.34 1.3 1.3 0 00-.2.92.6.6 0 00.43.52c1.22.34 3 1 3.36 1.15a.58.58 0 00.19 0h.25c.27 0 2.46.28 2.52 0-.43-.25-2-1-2.29-1.18l-1.3-.52-.52-.36a5 5 0 01-.53-.38L6.2 12a2.47 2.47 0 00-.72-.42 1.15 1.15 0 00-.37-.06z" style="isolation:isolate" fill="#fce2ba" opacity=".23"/>
                    <path d="M21.23 19.91a33.64 33.64 0 01-5.3-.53h-.1a29.14 29.14 0 01-3.93-.81c-1.15-.35-2.28-.8-3.37-1.23L8 17.16c-1-.41-1.87-.75-2.64-1.08L5.11 16a10.91 10.91 0 01-1.34-.63C3.17 15 3 14.53 3.25 14a.87.87 0 01.86-.5h.07a1.13 1.13 0 01.26 0 28.83 28.83 0 014.25 1.36l1.78.06 4 .14a7.3 7.3 0 00-3-1.28c-.37-.1-.71-.2-.78-.47a1.06 1.06 0 01.35-1.13 1.44 1.44 0 01.84-.2 5.19 5.19 0 011 .13 4.24 4.24 0 01.53.16 5.6 5.6 0 001.29.28 15.14 15.14 0 012.2.45c2.24.6 2.68 1.72 3 2.4-.09-.27 0-.07 0-.17l.06-.09h1.48c.18 0 1-.21 1 0a9.33 9.33 0 01-1 4.7.29.29 0 01-.21.16z" fill="#eae2f3"/>
                    <path d="M20.18 15.13a.17.17 0 00.14 0z" fill="#d67676"/>
                    <path d="M8.93 4.64a2.23 2.23 0 00-3.08 0 2.15 2.15 0 000 3.07L9.17 11l3.36-3.3a2.14 2.14 0 000-3.06A2.2 2.2 0 0011 4a2.23 2.23 0 00-1.55.63l-.24.25z" fill="#ecaa96" fill-rule="evenodd"/>
                    <path d="M22.89 15.31a4.45 4.45 0 01-.19 2.55A5.34 5.34 0 0121.42 20a85.21 85.21 0 01-8.62-1c-1.58-.27-9.31-3.65-9.61-3.82a1.13 1.13 0 01.52-1.67c.85-.25 3 1.12 4.41 1.25s4.5.25 5.65.25-1-.8-1.59-1-1.48-.4-1.67-1 .42-1 .93-1a14.1 14.1 0 012.72.67 9.22 9.22 0 013.61.61 4.2 4.2 0 012.16 2c.16.34 2.79-.11 2.96.02z" fill="none" stroke="#493d57"/>
                    <path d="M4.11 13.47C3.75 12.5 4.33 12 5 12s1.35.61 2.45 1.3A27.28 27.28 0 0011 15" fill="none" stroke="#493d57"/>
                    <path d="M8.74 5.13a2.23 2.23 0 00-3.09 0 2.15 2.15 0 000 3L9 11.5l3.37-3.3A2.15 2.15 0 0013 6.31a2.19 2.19 0 00-1.21-1.59 2.14 2.14 0 00-1-.22 2.22 2.22 0 00-1.56.64L9 5.38z" fill="none" stroke="#77280c" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>`
                : id == 3 ?
                    `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="empathy-consumption-medium" data-supported-dps="24x24">
                                              <g>
                                                <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none"/>
                                                <circle cx="12" cy="12" r="11" fill="#df704d"/>
                                                <path d="M11.54 7.3a4.09 4.09 0 00-5.83 0 4.18 4.18 0 000 5.88L12 19.5l6.29-6.32a4.18 4.18 0 000-5.88 4.1 4.1 0 00-2.92-1.22h0a4.07 4.07 0 00-2.9 1.24l-.47.44z" fill="#fff3f0" stroke="#77280c" fill-rule="evenodd"/>
                                                <path d="M17.39 7.57a3.12 3.12 0 01.84 1c1.41 2.62-.95 4.26-2.43 5.75-1 1-1.91 1.92-2.9 2.84M8.52 7a3.42 3.42 0 00-1.19.16 2.88 2.88 0 00-1.49 1.28 3.87 3.87 0 00-.48 2v.15" fill="none"/>
                                                <path d="M11.54 7.22a4.09 4.09 0 00-5.83 0 4.18 4.18 0 000 5.88L12 19.42l6.29-6.32a4.18 4.18 0 000-5.88A4.1 4.1 0 0015.37 6h0a4.06 4.06 0 00-2.9 1.23l-.47.45z" fill="none" stroke="#77280c" stroke-linecap="round" stroke-linejoin="round"/>
                                              </g>
                    </svg>`
                    : id == 4 ?
                        `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" id="interest-consumption-medium" data-supported-dps="24x24">
                        <g>
                          <path d="M12 0a12 12 0 0112 12 12 12 0 01-12 12A12 12 0 010 12 12 12 0 0112 0z" fill="none"/>
                          <circle cx="12" cy="12" r="11" fill="#f5bb5c"/>
                          <path d="M13.29 20.48h-2.52a.86.86 0 01-.84-.84v-2.1h4.2v2.1a.86.86 0 01-.84.84z" fill="#ffe1b2" fill-rule="evenodd"/>
                          <path d="M9.93 18v-.42A4.7 4.7 0 009.69 16a5.21 5.21 0 00-.81-1.26A5.14 5.14 0 017 10.84a5 5 0 1110.08 0 5.27 5.27 0 01-2 4l-.06.05a1.75 1.75 0 00-.29.32 2.49 2.49 0 00-.36.73 5.15 5.15 0 00-.24 1.61V18" fill="#fcf0de" fill-rule="evenodd"/>
                          <path d="M7 3.68l1.05 1.39M17.49 3.68l-1.06 1.39M12 2v2.1" fill="none" stroke="#5d3b01" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M11.15 6.93A3.51 3.51 0 009.23 8a3.93 3.93 0 00-1.07 1.9" fill="none" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"/>
                          <path d="M11.26 15.06a4 4 0 003.5-1 4.31 4.31 0 00-.22-6.5M14.13 14.6a3.62 3.62 0 00-.77 2.51" fill="none"/>
                          <path d="M13.29 20.48h-2.52a.86.86 0 01-.84-.84v-2.1h4.2v2.1a.86.86 0 01-.84.84z" fill="none" stroke="#5d3b01" stroke-linecap="round" stroke-linejoin="round"/>
                          <path d="M9.93 18v-.42A4.7 4.7 0 009.69 16a2.34 2.34 0 00-.41-.74 4.1 4.1 0 00-.58-.67 5.39 5.39 0 01-.58-.59 4.93 4.93 0 01-.83-1.46 4.68 4.68 0 01-.29-1.7h0A5 5 0 1115.93 14a6.45 6.45 0 01-.9.91 1.93 1.93 0 00-.31.33 2.73 2.73 0 00-.35.73 4.88 4.88 0 00-.24 1.61V18" fill="none" stroke="#5d3b01" stroke-linecap="round" stroke-linejoin="round"/>
                        </g>
                        </svg>`
                        :
                        `<svg xmlns="http://www.w3.org/2000/svg" id="Layer_1" data-name="Layer 1" width="22" height="22" viewBox="0 0 22 22">
                        <circle cx="11" cy="11" r="11" style="fill: #44bfd3;"/>
                        <circle cx="11" cy="11" r="8" style="fill: #d5f9fe; stroke: #104e58;"/>
                        <path d="M9.98,8.88c-1.26-.73-2.86-.42-3.75,.73l.38,.45,.22-.12c.92-.51,1.99-.67,3.02-.45l.21-.55-.08-.05Z" style="fill: #104e58;"/>
                        <path d="M15.68,9.6c-.9-1.14-2.5-1.45-3.75-.73l-.08,.05h0l.21,.55c1.03-.22,2.1-.05,3.02,.45l.22,.12,.38-.45h0Z" style="fill: #104e58;"/>
                        <path d="M8.32,6.43c-.58-.08-1.78,.18-2.39,1.11" style="fill: none; stroke: #104e58; stroke-linecap: round;"/>
                        <path d="M13.5,6.43c.58-.08,1.78,.18,2.39,1.11" style="fill: none; stroke: #104e58; stroke-linecap: round;"/>
                        <path d="M14.48,12H7.52c-.51,0-.85,.51-.65,.98,.58,1.36,1.68,3.02,4.13,3.02s3.54-1.66,4.13-3.02c.2-.46-.14-.98-.65-.98Z" style="fill: #2199ac;"/>
                        <path d="M11,14c-1.52,0-3,1-2,1.5q1,.5,2,.5h0q1,0,2-.5c1-.5-.48-1.5-2-1.5Z" style="fill: #d5f9fe;"/>
                        <path d="M14.72,11.5H7.28c-.67,0-1.17,.65-.94,1.31,.27,.79,.69,1.8,1.41,2.62,.73,.84,1.78,1.47,3.26,1.47s2.52-.63,3.26-1.47c.72-.82,1.14-1.83,1.41-2.62,.22-.66-.28-1.31-.94-1.31Zm-1.21,3.27c-.57,.65-1.36,1.13-2.51,1.13s-1.93-.47-2.51-1.13c-.58-.67-.95-1.52-1.21-2.27h7.42c-.26,.75-.62,1.61-1.21,2.27Z" style="fill: #104e58;"/>
                        </svg>`
}
