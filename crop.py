from PIL import Image

try:
    img = Image.open('assets/slides/slide-04.jpg')
    w, h = img.size
    # Guessing crop coordinates based on standard 16:9 1920x1080:
    # 50% height in center. Center X 50%.
    # Portrait: X from 540 to 960 ? Let's just crop based on relative box.
    # Actually, from the screenshot, the composition is exactly:
    # Left: 28% to 50%
    # Right: 50% to 72%
    # Top: 25% to 75%
    
    # Safe bounds
    p_left = int(w * 0.28)
    p_top = int(h * 0.231)
    p_right = int(w * 0.5)
    p_bottom = int(h * 0.741)
    
    portrait = img.crop((p_left, p_top, p_right, p_bottom))
    portrait.save('assets/slides/portrait-cropped.jpg')
    print("Crop complete")
except Exception as e:
    print(f"Error: {e}")
