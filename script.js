const header = document.querySelector('.site-header');
const preloader = document.querySelector('#preloader');
const preloaderProgress = document.querySelector('#preloader-progress');

const initPreloader = () => {
  if (!preloader) return;
  const images = document.querySelectorAll('img, video, source');
  let loaded = 0;
  const total = images.length || 1;
  const updateProgress = () => {
    loaded = Math.min(loaded + 1, total);
    if (preloaderProgress) preloaderProgress.style.width = `${(loaded / total) * 100}%`;
  };
  if (images.length === 0) {
    preloader.classList.add('is-done');
    return;
  }
  images.forEach((media) => {
    if (media.complete) {
      updateProgress();
    } else {
      media.addEventListener('load', updateProgress, { once: true });
      media.addEventListener('error', updateProgress, { once: true });
    }
  });
  window.addEventListener('load', () => {
    setTimeout(() => {
      if (preloaderProgress) preloaderProgress.style.width = '100%';
      preloader.classList.add('is-done');
    }, 500);
  });
};
initPreloader();

const year = document.querySelector('#year');
const lightbox = document.querySelector('#lightbox');
const lightboxTitle = document.querySelector('#lightbox-title');
const lightboxMedia = document.querySelector('#lightbox-media');
const lightboxPanel = document.querySelector('.lightbox-panel');
const lightboxClose = document.querySelector('.lightbox-close');
const lightboxBackButton = document.querySelector('.lightbox-back-button');
const lightboxPrevious = document.querySelector('#lightbox-previous');
const lightboxNext = document.querySelector('#lightbox-next');
const albumItems = document.querySelectorAll('.album-item');
let currentGallery = [];
let currentGalleryTitle = '';
let currentGalleryIndex = 0;
let currentGalleryKind = 'image';
let currentBrandGroup = null;
let lastFocusedEl = null;
const brandColors = {
  Carina: '#c93d62',
  Fjallbris: '#49302e',
  Kneeware: '#527253',
  Svana: '#f2e8d2'
};

