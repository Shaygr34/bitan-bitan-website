#!/usr/bin/env python3
"""
Process the high-res source logo (1192x396 JPG, white bg + black text + gold)
into two transparent PNGs:
  - logo-header.png: navy text (#102040) + gold on transparent
  - logo-footer.png: white text + gold on transparent

Both upscaled 2x with LANCZOS for crisp rendering.
"""

from PIL import Image
import numpy as np
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "docs" / "לוגו" / "לוגו" / "1-לוגו מייל ביטן את ביטן.jpg"

# Target colors
NAVY = (16, 32, 64)
WHITE = (255, 255, 255)
GOLD = (197, 165, 114)


def process_logo(src_path, text_color, out_path):
    img = Image.open(src_path).convert("RGB")

    # Crop: keep only the top logo portion (firm name + abacus + "רואי חשבון")
    # Skip the contact info row and gold address bar at bottom
    w, h = img.size
    # The logo proper is roughly the top 55% of the image
    crop_h = int(h * 0.55)
    img = img.crop((0, 0, w, crop_h))

    # Upscale 2x
    new_w, new_h = img.size[0] * 2, img.size[1] * 2
    img = img.resize((new_w, new_h), Image.LANCZOS)

    pixels = np.array(img, dtype=np.float64)
    r, g, b = pixels[:, :, 0], pixels[:, :, 1], pixels[:, :, 2]
    total = r + g + b

    # Output RGBA
    out = np.zeros((new_h, new_w, 4), dtype=np.uint8)

    # 1. White background → transparent (total > 700, stricter to preserve edges)
    bg_mask = total > 700

    # 2. Gold detection: R>150, G>120, B<180, (R-B)>30
    gold_mask = (r > 150) & (g > 120) & (b < 180) & ((r - b) > 30) & ~bg_mask
    # Gold: full opacity for strong gold, proportional for lighter
    gold_brightness = total / 3.0
    gold_alpha = np.clip((1.0 - gold_brightness / 230.0) * 3.0, 0.3, 1) * 255
    out[gold_mask, 0] = GOLD[0]
    out[gold_mask, 1] = GOLD[1]
    out[gold_mask, 2] = GOLD[2]
    out[gold_mask, 3] = gold_alpha[gold_mask].astype(np.uint8)

    # 3. Dark pixels (text) → text_color, strong alpha
    dark_mask = (total < 400) & ~gold_mask & ~bg_mask
    # Aggressive alpha: fully opaque for dark, quick falloff
    darkness = np.clip((1.0 - total / 400.0) * 2.5, 0, 1) * 255
    out[dark_mask, 0] = text_color[0]
    out[dark_mask, 1] = text_color[1]
    out[dark_mask, 2] = text_color[2]
    out[dark_mask, 3] = darkness[dark_mask].astype(np.uint8)

    # 4. Anti-alias / mid-tone edges → text_color with proportional alpha
    edge_mask = ~bg_mask & ~gold_mask & ~dark_mask
    edge_alpha = np.clip((1.0 - total / 700.0) * 2.0, 0, 1) * 255
    out[edge_mask, 0] = text_color[0]
    out[edge_mask, 1] = text_color[1]
    out[edge_mask, 2] = text_color[2]
    out[edge_mask, 3] = edge_alpha[edge_mask].astype(np.uint8)

    # 5. Background stays transparent (alpha=0, already default)

    result = Image.fromarray(out, "RGBA")

    # Trim transparent padding
    bbox = result.getbbox()
    if bbox:
        result = result.crop(bbox)

    result.save(out_path, "PNG", optimize=True)
    w_out, h_out = result.size
    size_kb = out_path.stat().st_size / 1024
    print(f"  Saved: {out_path.name} ({w_out}x{h_out}, {size_kb:.0f} KB)")


def main():
    print(f"Source: {SRC}")
    src_img = Image.open(SRC)
    print(f"  Size: {src_img.size}, Mode: {src_img.mode}")

    print("\nProcessing header logo (navy text + gold on transparent)...")
    process_logo(SRC, NAVY, ROOT / "public" / "logo-header.png")

    print("Processing footer logo (white text + gold on transparent)...")
    process_logo(SRC, WHITE, ROOT / "public" / "logo-footer.png")

    print("\nDone!")


if __name__ == "__main__":
    main()
