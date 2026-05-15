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

  document.querySelectorAll('.slide-bg img[src]:not([data-src])').forEach(img => {
    if (img.complete) {
      img.classList.add('loaded');
    } else {
      img.addEventListener('load', () => img.classList.add('loaded'), { once: true });
      img.addEventListener('error', () => img.classList.add('loaded'), { once: true });
    }
  });

  const projectWorks = Array.isArray(window.XPC_WORKS) ? window.XPC_WORKS : [];
  const projectGrid = document.getElementById('projectGrid');
  const libraryControls = document.getElementById('libraryControls');
  const libraryStats = document.getElementById('libraryStats');
  const projectSearch = document.getElementById('projectSearch');
  let activeProjectFilter = 'FEATURED';
  const featuredOrder = [
    'a12909862', 'a12617782', 'a11617501', 'a13602494', 'a13489029', 'a13489031',
    'a13489033', 'a13489035', 'a13541810', 'a13585807', 'a13158530', 'a13053665',
    'a13260747', 'a13254971', 'a13592607', 'a11012663', 'a10380338', 'a11302201',
    'a11294117', 'a10511239', 'a10547987', 'a13158734', 'a11792357', 'a12724215',
    'a11108246', 'a10527675', 'a10293528'
  ];
  const featuredRank = new Map(featuredOrder.map((id, index) => [id, index]));
  const categoryLabels = {
    'FEATURED': '精选',
    'TVC / BRAND': '广告 / 品牌',
    'INTERACTIVE': '互动 / H5',
    'MV / MUSIC': 'MV / 音乐',
    'STORY': '短片 / 剧情',
    'CAMPAIGN': '宣传 / Campaign'
  };
  const projectModal = document.createElement('div');
  projectModal.className = 'project-modal';
  projectModal.innerHTML = `
    <div class="project-modal-panel" role="dialog" aria-modal="true" aria-label="Project player">
      <button class="project-modal-close" type="button" aria-label="Close project"><i data-lucide="x"></i></button>
      <video class="project-modal-video" controls playsinline preload="metadata"></video>
      <div class="project-modal-meta">
        <div class="project-modal-category"></div>
        <h3 class="project-modal-title"></h3>
        <div class="project-modal-detail"></div>
        <a class="project-modal-link" target="_blank" rel="noreferrer">在新片场观看</a>
      </div>
    </div>
  `;
  document.body.appendChild(projectModal);

  function sortWorksForView(works, filter) {
    const sorted = [...works];
    if (filter === 'FEATURED') {
      return sorted.sort((a, b) => (featuredRank.get(a.id) ?? 999) - (featuredRank.get(b.id) ?? 999));
    }
    return sorted.sort((a, b) => b.order - a.order);
  }

  function renderProjectLibrary(filter = activeProjectFilter) {
    if (!projectGrid || !projectWorks.length) return;
    activeProjectFilter = filter;
    const query = projectSearch ? projectSearch.value.trim().toLowerCase() : '';

    const categories = ['FEATURED', ...Array.from(new Set(projectWorks.map(work => work.category)))];
    if (libraryControls && !libraryControls.dataset.ready) {
      categories.forEach(category => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = 'library-filter';
        button.dataset.filter = category;
        button.textContent = categoryLabels[category] || category;
        button.addEventListener('click', () => renderProjectLibrary(category));
        libraryControls.appendChild(button);
      });
      libraryControls.dataset.ready = 'true';
    }

    document.querySelectorAll('.library-filter').forEach(button => {
      button.classList.toggle('active', button.dataset.filter === filter);
    });

    const baseWorks = filter === 'FEATURED'
      ? projectWorks.filter(work => work.featured)
      : projectWorks.filter(work => work.category === filter);
    const visibleWorks = sortWorksForView(baseWorks, filter).filter(work => {
      if (!query) return true;
      return [work.title, work.brand, work.category, work.id].join(' ').toLowerCase().includes(query);
    });

    if (libraryStats) {
      libraryStats.textContent = `${visibleWorks.length} 项展示 · ${projectWorks.length} 项总库`;
    }

    projectGrid.innerHTML = '';
    if (!visibleWorks.length) {
      projectGrid.innerHTML = '<div class="library-empty">没有找到匹配项目，换个关键词试试。</div>';
      return;
    }

    visibleWorks.forEach((work, index) => {
      const card = document.createElement('article');
      card.className = 'project-card';
      if (index === 0 && filter === 'FEATURED' && !query) card.classList.add('project-card--hero');
      card.innerHTML = `
        <button class="project-media" type="button" aria-label="在新片场观看 ${work.title}">
          <img src="${work.cover}" alt="${work.title}" loading="lazy">
          <span class="project-play"><i data-lucide="external-link"></i></span>
        </button>
        <div class="project-card-body">
          <div class="project-eyebrow">${categoryLabels[work.category] || work.category} · ${work.duration}</div>
          <h3>${work.title}</h3>
          <div class="project-meta-row">
            <span>${work.brand}</span>
            <span>${work.id}</span>
          </div>
        </div>
      `;
      card.querySelector('.project-media').addEventListener('click', () => openProject(work));
      projectGrid.appendChild(card);
    });

    if (window.lucide) lucide.createIcons();
  }

  function openProject(work) {
    if (work.xpcUrl) {
      window.open(work.xpcUrl, '_blank', 'noopener,noreferrer');
      return;
    }
    const video = projectModal.querySelector('.project-modal-video');
    video.src = work.videoFile;
    video.poster = work.cover;
    projectModal.querySelector('.project-modal-category').textContent = `${categoryLabels[work.category] || work.category} · ${work.duration} · ${work.sizeMB}MB`;
    projectModal.querySelector('.project-modal-title').textContent = work.title;
    projectModal.querySelector('.project-modal-detail').textContent = work.videoPath;
    projectModal.querySelector('.project-modal-link').href = work.xpcUrl || work.videoFile;
    projectModal.classList.add('active');
    lenis.stop();
    video.load();
  }

  function closeProject() {
    const video = projectModal.querySelector('.project-modal-video');
    video.pause();
    video.removeAttribute('src');
    projectModal.classList.remove('active');
    lenis.start();
  }

  projectModal.querySelector('.project-modal-close').addEventListener('click', closeProject);
  projectModal.addEventListener('click', (event) => {
    if (event.target === projectModal) closeProject();
  });
  if (projectSearch) {
    projectSearch.addEventListener('input', () => renderProjectLibrary(activeProjectFilter));
  }
  document.querySelectorAll('.works-col li[data-xpc-id]').forEach(item => {
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'link');
    item.setAttribute('title', '在新片场观看');
    const openWork = () => {
      window.open(`https://www.xinpianchang.com/${item.dataset.xpcId}`, '_blank', 'noopener,noreferrer');
    };
    item.addEventListener('click', openWork);
    item.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openWork();
      }
    });
  });
  renderProjectLibrary();

  // 3. Slides & Navigation
  const slides = Array.from(document.querySelectorAll('.slide'));
  let currentSlideIndex = 0;
  const slideCounter = document.getElementById('slideCounter');
  const typewriterText = document.getElementById('typewriterText');
  const typewriterCursor = document.getElementById('typewriterCursor');
  const introLines = [
    'PUT A DENT',
    'IN THE UNIVERSE.'
  ];
  let typewriterStarted = false;

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
    if (slideCounter) {
      slideCounter.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async function runTypewriter() {
    if (typewriterStarted || !typewriterText) return;
    typewriterStarted = true;
    typewriterText.textContent = '';
    if (typewriterCursor) typewriterCursor.style.display = 'inline-block';

    const fullText = introLines.join('\n');
    for (const char of fullText) {
      typewriterText.textContent += char;
      await sleep(char === '\n' ? 260 : 28);
    }
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
        if (entry.target.id === 'slide-2') runTypewriter();
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
  const overviewModal = document.getElementById('overview');
  const overviewGrid = document.getElementById('overviewGrid');
  
  let overviewBuilt = false;
  
  function buildOverview() {
    if (overviewBuilt) return;
    const grid = overviewGrid;
    if (!grid) return;
    slides.forEach((slide, i) => {
      const item = document.createElement('div');
      item.className = 'overview-item';
      
      const thumb = document.createElement('img');
      thumb.loading = 'lazy';
      
      const projectCover = slide.querySelector('.project-card img');
      const cinematicBg = slide.querySelector('.cinematic-bg');
      if (projectCover) {
        thumb.src = projectCover.src;
      } else if (cinematicBg && cinematicBg.style.backgroundImage) {
        let bgUrl = cinematicBg.style.backgroundImage;
        bgUrl = bgUrl.replace(/^url\(['"]?/, '').replace(/['"]?\)$/, '');
        thumb.src = bgUrl;
      } else {
        thumb.src = `assets/thumbnails/thumb-${slide.id}.jpg`;
      }
      
      item.appendChild(thumb);
      
      const label = document.createElement('div');
      label.className = 'overview-caption';
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
      if (projectModal.classList.contains('active')) closeProject();
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