const fallbackMetaAdsGroups = [
  {
    name: 'Carina', folder: 'assets/Meta%20Ads/Carina/', logo: 'assets/Meta%20Ads/Carina/Carina%20logo.png',
    images: ['assets/Meta%20Ads/Carina/%2301%20FB%20Creative%20Discovery%20granddaughter-always-with-you.jpg', 'assets/Meta%20Ads/Carina/08-to-my-best-friend-thanks-fr.png', 'assets/Meta%20Ads/Carina/24-granddaughter-love-you-forever-jasper-heart-bracelet.jpg', 'assets/Meta%20Ads/Carina/50-granddaughter-always-with-you.jpg', 'assets/Meta%20Ads/Carina/%23156%20wife-to-husband-personalized-circle-wings-ring%E2%AD%90.jpg', 'assets/Meta%20Ads/Carina/%23230%20Creative%20Discovery%20to-my-best-friend-thanks-fr.jpg']
  },
  {
    name: 'Fjallbris', folder: 'assets/Meta%20Ads/Fjallbris/', logo: 'assets/Meta%20Ads/Fjallbris/Fjalbris%20LOGO.png',
    images: ['assets/Meta%20Ads/Fjallbris/%231.1%20no_4%20it_86c330w5r%20cu_86c246ga7.png', 'assets/Meta%20Ads/Fjallbris/%2360.1%20no_1%20it_86c1fddmr%20cu_86c01rgra.png', 'assets/Meta%20Ads/Fjallbris/%23101.1%20no_3%20it_86c3dfa0v%20cu_86c01rgd5.jpg', 'assets/Meta%20Ads/Fjallbris/%23219.1%20no_1%20it_86c657n46%20cu_86c01rgra.jpg', 'assets/Meta%20Ads/Fjallbris/%23323.1%20no_3%20it_86c8eym0k%20cu_86c01rgd5.jpg', 'assets/Meta%20Ads/Fjallbris/%23473.1%20no_1%20it_86c9j2hr9%20cu_86c01rgd5.jpeg']
  },
  {
    name: 'Kneeware', folder: 'assets/Meta%20Ads/Kneeware/', logo: 'assets/Meta%20Ads/Kneeware/kneeware-vertical-logo-green.png',
    images: ['assets/Meta%20Ads/Kneeware/%2306%20FB%20Creative%20for%20%5B3d-knee-compression-pad%5D.jpg', 'assets/Meta%20Ads/Kneeware/%23106%20FB%20Creative%20for%20%5B3d-knee-compression-pad%5D.jpg', 'assets/Meta%20Ads/Kneeware/%23144.2%20FB%20Creative%20powerknee-joint-support.jpg', 'assets/Meta%20Ads/Kneeware/%23166.1%20Creative%20Discovery%20dual-knee-brace.png', 'assets/Meta%20Ads/Kneeware/06-3d-knee-compression-pad.png', 'assets/Meta%20Ads/Kneeware/20-dual-knee-brace.png']
  },
  {
    name: 'Svana', folder: 'assets/Meta%20Ads/Svana/', logo: 'assets/Meta%20Ads/Svana/svana-logo-white.png',
    images: ['assets/Meta%20Ads/Svana/%23105.1%20Creative%20Discovery%20granddaughter-proud-of-you-bracelet-fr.jpg', 'assets/Meta%20Ads/Svana/%23110%20FB%20Creative%20Discovery%20mother-son-forever-linked-together-bracelet-es.jpg', 'assets/Meta%20Ads/Svana/%23155%20Creative%20Discovery%20sunflower-fidget-ring-es.jpg', 'assets/Meta%20Ads/Svana/%23221%20Creative%20Discovery%20daughter-love-you-engraved-heart-necklace-pl.jpg', 'assets/Meta%20Ads/Svana/31-son-love-you-forever-nautical-bracelet%20creative%20bank.jpg', 'assets/Meta%20Ads/Svana/son-pray-through-it-bracelet%201.png']
  }
];

const metaAdsGroups = window.metaAdsGroups || fallbackMetaAdsGroups;

async function loadAllMetaAds() {
  await Promise.all(metaAdsGroups.map(async (group) => {
    try {
      const response = await fetch(group.folder);
      if (!response.ok) return;
      const directory = await response.text();
      const documentFragment = new DOMParser().parseFromString(directory, 'text/html');
      const imageLinks = [...documentFragment.querySelectorAll('a[href]')]
        .map((link) => new URL(link.getAttribute('href'), new URL(group.folder, window.location.href)).href)
        .filter((src) => /\.(avif|gif|jpe?g|png|webp)$/i.test(src) && !/logo/i.test(src));
      if (imageLinks.length > 0) group.images = imageLinks;
    } catch (error) {
      // Direct file URLs do not expose directory listings; keep the fallback images.
    }
  }));
}

const ugcCover = document.querySelector('.album-art--ugc');
const ugcCard = ugcCover?.closest('.album-item');
const metaCover = document.querySelector('.album-art--meta');
const metaCard = metaCover?.closest('.album-item');
const motionCover = document.querySelector('.album-art--video');
const productCover = document.querySelector('.album-art--product');
const productCard = productCover?.closest('.album-item');
const motionGifs = [
  'assets/Video%20Ads/2.gif',
  'assets/Video%20Ads/3%20(2).gif',
  'assets/Video%20Ads/3.gif',
  'assets/Video%20Ads/4.gif',
  'assets/Video%20Ads/Sequence%2001_1.gif',
  'assets/Video%20Ads/Sequence%2001_2.gif'
];
const productEditGroups = [
  { name: 'Air Mattress', folder: 'assets/Product%20Edit/Air%20Mattress/' },
  { name: 'Camping LED Lamp', folder: 'assets/Product%20Edit/Camping%20Led%20Lamp/' },
  { name: 'Camping Table', folder: 'assets/Product%20Edit/Camping%20Table/' },
  { name: 'High Back Chair', folder: 'assets/Product%20Edit/High%20Back%20Chair/' },
  { name: 'I Love You Engraved Heart Necklace', folder: 'assets/Product%20Edit/I%20Love%20You%20Engraved%20Heart%20Necklace/' },
  { name: 'Inflatable Mattress', folder: 'assets/Product%20Edit/Inflatable%20Mattrress/' },
  { name: 'Mini Camping Chair', folder: 'assets/Product%20Edit/Mini%20Camping%20Chair/' },
  { name: 'To My Son Love You Forever Cross Bracelet', folder: 'assets/Product%20Edit/To%20My%20Son%20Love%20You%20Forever%20Cross%20Bracelet/' }
];

