'use strict';

if (location.origin == 'https://ninko.neocities.org') {
    const path = location.pathname.replaceAll('/', '');
    const page = path == '' ? 'index' : path;
    import(`https://ninko.pythonanywhere.com/${page}/neostat.js`);
}

document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('contextmenu', (ev) => ev.preventDefault());
});
