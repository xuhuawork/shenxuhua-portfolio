import os
import time
from playwright.sync_api import sync_playwright

def capture_thumbnails():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # 16:9 ratio for perfect thumbnails
        page = browser.new_page(viewport={"width": 1920, "height": 1080})
        print("Visiting localhost...")
        page.goto("http://localhost:8768/")
        page.wait_for_load_state("networkidle")
        
        print("Waiting for initial load and preloader...")
        page.wait_for_timeout(3000)
        
        # Hide any overlays globally
        page.evaluate("""
            const topNav = document.querySelector('.top-nav');
            if (topNav) topNav.style.display = 'none';
            const botNav = document.querySelector('.fixed-bottom-nav');
            if (botNav) botNav.style.display = 'none';
            const navDots = document.querySelector('.nav-dots');
            if (navDots) navDots.style.display = 'none';
        """)

        # The slides we want to capture
        target_ids = ["slide-1", "slide-2", "slide-3", "slide-5", "slide-6", "slide-8"]
        out_dir = "/Users/xuhuapro/Documents/大展鸿图/shenxuhua-portfolio/assets/thumbnails"
        os.makedirs(out_dir, exist_ok=True)
        
        for sid in target_ids:
            print(f"Processing {sid}...")
            
            # Using locator to ensure element exists
            loc = page.locator(f"#{sid}")
            
            # Use javascript to force it into viewport with native rendering 
            # and force animate-in to trigger CSS transitions
            page.evaluate(f"""
                const el = document.getElementById('{sid}');
                el.scrollIntoView({{ behavior: 'instant', block: 'start' }});
                el.classList.add('animate-in');
            """)
            
            # Wait for CSS transitions (fade-ins, text typing, etc.)
            # typewriter takes ~2-3 seconds, so wait 4 seconds.
            page.wait_for_timeout(4000)
            
            # Using an overlay hide string specifically scoped to this screenshot in case they popped back
            out_path = os.path.join(out_dir, f"thumb-{sid}.jpg")
            
            # Take a viewport screenshot because catching the height:100vh element is safest from the viewport perspective
            page.screenshot(path=out_path, type="jpeg", quality=90, full_page=False)
            print(f"Saved {out_path}")
            
        browser.close()

if __name__ == "__main__":
    capture_thumbnails()
