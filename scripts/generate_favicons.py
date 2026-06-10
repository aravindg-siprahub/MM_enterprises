import os
from PIL import Image, ImageChops

def trim(im):
    # Convert to RGBA if not already
    im = im.convert("RGBA")
    
    # Create a background image based on the top-left pixel (could be white or transparent)
    bg = Image.new(im.mode, im.size, im.getpixel((0,0)))
    diff = ImageChops.difference(im, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    if bbox:
        return im.crop(bbox)
    return im

def make_square(im, fill_color=(255, 255, 255, 0)):
    x, y = im.size
    size = max(x, y)
    new_im = Image.new('RGBA', (size, size), fill_color)
    new_im.paste(im, (int((size - x) / 2), int((size - y) / 2)))
    return new_im

def generate_favicons():
    logo_path = 'frontend/public/logo.png'
    output_dir = 'frontend/public'
    
    if not os.path.exists(logo_path):
        print(f"Error: {logo_path} not found.")
        return

    try:
        img = Image.open(logo_path)
        img = img.convert("RGBA")
        
        # Trim whitespace/transparent padding
        trimmed = trim(img)
        
        # The logo text "MM ENTERPRISES" is usually at the bottom.
        # We will crop the top 65% of the trimmed image to isolate the symbol.
        w, h = trimmed.size
        # Let's crop the top part
        symbol_h = int(h * 0.65)
        symbol = trimmed.crop((0, 0, w, symbol_h))
        
        # Trim again just in case the crop left some bottom padding
        symbol = trim(symbol)
        
        # Make it a perfect square with transparent background
        square_symbol = make_square(symbol)
        
        # Sizes required
        sizes = [32, 48, 512, 180, 192]
        
        for size in sizes:
            resized = square_symbol.resize((size, size), Image.Resampling.LANCZOS)
            filename = f"icon-{size}x{size}.png"
            if size == 180:
                filename = "apple-touch-icon.png"
            resized.save(os.path.join(output_dir, filename), "PNG")
            print(f"Generated {filename}")
            
        # Generate favicon.ico (includes 16x16, 32x32, 48x48)
        ico_sizes = [(16, 16), (32, 32), (48, 48)]
        ico_images = [square_symbol.resize(size, Image.Resampling.LANCZOS) for size in ico_sizes]
        ico_images[0].save(os.path.join(output_dir, "favicon.ico"), format="ICO", sizes=ico_sizes)
        print("Generated favicon.ico")
        
    except Exception as e:
        print(f"Error processing image: {e}")

if __name__ == "__main__":
    generate_favicons()