function naturalMediaSort(first, second) {
  return decodeURIComponent(first).localeCompare(decodeURIComponent(second), undefined, { numeric: true, sensitivity: 'base' });
}

async function loadProductEditGroups() {
  await Promise.all(productEditGroups.map(async (group) => {
    try {
      const response = await fetch(group.folder);
      if (!response.ok) return;
      const directory = await response.text();
      const parsed = new DOMParser().parseFromString(directory, 'text/html');
      group.images = [...parsed.querySelectorAll('a[href]')]
        .map((link) => new URL(link.getAttribute('href'), new URL(group.folder, window.location.href)).href)
        .filter((src) => /\.(avif|gif|jpe?g|mp4|png|webp)$/i.test(src))
        .sort(naturalMediaSort);
    } catch (error) {
      group.images = [];
    }
  }));
}

function startRandomSlideshow(cover, images, overlay) {
  if (!cover || images.length === 0) return;
  let currentIndex = 0;

  const showImage = () => {
    let nextIndex = currentIndex;
    while (images.length > 1 && nextIndex === currentIndex) {
      nextIndex = Math.floor(Math.random() * images.length);
    }
    currentIndex = nextIndex;
    cover.style.opacity = '0';
    window.setTimeout(() => {
      cover.style.backgroundImage = `${overlay}, url("${images[currentIndex]}")`;
      cover.style.opacity = '1';
    }, 180);
  };

  cover.style.backgroundImage = `${overlay}, url("${images[0]}")`;
  window.setInterval(showImage, 3000);
}

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

loadAllMetaAds().then(() => {
  if (metaCover && metaCard) {
    startRandomSlideshow(
      metaCover,
      metaAdsGroups.flatMap((group) => group.images),
      'linear-gradient(135deg, rgba(10, 10, 10, 0.58), rgba(10, 10, 10, 0.18) 42%, rgba(10, 10, 10, 0.52))'
    );
  }
});
loadProductEditGroups().then(() => {
  if (productCover && productCard) {
    const productImages = productEditGroups.flatMap((group) => group.images || []);
    startRandomSlideshow(
      productCover,
      productImages,
      'linear-gradient(135deg, rgba(10, 10, 10, 0.58), rgba(10, 10, 10, 0.18) 42%, rgba(10, 10, 10, 0.52))'
    );
  }
});

if (motionCover) {
  startRandomSlideshow(
    motionCover,
    motionGifs,
    'linear-gradient(135deg, rgba(10, 10, 10, 0.58), rgba(10, 10, 10, 0.18) 42%, rgba(10, 10, 10, 0.52))'
  );
}

year.textContent = new Date().getFullYear();

window.addEventListener('scroll', () => {
  header.classList.toggle('is-scrolled', window.scrollY > 24);
}, { passive: true });

function renderGalleryGrid(title, gallery) {
  currentGalleryKind = 'image';
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
        lightboxMedia.replaceChildren(fullImage, lightboxPrevious, lightboxNext);
        lightboxMedia.classList.remove('is-fading');
      }, 140);
    });

    imageButton.appendChild(image);
    galleryGrid.appendChild(imageButton);
  });

  lightboxMedia.classList.remove('is-fading');
  lightboxMedia.classList.add('is-gallery');
  lightboxPanel.classList.remove('is-image-view');
  lightboxMedia.replaceChildren(galleryGrid, lightboxPrevious, lightboxNext);
}

