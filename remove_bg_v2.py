import cv2
import numpy as np

def remove_bg_v2(image_path, output_path):
    print(f"Processing {image_path}...")
    img = cv2.imread(image_path)
    if img is None:
        print("Error: Could not read image.")
        return

    # Convert to grayscale for thresholding
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # The cat is dark green (textured), background is light grey (~245)
    # Thresholding: Keep anything dark enough (below 220)
    _, mask = cv2.threshold(gray, 220, 255, cv2.THRESH_BINARY_INV)
    
    # Clean up small noise with morphological opening
    kernel = np.ones((3,3), np.uint8)
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel, iterations=1)
    # Fill small holes with closing
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel, iterations=1)
    
    # Convert original to BGRA
    bgra = cv2.cvtColor(img, cv2.COLOR_BGR2BGRA)
    
    # Apply the mask to the alpha channel
    bgra[:, :, 3] = mask
    
    cv2.imwrite(output_path, bgra)
    print(f"Saved transparent image to {output_path}")

if __name__ == "__main__":
    remove_bg_v2("cat.png", "cat_transparent_v2.png")
