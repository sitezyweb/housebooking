// ---- Nav & scroll ----
function goTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({behavior:'smooth'});
  document.getElementById('mobile-menu').classList.remove('open');
}
const header = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 50);
});
document.getElementById('menu-toggle').addEventListener('click', () => {
  document.getElementById('mobile-menu').classList.toggle('open');
});

// ---- Hero Slideshow with blur ----
const slides = document.querySelectorAll('.hero-slide');
const dots = document.querySelectorAll('.hero-dot');
let current = 0;
let slideTimer;

function goSlide(idx) {
  // Remove active from current
  slides[current].classList.remove('active');
  slides[current].classList.add('leaving');
  dots[current].classList.remove('active');
  
  // After transition remove leaving
  const prev = current;
  setTimeout(() => { slides[prev].classList.remove('leaving'); }, 1400);
  
  current = idx;
  slides[current].classList.add('active');
  dots[current].classList.add('active');
  
  clearInterval(slideTimer);
  slideTimer = setInterval(() => goSlide((current + 1) % slides.length), 6000);
}

slideTimer = setInterval(() => goSlide((current + 1) % slides.length), 6000);

// ---- Reels: auto-scroll + pause on hover + drag + prev/next ----
const track = document.getElementById('reelsTrack');
const REEL_COUNT = 10; // original count
let autoScrollPos = 0;
let autoScrollRAF;
let isPaused = false;
let isDragging = false;
let dragStartX = 0;
let dragStartScroll = 0;

function getReelWidth() {
  const card = track.querySelector('.reel-card');
  if (!card) return 260;
  const gap = 20;
  return card.offsetWidth + gap;
}

function autoScroll() {
  if (!isPaused && !isDragging) {
    autoScrollPos += 0.6;
    const loopWidth = REEL_COUNT * getReelWidth();
    if (autoScrollPos >= loopWidth) autoScrollPos -= loopWidth;
    track.style.transform = `translateX(-${autoScrollPos}px)`;
  }
  autoScrollRAF = requestAnimationFrame(autoScroll);
}
autoScrollRAF = requestAnimationFrame(autoScroll);

// Pause on hover
track.addEventListener('mouseenter', () => { isPaused = true; track.style.cursor = 'grab'; });
track.addEventListener('mouseleave', () => { isPaused = false; track.style.cursor = ''; });

// Drag to scroll
track.addEventListener('mousedown', (e) => {
  isDragging = true;
  dragStartX = e.clientX;
  dragStartScroll = autoScrollPos;
  track.classList.add('dragging');
  e.preventDefault();
});
window.addEventListener('mousemove', (e) => {
  if (!isDragging) return;
  const diff = dragStartX - e.clientX;
  autoScrollPos = dragStartScroll + diff;
  const loopWidth = REEL_COUNT * getReelWidth();
  if (autoScrollPos < 0) autoScrollPos += loopWidth;
  if (autoScrollPos >= loopWidth) autoScrollPos -= loopWidth;
  track.style.transform = `translateX(-${autoScrollPos}px)`;
});
window.addEventListener('mouseup', () => {
  if (isDragging) {
    isDragging = false;
    track.classList.remove('dragging');
    isPaused = false;
  }
});

// Touch support
track.addEventListener('touchstart', (e) => {
  dragStartX = e.touches[0].clientX;
  dragStartScroll = autoScrollPos;
  isPaused = true;
}, {passive:true});
track.addEventListener('touchmove', (e) => {
  const diff = dragStartX - e.touches[0].clientX;
  autoScrollPos = dragStartScroll + diff;
  const loopWidth = REEL_COUNT * getReelWidth();
  if (autoScrollPos < 0) autoScrollPos += loopWidth;
  if (autoScrollPos >= loopWidth) autoScrollPos -= loopWidth;
  track.style.transform = `translateX(-${autoScrollPos}px)`;
}, {passive:true});
track.addEventListener('touchend', () => { isPaused = false; });

// Prev / Next buttons
document.getElementById('reelPrev').addEventListener('click', () => {
  autoScrollPos -= getReelWidth() * 2;
  const loopWidth = REEL_COUNT * getReelWidth();
  if (autoScrollPos < 0) autoScrollPos += loopWidth;
  track.style.transform = `translateX(-${autoScrollPos}px)`;
});
document.getElementById('reelNext').addEventListener('click', () => {
  autoScrollPos += getReelWidth() * 2;
  const loopWidth = REEL_COUNT * getReelWidth();
  if (autoScrollPos >= loopWidth) autoScrollPos -= loopWidth;
  track.style.transform = `translateX(-${autoScrollPos}px)`;
});

// ---- Scroll animations ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, {threshold: 0.1});
document.querySelectorAll('.fade-up,.fade-left,.fade-right').forEach(el => observer.observe(el));

// ---- Form ----
function handleFormSubmit(e) {
  e.preventDefault();
  alert('Thank you for reaching out! We will get back to you soon.');
}

// ---- Gallery: expand / collapse + reuse main gallery images in "more" grid ----
(function initGalleryExpand() {
  const toggle = document.getElementById('galleryToggle');
  const more = document.getElementById('galleryMore');
  if (!toggle || !more) return;

  const fallbacks = [
    'https://picsum.photos/id/1015/800/600',
    'https://picsum.photos/id/1018/800/600',
    'https://picsum.photos/id/1043/800/600',
    'https://picsum.photos/id/1067/800/600',
    'https://picsum.photos/id/1080/800/600',
    'https://picsum.photos/id/1121/800/600'
  ];

  const sources = Array.from(document.querySelectorAll('#gallery .gallery-grid > .gallery-item > img'))
    .map((img) => img.getAttribute('src'))
    .filter((s) => s && s.length > 0);

  const moreLinks = more.querySelectorAll('.gallery-more-item');
  moreLinks.forEach((link, i) => {
    const img = link.querySelector('img');
    if (!img) return;
    img.src = sources.length ? sources[i % sources.length] : fallbacks[i % fallbacks.length];
    img.alt = sources.length ? `The Veranta — gallery photo ${(i % sources.length) + 1}` : img.alt;
    link.addEventListener('click', (e) => e.preventDefault());
  });

  function setMoreFocusable(open) {
    moreLinks.forEach((link) => {
      link.setAttribute('tabindex', open ? '0' : '-1');
      link.setAttribute('aria-hidden', open ? 'false' : 'true');
    });
  }

  toggle.addEventListener('click', () => {
    const open = more.hasAttribute('hidden');
    if (open) {
      more.removeAttribute('hidden');
      toggle.setAttribute('aria-expanded', 'true');
      toggle.textContent = 'Show fewer photos';
      setMoreFocusable(true);
    } else {
      more.setAttribute('hidden', '');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.textContent = 'View all photos';
      setMoreFocusable(false);
    }
  });
})();