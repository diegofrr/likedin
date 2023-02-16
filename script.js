// ADD STYLE
function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

addStyle(`
    .clickedin_v1 {
        height: 100%;
        width: 100%;
        display: block;
        position: absolute;
        z-index: 1000;
        top: 0;
        left: 0;
        display: grid;
        place-items: center;
    }

    .clickedin_v1 svg {
        width: 80px;
        height: 80px;
        transition: all .5s ease;
        opacity: 0;
    }

    .clickedin__liked svg {
        opacity: 1;
        filter: drop-shadow(0 0 20px rgb(0, 0, 0, 1));
    }

    .clickedin_v1 svg > * {
        fill: white;
    }

    .clickedin_v1__video {
        height: calc(100% - 50px);
    }

    .clickedin_v1__iframe {
        margin: 40px;
        height: calc(100% - 80px);
        width: calc(100% - 80px);
    }

    header {
        z-index: 9999 !important;
    }
`);

let open = true;

function apply() {
    const posts = document.querySelectorAll('.feed-shared-update-v2');
    posts.forEach(post => {
        if (!hasAdded(post)) {
            let content =
                post.querySelector('.update-components-linkedin-video__container') ||
                post.querySelector('.update-components-article__link-container') ||
                post.querySelector('.feed-shared-event') ||
                post.querySelector('.feed-shared-celebration') ||
                post.querySelector('.artdeco-carousel__content') ||
                post.querySelector('.update-components-showcase') ||
                post.querySelector('.update-components-image') ||
                post.querySelector('.feed-shared-update-v2__content');

            if (!content) return;

            const span = document.createElement('span');
            span.innerHTML = likeIcon();
            span.classList.add('clickedin_v1');
            content.style.position = 'relative';
            content.appendChild(span);

            if (content.querySelector('iframe')) span.classList.add('clickedin_v1__iframe')
            else if (content.querySelector('video')) span.classList.add('clickedin_v1__video')

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
                const button = post.querySelector('.reactions-react-button button');
                open = false;
                if (button.getAttribute('aria-pressed') === 'false') button.click();
                span.classList.add('clickedin__liked');

                setTimeout(() => {
                    span.classList.remove('clickedin__liked');
                }, 1000);
            }

        } else {
        }
    });
}

apply();

function hasAdded(element) {
    return element.querySelector('.clickedin_v1');
}

function removeAll() {
    const items = document.querySelectorAll('.clickedin_v1');
    items.forEach(item => {
        item.remove();
    })
}

try {
    const ob = new MutationObserver(() => apply());
    ob.observe(document.querySelector('.scaffold-finite-scroll__content'),
        { childList: true, subtree: true })
} catch { }

function likeIcon() {
    return `<?xml version="1.0" encoding="utf-8"?>
    <svg width="800px" height="800px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fill-rule="evenodd" clip-rule="evenodd" d="M15.9 4.5C15.9 3 14.418 2 13.26 2c-.806 0-.869.612-.993 1.82-.055.53-.121 1.174-.267 1.93-.386 2.002-1.72 4.56-2.996 5.325V17C9 19.25 9.75 20 13 20h3.773c2.176 0 2.703-1.433 2.899-1.964l.013-.036c.114-.306.358-.547.638-.82.31-.306.664-.653.927-1.18.311-.623.27-1.177.233-1.67-.023-.299-.044-.575.017-.83.064-.27.146-.475.225-.671.143-.356.275-.686.275-1.329 0-1.5-.748-2.498-2.315-2.498H15.5S15.9 6 15.9 4.5zM5.5 10A1.5 1.5 0 0 0 4 11.5v7a1.5 1.5 0 0 0 3 0v-7A1.5 1.5 0 0 0 5.5 10z" fill="#000000"/>
    </svg>`
}
