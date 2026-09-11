document.addEventListener('DOMContentLoaded', () => {
    const openBtn = document.getElementById('btn-open-his');
    if (openBtn) {
        openBtn.addEventListener('click', () => {
            chrome.tabs.create({ url: 'https://v20.ytecoso.vn/' });
        });
    }
});
