const header = document.querySelector('.site-header');
const year = document.querySelector('#year');
const lightbox = document.querySelector('#lightbox');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxMedia = document.querySelector('#lightbox-media');
const lightboxPanel = document.querySelector('.lightbox-panel');
const lightboxPrevious = document.querySelector('#lightbox-previous');
const lightboxNext = document.querySelector('#lightbox-next');
const albumItems = document.querySelectorAll('.album-item');
let currentGallery = [];
let currentGalleryTitle = '';
let currentGalleryIndex = 0;

const ugcCover = document.querySelector('.album-art--ugc');
const ugcCard = ugcCover?.closest('.album-item');

if (ugcCover && ugcCard) {
  const ugcGallery = ugcCard.dataset.gallery ? JSON.parse(ugcCard.dataset.gallery) : [];

  if (ugcGallery.length > 0) {
    let currentIndex = 0;

    const showUGCImage = () => {
      let nextIndex = currentIndex;
      while (ugcGallery.length > 1 && nextIndex === currentIndex) {
        nextIndex = Math.floor(Math.random() * ugcGallery.length);
      }
      currentIndex = nextIndex;

      ugcCover.style.opacity = '0';
      window.setTimeout(() => {
        ugcCover.style.backgroundImage = `linear-gradient(rgba(231, 212, 201, 0.18), rgba(231, 212, 201, 0.18)), url("${ugcGallery[currentIndex]}")`;
        ugcCover.style.opacity = '1';
      }, 180);
    };

    ugcCover.style.backgroundImage = `linear-gradient(rgba(231, 212, 201, 0.18), rgba(231, 212, 201, 0.18)), url("${ugcGallery[0]}")`;
    window.setInterval(showUGCImage, 3000);
  }
}

year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

function renderGalleryGrid(title, gallery) {
  const galleryGrid = document.createElement('div');
  galleryGrid.className = 'lightbox-gallery';

  gallery.forEach((imageSrc, index) => {
    const imageButton = document.createElement('button');
    imageButton.type = 'button';
    imageButton.className = 'lightbox-gallery-item';
    imageButton.setAttribute('aria-label', `Open image ${index + 1}`);

    const image = document.createElement('img');
    image.src = imageSrc;
    image.alt = `${title} creative ${index + 1}`;
    image.loading = 'lazy';

    imageButton.addEventListener('click', () => {
      const fullImage = document.createElement('img');
      fullImage.src = imageSrc;
      fullImage.alt = `${title} creative ${index + 1}`;
      fullImage.className = 'lightbox-full-image';
      lightboxMedia.classList.remove('is-gallery');
      lightboxMedia.classList.add('is-fading');
      lightboxPanel.classList.add('is-image-view');
      currentGalleryIndex = index;
      window.setTimeout(() => {
        lightboxMedia.replaceChildren(fullImage);
        lightboxMedia.classList.remove('is-fading');
      }, 140);
    });

    imageButton.appendChild(image);
    galleryGrid.appendChild(imageButton);
  });

  lightboxMedia.classList.remove('is-fading');
  lightboxMedia.classList.add('is-gallery');
  lightboxMedia.replaceChildren(galleryGrid);
}

function showGalleryImage(index) {
  if (currentGallery.length === 0) return;

  currentGalleryIndex = (index + currentGallery.length) % currentGallery.length;
  const fullImage = document.createElement('img');
  fullImage.src = currentGallery[currentGalleryIndex];
  fullImage.alt = `${currentGalleryTitle} creative ${currentGalleryIndex + 1}`;
  fullImage.className = 'lightbox-full-image';
  lightboxMedia.classList.add('is-fading');
  window.setTimeout(() => {
    lightboxMedia.replaceChildren(fullImage);
    lightboxMedia.classList.remove('is-fading');
  }, 140);
}

function closeLightbox() {
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxMedia.replaceChildren();
  lightboxMedia.classList.remove('is-gallery', 'is-fading');
  lightboxPanel.classList.remove('is-image-view');
  currentGalleryIndex = 0;
  document.body.style.overflow = '';
}

albumItems.forEach((item) => {
  item.addEventListener('click', () => {
    const title = item.dataset.title;
    const source = item.dataset.src;
    const gallery = item.dataset.gallery ? JSON.parse(item.dataset.gallery) : [];

    lightboxTitle.textContent = title;

    currentGallery = gallery;
    currentGalleryTitle = title;
    currentGalleryIndex = 0;

    if (gallery.length > 1) {
      renderGalleryGrid(title, gallery);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }

    const media = item.dataset.type === 'video' ? document.createElement('video') : document.createElement('img');
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

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.closest('.lightbox-backdrop')) {
    closeLightbox();
  }
});

lightboxPanel.addEventListener('click', (event) => {
  if (!lightboxMedia.querySelector('.lightbox-full-image')) return;
  if (event.target.closest('.lightbox-full-image')) return;
  if (event.target.closest('.lightbox-nav')) return;
  if (!event.target.closest('.lightbox-close')) {
    lightboxMedia.classList.add('is-fading');
    window.setTimeout(() => {
      renderGalleryGrid(currentGalleryTitle, currentGallery);
      lightboxMedia.classList.remove('is-fading');
    }, 160);
  }
});

lightboxPrevious.addEventListener('click', (event) => {
  event.stopPropagation();
  showGalleryImage(currentGalleryIndex - 1);
});

lightboxNext.addEventListener('click', (event) => {
  event.stopPropagation();
  showGalleryImage(currentGalleryIndex + 1);
});

document.querySelectorAll('[data-close-lightbox]').forEach((element) => {
  element.addEventListener('click', closeLightbox);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  if (event.key === 'ArrowLeft' && lightbox.classList.contains('is-open') && lightboxMedia.querySelector('.lightbox-full-image')) showGalleryImage(currentGalleryIndex - 1);
  if (event.key === 'ArrowRight' && lightbox.classList.contains('is-open') && lightboxMedia.querySelector('.lightbox-full-image')) showGalleryImage(currentGalleryIndex + 1);
});
