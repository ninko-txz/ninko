'use strict';

const modal = document.querySelector('.modal');
const modalImage = document.querySelector('.modal-img');
const modalDate = document.querySelector('.modal-date');
const modalTitle = document.querySelector('.modal-title');
const modalDim = document.querySelector('.modal-dim');
const modalApp = document.querySelector('.modal-app');
const modalCat = document.querySelector('.modal-cat');

modal.addEventListener('touchmove', (ev) => {
    ev.preventDefault();
});

modal.addEventListener('wheel', (ev) => {
    ev.preventDefault();
});

modal.addEventListener('click', () => {
    modal.classList.add('hidden');
});

(async () => {
    const res = await fetch('/gallery/artworks.json');
    const artworks = await res.json();

    document.querySelectorAll('.artwork').forEach((art) => {
        art.addEventListener('click', function () {
            const art = artworks.at(this.id);

            modalImage.src = this.src;
            modalDate.textContent = art.date;
            modalTitle.textContent = art.title;
            modalDim.textContent = art.dimensions;
            modalApp.textContent = art.app;
            modalCat.textContent = art.category;

            modal.classList.remove('hidden');
        });
    });
})();
