#!/usr/bin/env python3
import os, glob, math
from PIL import Image

def pack_masonry(image_paths, output_size=2000):
    images = []
    for path in image_paths:
        try:
            img = Image.open(path)
            images.append((img, path))
        except:
            continue
    
    if not images:
        return
    
    # Calculate scaling factor to fit roughly in output size
    total_area = sum(img.width * img.height for img, _ in images)
    scale = math.sqrt(output_size * output_size / total_area)
    
    # Resize images
    resized = []
    for img, path in images:
        new_w = int(img.width * scale)
        new_h = int(img.height * scale)
        resized.append(img.resize((new_w, new_h), Image.Resampling.LANCZOS))
    
    # Simple packing algorithm
    canvas = Image.new('RGB', (output_size, output_size), 'white')
    x, y = 0, 0
    row_height = 0
    
    for img in resized:
        if x + img.width > output_size:
            x = 0
            y += row_height
            row_height = 0
        
        if y + img.height <= output_size:
            canvas.paste(img, (x, y))
        
        x += img.width
        row_height = max(row_height, img.height)
    
    canvas.save('masonry_packed.jpg', 'JPEG', quality=95)
    print(f"Packed {len(resized)} images into masonry_packed.jpg")

# Get all images
image_files = glob.glob('*.jpg') + glob.glob('*.jpeg') + glob.glob('*.png') + \
              glob.glob('*.JPG') + glob.glob('*.JPEG') + glob.glob('*.PNG')

pack_masonry(image_files)