function renderVideoGallery(title, gallery) {
  currentGalleryKind = 'video';
  const galleryGrid = document.createElement('div');
  galleryGrid.className = 'lightbox-gallery lightbox-gallery--video';

  gallery.forEach((mediaSrc, index) => {
    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.className = 'lightbox-gallery-item';
    mediaButton.setAttribute('aria-label', `Play video ${index + 1}`);

    const isGif = /\.gif$/i.test(mediaSrc);
    const preview = document.createElement(isGif ? 'img' : 'span');
    preview.className = isGif ? '' : 'video-gallery-placeholder';
    if (isGif) {
      preview.src = mediaSrc;
      preview.alt = `${title} video ${index + 1}`;
      preview.loading = 'lazy';
    } else {
      preview.textContent = `Play video ${index + 1}`;
    }

    mediaButton.addEventListener('click', () => {
      const fullMedia = document.createElement(isGif ? 'img' : 'video');
      fullMedia.src = mediaSrc;
      fullMedia.alt = `${title} video ${index + 1}`;
      fullMedia.className = 'lightbox-full-image';
      if (!isGif) {
        fullMedia.controls = true;
        fullMedia.autoplay = true;
        fullMedia.playsInline = true;
        fullMedia.preload = 'auto';
        fullMedia.addEventListener('error', () => {
          lightboxMedia.replaceChildren(Object.assign(document.createElement('div'), {
            className: 'lightbox-missing',
            textContent: 'This video could not be decoded by the browser. Try opening the portfolio with Live Server.'
          }), lightboxPrevious, lightboxNext);
        }, { once: true });
        fullMedia.load();
      }
      lightboxMedia.classList.add('is-fading');
      lightboxPanel.classList.add('is-image-view');
      currentGalleryIndex = index;
      window.setTimeout(() => {
        lightboxMedia.replaceChildren(fullMedia, lightboxPrevious, lightboxNext);
        lightboxMedia.classList.remove('is-fading');
      }, 140);
    });

    mediaButton.appendChild(preview);
    galleryGrid.appendChild(mediaButton);
  });

  lightboxMedia.classList.remove('is-fading');
  lightboxMedia.classList.add('is-gallery');
  lightboxPanel.classList.remove('is-image-view');
  lightboxMedia.replaceChildren(galleryGrid, lightboxPrevious, lightboxNext);
}

function renderProductGallery(title, gallery) {
  currentGalleryKind = 'product';
  const galleryGrid = document.createElement('div');
  galleryGrid.className = 'lightbox-gallery lightbox-gallery--product';

  gallery.forEach((mediaSrc, index) => {
    const mediaButton = document.createElement('button');
    mediaButton.type = 'button';
    mediaButton.className = 'lightbox-gallery-item';
    mediaButton.setAttribute('aria-label', `Open project image ${index + 1}`);
    const isVideo = /\.mp4$/i.test(mediaSrc);
    const preview = document.createElement(isVideo ? 'video' : 'img');
    preview.src = mediaSrc;
    preview.alt = `${title} project ${index + 1}`;
    preview.loading = 'lazy';
    if (isVideo) {
      preview.muted = true;
      preview.loop = true;
      preview.playsInline = true;
      preview.preload = 'metadata';
    }
    mediaButton.addEventListener('click', () => {
      const fullMedia = document.createElement(isVideo ? 'video' : 'img');
      fullMedia.src = mediaSrc;
      fullMedia.alt = `${title} project ${index + 1}`;
      fullMedia.className = 'lightbox-full-image';
      if (isVideo) {
        fullMedia.controls = true;
        fullMedia.autoplay = true;
        fullMedia.playsInline = true;
      }
      currentGalleryIndex = index;
      lightboxMedia.classList.add('is-fading');
      lightboxPanel.classList.add('is-image-view');
      window.setTimeout(() => {
        lightboxMedia.replaceChildren(fullMedia, lightboxPrevious, lightboxNext);
        lightboxMedia.classList.remove('is-fading');
      }, 140);
    });
    mediaButton.appendChild(preview);
    galleryGrid.appendChild(mediaButton);
  });
  lightboxMedia.classList.remove('is-fading');
  lightboxMedia.classList.add('is-gallery');
  lightboxPanel.classList.remove('is-image-view');
  lightboxMedia.replaceChildren(galleryGrid, lightboxPrevious, lightboxNext);
}

