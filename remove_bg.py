from PIL import Image
import os

def remove_background(image_path, output_path):
    print(f"Processing {image_path}...")
    img = Image.open(image_path).convert("RGBA")
    
    # Process the image data
    # Using a slightly higher threshold for the grey background
    datas = img.getdata()
    new_data = []
    
    # Target color: #F5F5F1 (approx)
    # Background is very light
    for item in datas:
        # R, G, B, A
        r, g, b, a = item
        # If the pixel is close to white/light grey, make it transparent
        if r > 230 and g > 230 and b > 230:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
            
    img.putdata(new_data)
    img.save(output_path, "PNG")
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    remove_background("cat.png", "cat_transparent.png")
