document.addEventListener('DOMContentLoaded', () => {
  
  // 1. Loader Animation
  let count = 0;
  const counterVal = document.getElementById('loaderCounter');
  const fillVal = document.getElementById('loaderFill');
  const loader = document.getElementById('loader');
  
  const interval = setInterval(() => {
    count += Math.floor(Math.random() * 15) + 5;
    if (count >= 100) {
      count = 100;
      clearInterval(interval);
      setTimeout(() => {
        if(loader) {
           loader.style.opacity = '0';
           setTimeout(() => loader.style.display = 'none', 800);
        }
      }, 400);
    }
    if(counterVal) counterVal.innerText = String(count).padStart(3, '0');
    if(fillVal) fillVal.style.width = count + '%';
  }, 60);

  // 2. Initialize Lenis
  const lenis = new Lenis({
    lerp: 0.08,
    smoothWheel: true
  });
  
  function raf(time) {
    lenis.raf(time);
    requestAnimationFrame(raf);
  }
  requestAnimationFrame(raf);

  // 3. Slides & Navigation
  const slides = Array.from(document.querySelectorAll('.slide'));
  let currentSlideIndex = 0;

  const navDotsContainer = document.getElementById('navDots');
  if (navDotsContainer) {
    slides.forEach((slide, i) => {
      const dot = document.createElement('div');
      dot.className = 'nav-dot';
      if (i === 0) dot.classList.add('active');
      
      // Use standard CSS data attributes for hover tooltips instead of inner text elements!
      if (slide.dataset.section) dot.dataset.section = slide.dataset.section;
      dot.dataset.label = slide.dataset.label || `Project ${i - 6}`;
      
      dot.onclick = () => goToSlide(i);
      navDotsContainer.appendChild(dot);
    });
  }

  function updateNavDots(index) {
    if (!navDotsContainer) return;
    const dots = navDotsContainer.querySelectorAll('.nav-dot');
    dots.forEach((dot, i) => {
      if (i === index) dot.classList.add('active');
      else dot.classList.remove('active');
    });
  }

  // Observers for slide fade-in & active states
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.25
  };
  
  const observer = new IntersectionObserver((entries) => {
    let intersectingEntry = null;
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animate-in');
        if (!intersectingEntry || entry.intersectionRatio > intersectingEntry.intersectionRatio) {
           intersectingEntry = entry;
        }
      }
    });

    if (intersectingEntry) {
      const idx = slides.findIndex(s => s.id === intersectingEntry.target.id);
      if (idx !== -1) {
        currentSlideIndex = idx;
        updateNavDots(idx);
      }
    }
  }, observerOptions);

  slides.forEach(slide => observer.observe(slide));

  function goToSlide(index) {
    if (index >= 0 && index < slides.length) {
      currentSlideIndex = index;
      updateNavDots(index);
      lenis.scrollTo(slides[index], { duration: 1.2, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
    }
  }

  // Keyboard Hints
  const keyHint = document.getElementById('keyHint');
  let hintHidden = false;

  // 4. Parallax effect on scroll
  lenis.on('scroll', (e) => {
    slides.forEach(slide => {
      const rect = slide.getBoundingClientRect();
      const progress = (window.innerHeight - rect.top) / (window.innerHeight + rect.height);
      if (progress >= 0 && progress <= 1) {
        const bg = slide.querySelector('.slide-bg');
        if (bg) {
          bg.style.transform = `translateY(${(0.5 - progress) * 15}%)`;
        }
      }
    });
  });

  // 5. Overview Modal
  const overviewModal = document.createElement('div');
  overviewModal.className = 'overview';
  overviewModal.innerHTML = `
    <div class="overview-header">
      <div class="overview-title">Showcase Overview</div>
      <div class="overview-close" onclick="closeOverview()"><i data-lucide="x"></i></div>
    </div>
    <div class="overview-grid" id="overview-grid"></div>
  `;
  document.body.appendChild(overviewModal);
  
  let overviewBuilt = false;
  
  function buildOverview() {
    if (overviewBuilt) return;
    const grid = document.getElementById('overview-grid');
    slides.forEach((slide, i) => {
      const item = document.createElement('div');
      item.className = 'overview-item';
      
      const thumb = document.createElement('img');
      thumb.loading = 'lazy';
      
      const cinematicBg = slide.querySelector('.cinematic-bg');
      if (cinematicBg && cinematicBg.style.backgroundImage) {
        let bgUrl = cinematicBg.style.backgroundImage;
        bgUrl = bgUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        thumb.src = bgUrl;
      } else {
        thumb.src = `assets/thumbnails/thumb-${slide.id}.jpg`;
      }
      
      item.appendChild(thumb);
      
      const label = document.createElement('div');
      label.className = 'overview-item-label';
      label.textContent = slide.dataset.label || `Slide ${i + 1}`;
      item.appendChild(label);
      
      item.onclick = () => {
        closeOverview();
        goToSlide(i);
      };
      grid.appendChild(item);
    });
    overviewBuilt = true;
  }

  function toggleOverview() {
    if (!overviewModal.classList.contains('active')) {
      buildOverview();
      overviewModal.classList.add('active');
      lenis.stop();
      if (window.lucide) lucide.createIcons();
    } else {
      closeOverview();
    }
  }

  function closeOverview() {
    overviewModal.classList.remove('active');
    lenis.start();
  }

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => console.log(err));
    } else {
      if (document.exitFullscreen) document.exitFullscreen();
    }
  }

  // 6. Lightbox
  const lightboxOverlay = document.createElement('div');
  lightboxOverlay.className = 'lightbox';
  lightboxOverlay.innerHTML = `
    <div class="close-btn" onclick="closeLightbox()">✕</div>
    <img id="lightbox-img" src="" alt="Zoomed view">
  `;
  document.body.appendChild(lightboxOverlay);

  function openLightbox(url) {
    if (!url) return;
    document.getElementById('lightbox-img').src = url;
    lightboxOverlay.classList.add('active');
    lenis.stop();
  }

  function closeLightbox() {
    lightboxOverlay.classList.remove('active');
    lenis.start();
  }

  slides.forEach(slide => {
    slide.addEventListener('dblclick', (e) => {
      const cinBg = slide.querySelector('.cinematic-bg');
      if (cinBg && cinBg.style.backgroundImage) {
        let url = cinBg.style.backgroundImage;
        url = url.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        if (url) openLightbox(url);
      } else {
        const bgImg = slide.querySelector('.slide-bg img');
        if (bgImg) openLightbox(bgImg.src);
      }
    });
  });

  // 7. PDF Export
  function exportPDF() {
    lenis.stop();
    const pending = [];
    document.querySelectorAll('img[data-src]').forEach(img => {
      const p = new Promise(resolve => {
        img.onload = img.onerror = () => { img.classList.add('loaded'); resolve(); };
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      });
      pending.push(p);
    });
    
    document.querySelectorAll('.cinematic-bg').forEach(bg => {
      const bgImg = bg.style.backgroundImage;
      if (bgImg && bgImg !== 'none') {
        const url = bgImg.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        if (url) {
          const p = new Promise(resolve => {
            const temp = new Image();
            temp.onload = temp.onerror = resolve;
            temp.src = url;
          });
          pending.push(p);
        }
      }
    });
    
    // Fallback UI
    const hint = document.createElement('div');
    hint.style.cssText = 'position:fixed;top:40px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);backdrop-filter:blur(10px);color:#fff;padding:12px 24px;border-radius:6px;z-index:9999;font-size:14px;letter-spacing:1px;';
    hint.innerHTML = 'Preloading HD assets for PDF Generation...';
    document.body.appendChild(hint);
  
    Promise.all(pending).then(() => {
      setTimeout(() => {
        hint.remove();
        window.print();
        lenis.start(); 
      }, 500); 
    });
  }

  // 8. Keyboard Controls
  document.addEventListener('keydown', (e) => {
    if (!hintHidden && keyHint) {
      keyHint.style.opacity = '0';
      hintHidden = true;
      setTimeout(() => keyHint.style.display = 'none', 500);
    }

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') {
      e.preventDefault();
      goToSlide(Math.min(slides.length - 1, currentSlideIndex + 1));
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      goToSlide(Math.max(0, currentSlideIndex - 1));
    } else if (e.key === 'Escape') {
      if (overviewModal.classList.contains('active')) closeOverview();
      if (lightboxOverlay.classList.contains('active')) closeLightbox();
    } else if (e.key.toLowerCase() === 'o') {
      toggleOverview();
    } else if (e.key.toLowerCase() === 'f') {
      toggleFullscreen();
    } else if (e.key.toLowerCase() === 'p') {
      if (e.metaKey || e.ctrlKey) {
        e.preventDefault();
        exportPDF();
      } else {
        exportPDF();
      }
    }
  });

  // 9. Lazy loading cleanup (for slides intersecting viewport immediately)
  setTimeout(() => {
    document.querySelectorAll('img[data-src]').forEach(img => {
      const rect = img.getBoundingClientRect();
      if (rect.top < window.innerHeight * 1.5) {
        img.onload = () => img.classList.add('loaded');
        img.src = img.dataset.src;
        img.removeAttribute('data-src');
      }
    });
  }, 100);

  // Global expose
  window.toggleOverview = toggleOverview;
  window.closeOverview = closeOverview;
  window.toggleFullscreen = toggleFullscreen;
  window.exportPDF = exportPDF;
  window.closeLightbox = closeLightbox;
  
});