function renderProductGroups() {
  const groupsGrid = document.createElement('div');
  groupsGrid.className = 'lightbox-meta-groups lightbox-product-groups';
  productEditGroups.forEach((group) => {
    const groupButton = document.createElement('button');
    groupButton.type = 'button';
    groupButton.className = 'lightbox-brand lightbox-product-group';
    groupButton.setAttribute('aria-label', `Open ${group.name} product edits`);
    if (group.images?.[0]) {
      groupButton.style.backgroundImage = `linear-gradient(rgba(20, 20, 20, .35), rgba(20, 20, 20, .35)), url("${group.images[0]}")`;
    }
    const label = document.createElement('strong');
    label.textContent = group.name;
    groupButton.append(label);
    groupButton.addEventListener('click', () => {
      const openGroup = () => {
        currentGallery = group.images || [];
        currentGalleryTitle = group.name;
        currentBrandGroup = group;
        lightboxTitle.textContent = currentGalleryTitle;
        lightboxClose.hidden = true;
        lightboxBackButton.hidden = false;
        renderProductGallery(currentGalleryTitle, currentGallery);
      };
      if (group.images?.length) {
        openGroup();
      } else {
        loadProductEditGroups().then(openGroup);
      }
    });
    groupsGrid.appendChild(groupButton);
  });
  lightboxMedia.classList.remove('is-fading', 'is-gallery');
  lightboxPanel.classList.remove('is-image-view');
  lightboxMedia.replaceChildren(groupsGrid);
  lightboxClose.hidden = false;
  lightboxBackButton.hidden = true;
}

function renderMetaGroups() {
  const groupsGrid = document.createElement('div');
  groupsGrid.className = 'lightbox-meta-groups';

  metaAdsGroups.forEach((group) => {
    const groupButton = document.createElement('button');
    groupButton.type = 'button';
    groupButton.className = 'lightbox-brand';
    if (group.name === 'Svana') groupButton.classList.add('lightbox-brand--svana');
    groupButton.style.setProperty('--brand-color', brandColors[group.name]);
    groupButton.setAttribute('aria-label', `Open ${group.name} ads`);

    const logo = document.createElement('img');
    logo.src = group.logo;
    logo.alt = `${group.name} logo`;
    groupButton.append(logo);
    groupButton.addEventListener('click', () => {
      currentBrandGroup = group;
      currentGallery = group.images;
      currentGalleryTitle = `${group.name} Meta Ads`;
      currentGalleryIndex = 0;
      lightboxTitle.textContent = currentGalleryTitle;
      lightboxClose.hidden = true;
      lightboxBackButton.hidden = false;
      renderGalleryGrid(currentGalleryTitle, currentGallery);
    });
    groupsGrid.appendChild(groupButton);
  });

  lightboxMedia.classList.remove('is-fading', 'is-gallery');
  lightboxPanel.classList.remove('is-image-view');
  lightboxMedia.replaceChildren(groupsGrid);
  lightboxClose.hidden = false;
  lightboxBackButton.hidden = true;
}

