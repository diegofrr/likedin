const toggleSwitch = document.querySelector('.active_option input');
const notWorking = document.querySelector('.not-working');

setStatus();

new MutationObserver(setStatus).observe(toggleSwitch, { attributes: true });

async function setStatus() {
    let _status = await getStatus();
    _status = _status[0].result;

    if (_status) notWorking.classList.add('hidden');
    else notWorking.classList.remove('hidden');
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