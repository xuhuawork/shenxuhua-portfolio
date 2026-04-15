import re

file_path = '/Users/xuhuapro/Documents/大展鸿图/shenxuhua-portfolio/index.html'

with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Remove style block
content = re.sub(r'<style>.*?</style>', '<link rel="stylesheet" href="style.css">', content, flags=re.DOTALL)

# 2. Add Lenis and Lucide and main.js to head/body
head_insert = '''<link rel="stylesheet" href="style.css">
<!-- Lenis for smooth scroll -->
<script src="https://unpkg.com/lenis@1.1.20/dist/lenis.min.js"></script>
<!-- Lucide Icons -->
<script src="https://unpkg.com/lucide@latest"></script>
'''
content = content.replace('<link rel="stylesheet" href="style.css">', head_insert)

# 3. Replace UI elements in TopBar
top_bar_old = '''<div class="actions">
    <span class="slide-counter" id="slideCounter">01 / 39</span>
    <button onclick="toggleOverview()" title="Overview (O)">&#x25A6; Overview</button>
    <button onclick="toggleFullscreen()" title="Fullscreen (F)">&#x26F6; Fullscreen</button>
    <button onclick="exportPDF()" title="Export PDF (P)">&#x2193; PDF</button>
  </div>'''
  
top_bar_new = '''<div class="actions">
    <span class="slide-counter" id="slideCounter">01 / 39</span>
    <button onclick="toggleOverview()" title="Overview (O)"><i data-lucide="grid-3x3"></i> <span>Overview</span></button>
    <button onclick="toggleFullscreen()" title="Fullscreen (F)"><i data-lucide="maximize"></i> <span>Fullscreen</span></button>
    <button onclick="exportPDF()" title="Export PDF (P)"><i data-lucide="download"></i> <span>PDF</span></button>
  </div>'''
content = content.replace(top_bar_old, top_bar_new)

# 4. Loader format update
loader_old = '''<div class="loader" id="loader">
  <div class="loader-bar"><div class="loader-bar-fill" id="loaderFill"></div></div>
  <div class="loader-text">SHENXUHUA</div>
</div>'''
loader_new = '''<div class="loader" id="loader">
  <div class="loader-counter" id="loaderCounter">000</div>
  <div class="loader-bar"><div class="loader-bar-fill" id="loaderFill"></div></div>
  <div class="loader-text">SHENXUHUA DIRECTOR PORTFOLIO</div>
</div>
<!-- Film grain overlay -->
<div class="film-grain"></div>'''
content = content.replace(loader_old, loader_new)

# 5. Remove script block and add main.js
content = re.sub(r'<script>\s*// ===== CONFIG =====.*?</script>', '<script src="main.js"></script>', content, flags=re.DOTALL)

# 6. Change all slide images to use data-src starting from slide 4
# Since slides are structurally similar, we'll iterate through them
def replace_img_src(match):
    full_str = match.group(0)
    # Don't replace first 3 slides (cover, intro, profile)
    if 'slide-1"' in full_str or 'slide-2"' in full_str or 'slide-3"' in full_str:
        return full_str
    # Replace src with data-src for img tags inside slide-bg
    return full_str.replace('<img src=', '<img data-src=')

content = re.sub(r'<section class="slide" id="slide-\d+".*?</section>', replace_img_src, content, flags=re.DOTALL)


with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print('Update complete.')
