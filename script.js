const header = document.querySelector('.site-header');
const year = document.querySelector('#year');
const lightbox = document.querySelector('#lightbox');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxMedia = document.querySelector('#lightbox-media');
const albumItems = document.querySelectorAll('.album-item');

year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxMedia.replaceChildren();
  document.body.style.overflow = '';
}

albumItems.forEach((item) => {
  item.addEventListener('click', () => {
    const title = item.dataset.title;
    const source = item.dataset.src;
    const media = item.dataset.type === 'video' ? document.createElement('video') : document.createElement('img');

    lightboxTitle.textContent = title;
    media.src = source;
    media.alt = title;
    if (item.dataset.type === 'video') {
      media.controls = true;
      media.autoplay = true;
      media.playsInline = true;
    }
    media.addEventListener('error', () => {
      lightboxMedia.innerHTML = `<div class="lightbox-missing">Add your sample at <strong>${source}</strong> to preview it here.</div>`;
    }, { once: true });
    lightboxMedia.replaceChildren(media);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
});

document.querySelectorAll('[data-close-lightbox]').forEach((element) => {
  element.addEventListener('click', closeLightbox);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
});
