// ADD STYLE
function addStyle(styleString) {
    const style = document.createElement('style');
    style.textContent = styleString;
    document.head.append(style);
}

addStyle(`
    .clickedin_v1 {
    height: 100%;
    background-color: red;
    width: 100%;
    display: block;
    position: absolute;
    z-index: 9999999;
    opacity: 0.5;
    top: 0;
    left: 0;
    }

    .clickedin_v1__iframe {
        margin: 40px;
        height: calc(100% - 80px);
        width: calc(100% - 80px);
    }
`);

let open = true;

function apply() {
    const posts = document.querySelectorAll('.feed-shared-update-v2');
    posts.forEach(post => {
        if (!hasAdded(post)) {
            let content =
                post.querySelector('.feed-shared-update-v2__content') ||
                post.querySelector('.update-components-linkedin-video__container') ||
                post.querySelector('.feed-shared-event') ||
                post.querySelector('.feed-shared-celebration') ||
                post.querySelector('.update-components-article') ||
                post.querySelector('.artdeco-carousel__content') ||
                post.querySelector('.update-components-showcase') ||
                post.querySelector('.update-components-image');

            if (!content) return;

            const span = document.createElement('span');
            span.classList.add('clickedin_v1');
            content.style.position = 'relative';
            content.appendChild(span);

            if (content.querySelector('iframe')) {
                span.classList.add('clickedin_v1__iframe')
            }

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
                button.click();
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