function showGalleryImage(index) {
  if (currentGallery.length === 0) return;

  currentGalleryIndex = (index + currentGallery.length) % currentGallery.length;
  const mediaSrc = currentGallery[currentGalleryIndex];
  const isVideo = (currentGalleryKind === 'video' && !/\.gif$/i.test(mediaSrc)) || (currentGalleryKind === 'product' && /\.mp4$/i.test(mediaSrc));
  const fullImage = document.createElement(isVideo ? 'video' : 'img');
  fullImage.src = mediaSrc;
  fullImage.alt = `${currentGalleryTitle} creative ${currentGalleryIndex + 1}`;
  fullImage.className = 'lightbox-full-image';
  if (isVideo) {
    fullImage.controls = true;
    fullImage.autoplay = true;
    fullImage.playsInline = true;
    fullImage.preload = 'auto';
    fullImage.addEventListener('error', () => {
      lightboxMedia.replaceChildren(Object.assign(document.createElement('div'), {
        className: 'lightbox-missing',
        textContent: 'This video could not be decoded by the browser. Try opening the portfolio with Live Server.'
      }), lightboxPrevious, lightboxNext);
    }, { once: true });
    fullImage.load();
  }
  lightboxMedia.classList.add('is-fading');
  window.setTimeout(() => {
    lightboxMedia.replaceChildren(fullImage, lightboxPrevious, lightboxNext);
    lightboxMedia.classList.remove('is-fading');
  }, 140);
}

function closeLightbox() {
  if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  lightbox.classList.remove('is-open');
  lightbox.setAttribute('aria-hidden', 'true');
  lightboxMedia.replaceChildren();
  lightboxMedia.classList.remove('is-gallery', 'is-fading');
  lightboxPanel.classList.remove('is-image-view');
  currentGalleryIndex = 0;
  currentGalleryKind = 'image';
  currentBrandGroup = null;
  lightboxClose.hidden = false;
  lightboxBackButton.hidden = true;
  document.body.style.overflow = '';
  if (lastFocusedEl) lastFocusedEl.focus();
}

function showBrandGroups() {
  lightboxTitle.textContent = 'Meta Ads by Brand';
  currentGallery = [];
  currentGalleryTitle = '';
  currentGalleryIndex = 0;
  renderMetaGroups();
}

function showProductGroups() {
  lightboxTitle.textContent = 'Product Edit Gallery';
  currentGallery = [];
  currentGalleryTitle = '';
  currentGalleryIndex = 0;
  renderProductGroups();
}

albumItems.forEach((item) => {
  item.addEventListener('click', () => {
    const title = item.dataset.title;
    const source = item.dataset.src;
    const gallery = item.dataset.gallery ? JSON.parse(item.dataset.gallery) : [];

    lightboxTitle.textContent = title;
    lastFocusedEl = item;
    currentGallery = gallery;
    currentGalleryTitle = title;
    currentGalleryIndex = 0;
    currentBrandGroup = null;
    lightboxClose.hidden = false;
    lightboxBackButton.hidden = true;

    if (item.dataset.type === 'meta') {
      renderMetaGroups();
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }

    if (item.dataset.type === 'video-gallery') {
      renderVideoGallery(title, gallery);
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }

    if (item.dataset.type === 'product-gallery') {
      currentBrandGroup = null;
      renderProductGroups();
      lightboxTitle.textContent = title;
      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      return;
    }

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
      const placeholder = document.createElement('div');
      placeholder.className = 'lightbox-missing';
      placeholder.append(
        document.createTextNode('Add your sample at '),
        Object.assign(document.createElement('strong'), { textContent: source }),
        document.createTextNode(' to preview it here.')
      );
      lightboxMedia.replaceChildren(placeholder);
    }, { once: true });
    lightboxMedia.replaceChildren(media);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  });
});

lightbox.addEventListener('click', (event) => {
  if (event.target === lightbox || event.target.closest('.lightbox-backdrop')) {
    closeLightbox();
  }
});

