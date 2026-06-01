"""Genera le icone PWA (PNG) coerenti con icon.svg.
Esecuzione:  python assets/build_icons.py
Richiede Pillow.
"""
import math
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))


def lerp(a, b, t):
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))


def star_points(cx, cy, outer, inner, n=5, rot=-math.pi / 2):
    pts = []
    for i in range(n * 2):
        r = outer if i % 2 == 0 else inner
        ang = rot + i * math.pi / n
        pts.append((cx + r * math.cos(ang), cy + r * math.sin(ang)))
    return pts


def load_font(size):
    for name in ("arialbd.ttf", "Arial Bold.ttf", "DejaVuSans-Bold.ttf", "arial.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except Exception:
            continue
    return ImageFont.load_default()


def make(size):
    img = Image.new("RGB", (size, size))
    px = img.load()
    top, bottom = (139, 92, 246), (236, 72, 153)
    for y in range(size):
        for x in range(size):
            t = (x + y) / (2 * size)
            px[x, y] = lerp(top, bottom, t)
    d = ImageDraw.Draw(img)

    s = size / 512.0
    gold, gold_edge = (255, 203, 61), (224, 161, 6)

    # corno
    d.polygon([(256 * s, 96 * s), (282 * s, 246 * s), (230 * s, 246 * s)],
              fill=gold, outline=gold_edge)

    # stella centrale
    pts = star_points(256 * s, 300 * s, 88 * s, 36 * s)
    d.polygon(pts, fill=gold, outline=gold_edge)

    # "7" al centro della stella
    font = load_font(int(96 * s))
    txt = "7"
    bbox = d.textbbox((0, 0), txt, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    d.text((256 * s - tw / 2 - bbox[0], 300 * s - th / 2 - bbox[1]), txt,
           font=font, fill=(106, 59, 191))

    # scintille
    for (x, y, r) in [(120, 150, 9), (400, 200, 7), (150, 380, 6),
                      (380, 410, 10), (96, 280, 5), (430, 320, 5)]:
        d.ellipse([(x - r) * s, (y - r) * s, (x + r) * s, (y + r) * s], fill=(255, 255, 255))

    return img


def main():
    big = make(512)
    big.save(os.path.join(HERE, "icon-512.png"))
    big.resize((192, 192), Image.LANCZOS).save(os.path.join(HERE, "icon-192.png"))
    print("Icone create: icon-512.png, icon-192.png")


if __name__ == "__main__":
    main()
