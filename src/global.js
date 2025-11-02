'use strict';

document.querySelectorAll('img').forEach((img) => {
    img.addEventListener('contextmenu', (ev) => ev.preventDefault());
});