lightboxPanel.addEventListener('click', (event) => {
  if (event.target.closest('.lightbox-gallery-item')) return;
  if (!lightboxMedia.querySelector('.lightbox-full-image')) return;
  if (event.target.closest('.lightbox-full-image')) return;
  if (event.target.closest('.lightbox-nav')) return;
  if (!event.target.closest('.lightbox-close')) {
    lightboxMedia.classList.add('is-fading');
    window.setTimeout(() => {
      if (currentGalleryKind === 'video') {
        renderVideoGallery(currentGalleryTitle, currentGallery);
      } else if (currentGalleryKind === 'product') {
        renderProductGallery(currentGalleryTitle, currentGallery);
      } else {
        renderGalleryGrid(currentGalleryTitle, currentGallery);
      }
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

function handleLightboxClose() {
  if (currentBrandGroup && productEditGroups.includes(currentBrandGroup)) {
    showProductGroups();
    return;
  }
  if (currentBrandGroup) {
    showBrandGroups();
    return;
  }
  if (lightboxMedia.querySelector('.lightbox-full-image')) {
    lightboxMedia.classList.add('is-fading');
    window.setTimeout(() => {
      if (currentGalleryKind === 'video') {
        renderVideoGallery(currentGalleryTitle, currentGallery);
      } else if (currentGalleryKind === 'product') {
        renderProductGallery(currentGalleryTitle, currentGallery);
      } else {
        renderGalleryGrid(currentGalleryTitle, currentGallery);
      }
      lightboxMedia.classList.remove('is-fading');
    }, 160);
    return;
  }

  closeLightbox();
}

lightboxClose.addEventListener('click', (event) => {
  event.stopPropagation();
  handleLightboxClose();
});

lightboxBackButton.addEventListener('click', (event) => {
  event.stopPropagation();
  if (currentBrandGroup && productEditGroups.includes(currentBrandGroup)) {
    showProductGroups();
  } else {
    showBrandGroups();
  }
});

document.querySelectorAll('.lightbox-backdrop').forEach((element) => {
  element.addEventListener('click', closeLightbox);
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && lightbox.classList.contains('is-open')) closeLightbox();
  if (event.key === 'ArrowLeft' && lightbox.classList.contains('is-open') && lightboxMedia.querySelector('.lightbox-full-image')) showGalleryImage(currentGalleryIndex - 1);
  if (event.key === 'ArrowRight' && lightbox.classList.contains('is-open') && lightboxMedia.querySelector('.lightbox-full-image')) showGalleryImage(currentGalleryIndex + 1);
});

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal, .reveal-group').forEach((el) => revealObserver.observe(el));
}

const countObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      const strong = entry.target.querySelector('strong[data-count]');
      if (!strong) return;
      const target = parseFloat(strong.dataset.count);
      const isDecimal = target % 1 !== 0;
      const duration = 1800;
      const startTime = performance.now();
      const step = (now) => {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const value = target * (0.3 + 0.7 * (1 - Math.cos(Math.PI * progress)) / 2);
        strong.textContent = isDecimal ? value.toFixed(2) : Math.floor(value).toString();
        if (progress < 1) window.requestAnimationFrame(step);
      };
      window.requestAnimationFrame(step);
      countObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.6 });
document.querySelectorAll('.proof-grid > div').forEach((el) => countObserver.observe(el));

if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches && window.matchMedia('(hover: hover)').matches) {
  const tiltItems = document.querySelectorAll('.album-item');
  tiltItems.forEach((item) => {
    let rect = item.getBoundingClientRect();
    const onMouseMove = (e) => {
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rx = ((x - rect.width / 2) / (rect.width / 2)) * 8;
      const ry = ((rect.height / 2 - y) / (rect.height / 2)) * 8;
      item.style.transform = `rotateY(${rx}deg) rotateX(${ry}deg) scale(1.02)`;
    };
    const onEnter = (e) => {
      rect = item.getBoundingClientRect();
      item.style.transition = 'transform 0.1s ease-out';
      onMouseMove(e);
    };
    const onLeave = () => {
      item.style.transition = 'transform 0.3s ease-out';
      item.style.transform = '';
    };
    item.addEventListener('mouseenter', onEnter);
    item.addEventListener('mousemove', onMouseMove);
    item.addEventListener('mouseleave', onLeave);
  });
}
