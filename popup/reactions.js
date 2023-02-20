const reactionsList = document.querySelectorAll('.reactions_container likedin_react');

let react = await getReaction();
react = react[0].result || 0;
applySelection(reactionsList[react]);

reactionsList.forEach((reaction, index) => {
    reaction.onclick = () => {
        if (reaction.classList.contains('_selected')) return;
        applySelection(reaction);
        saveReaction(index);
    }
});

function saveReaction(i) {
    i === 0 ? run(() => localStorage.setItem('@lkd_react', 0)) :
        i === 1 ? run(() => localStorage.setItem('@lkd_react', 1)) :
            i === 2 ? run(() => localStorage.setItem('@lkd_react', 2)) :
                i === 3 ? run(() => localStorage.setItem('@lkd_react', 3)) :
                    i === 4 ? run(() => localStorage.setItem('@lkd_react', 4)) :
                        run(() => localStorage.setItem('@lkd_react', 5));
}

function applySelection(reaction) {
    reaction.classList.add('_selected');
    reactionsList.forEach(r => {
        if (r !== reaction) r.classList.remove('_selected');
    })
}

async function getReaction() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
            return localStorage.getItem('@lkd_react');
        }
    });
}

async function run(func) {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func
    });
}