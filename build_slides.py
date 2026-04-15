#!/usr/bin/env python3
import os

BASE = "/Users/xuhuapro/Documents/大展鸿图/shenxuhua-portfolio"

with open(f"{BASE}/index.html", "r", encoding="utf-8") as f:
    html = f.read()

marker = "<!-- DYNAMIC WORKS INJECTED HERE -->"
end_marker = '<!-- Slide 39: Thank You'
if end_marker not in html:
    end_marker = '<!-- Slide 33: Thank You'

marker_pos = html.find(marker)
end_pos = html.find(end_marker)

if marker_pos == -1 or end_pos == -1:
    print("ERROR: Could not find injection markers in index.html")
    exit(1)

slide_html_parts = []
slide_files = sorted([f for f in os.listdir(f"{BASE}/assets/full_slides") if f.endswith(".jpeg")])

# Drop the first 8 intro slides, and the very last one (which is the PPT's Thank You slide)
slide_files = slide_files[8:-1]

# Inject a style block for continuous cinematic breathing
custom_style = '''
<style>
@keyframes cinematic-breathe {
  0% { transform: scale(1.0); }
  100% { transform: scale(1.04); }
}
.cinematic-bg {
  width: 100%;
  height: 100%;
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  animation: cinematic-breathe 20s infinite alternate ease-in-out;
  will-change: transform;
}
</style>
'''
slide_html_parts.append(custom_style)

for i, fname in enumerate(slide_files):
    sid = f"slide-{i + 9}"
    img_url = f"assets/full_slides/{fname}"
    
    # Using slide-bg to trigger the main 1.2s entrance fade-in, and cinematic-bg for the slow continuous breathing
    section = f'''
<section class="slide project-showcase" id="{sid}" data-section="project" style="padding:0; margin:0; width:100%; height:100vh; overflow:hidden; background-color: #050505; position: relative;">
  <div class="slide-bg">
    <div class="cinematic-bg" style="background-image: url('{img_url}');"></div>
  </div>
</section>
'''
    slide_html_parts.append(section)

injected_block = marker + "\n" + "\n".join(slide_html_parts) + "\n"

new_html = html[:marker_pos] + injected_block + html[end_pos:]

with open(f"{BASE}/index.html", "w", encoding="utf-8") as f:
    f.write(new_html)

print(f"Successfully injected {len(slide_files)} full-slide screenshots with animation into index.html")
