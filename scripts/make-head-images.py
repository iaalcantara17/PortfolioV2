"""Generate the images index.html's head points to, into public/:

- og-image.png (1200x630): the link preview. Paper background, the Hero's name and
  eyebrow on the left, the Hero portrait bleeding off the right.
- favicon.ico (16/32/48) and apple-touch-icon.png (180x180): the nav logo, "I.A.",
  on a paper tile. public/favicon.svg is the same monogram as vector outlines.

Type is the site's own: DM Serif Display from src/assets/fonts/, and Arial, the
font-sans fallback every desktop system has, so the output is the same on any
machine. Colors are the design tokens in src/index.css. Nothing from the portrait's
original file (EXIF, ICC) is carried over.

Requires Pillow. Run from the repo root:

    python scripts/make-head-images.py
"""

import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps

OUT_DIR = Path('public')
SERIF = Path('src/assets/fonts/dm-serif-display-latin-400.woff2')
SANS_CANDIDATES = (
    Path('C:/Windows/Fonts/arial.ttf'),
    Path('/System/Library/Fonts/Supplemental/Arial.ttf'),
    Path('/Library/Fonts/Arial.ttf'),
    Path('/usr/share/fonts/truetype/msttcorefonts/Arial.ttf'),
)
PORTRAIT = Path('photos-src/portrait.jpg')

# Design tokens (src/index.css)
PAPER = '#f5f2ec'
INK = '#0d0d0d'
MUTED = '#666666'
PURPLE = '#7F77DD'

# Link preview
OG_SIZE = (1200, 630)
OG_TEXT_LEFT = 72
# Between the text block and the portrait
OG_GUTTER = 64
EYEBROW = 'Software Engineer · MBA Candidate'
NAME_LINES = ('Israel', 'Alcántara')
# Sized for the preview card, not the file: LinkedIn shows the image about 552px wide,
# so 26px here reads at about 12px there
EYEBROW_PX = 26
EYEBROW_LEADING = 1.5
NAME_PX = 120
# From the name's last baseline to the eyebrow's cap top, in the name's cap heights
EYEBROW_GAP = 0.4
# The face's center across the portrait original, as a share of its width. The crop is
# the original's full height, which puts the face just above center (brows to chin
# span about 30-64% of it; the hair nearly touches the top, so it isn't cropped).
FACE_X = 0.47

# Monogram, as the nav logo sets it: letter-spacing -0.01em, all ink
MONOGRAM = 'I.A.'
MONOGRAM_TRACKING = -0.01
# Supersampling for the small icons: drawn this many times larger, then scaled down
SS = 8


def sans_path():
    for path in SANS_CANDIDATES:
        if path.exists():
            return path
    sys.exit('Arial not found; not substituting another font')


def draw_tracked(draw, xy, text, font, tracking, fill):
    """Text with CSS-style letter-spacing (tracking in em), from the left baseline.
    Returns the width drawn, trailing spacing excluded."""
    x, y = xy
    step = tracking * font.size
    for i, ch in enumerate(text):
        draw.text((x + font.getlength(text[:i]) + i * step, y), ch, font=font, fill=fill, anchor='ls')
    return tracked_width(text, font, tracking)


def tracked_width(text, font, tracking):
    return font.getlength(text) + (len(text) - 1) * tracking * font.size


def og_image():
    im = Image.new('RGB', OG_SIZE, PAPER)
    draw = ImageDraw.Draw(im)
    w, h = OG_SIZE

    # Text block: the name, then the Hero's eyebrow row (purple rule, uppercase tracked
    # label) under it. The eyebrow never makes the block wider than the name: where one
    # line would, it breaks after the "·", the second line under the first's text.
    eyebrow_font = ImageFont.truetype(str(sans_path()), EYEBROW_PX)
    name_font = ImageFont.truetype(str(SERIF), NAME_PX)
    rule_w, rule_gap = 48, 18
    eyebrow = EYEBROW.upper()
    name_w = max(tracked_width(line, name_font, -0.03) for line in NAME_LINES)
    eyebrow_lines = [eyebrow]
    if rule_w + rule_gap + tracked_width(eyebrow, eyebrow_font, 0.14) > name_w:
        first, second = eyebrow.split(' · ')
        eyebrow_lines = [f'{first} ·', second]
    block_w = max(name_w, rule_w + rule_gap + max(tracked_width(line, eyebrow_font, 0.14) for line in eyebrow_lines))

    # Portrait: the rest of the width, full height, off the right, top and bottom edges,
    # no frame. Cropped from the original's full height, centered on the face across.
    photo_x = OG_TEXT_LEFT + round(block_w) + OG_GUTTER
    with Image.open(PORTRAIT) as original:
        source = ImageOps.exif_transpose(original).convert('RGB')
    crop_w = round(source.height * (w - photo_x) / h)
    crop_x = min(max(round(source.width * FACE_X - crop_w / 2), 0), source.width - crop_w)
    photo = source.crop((crop_x, 0, crop_x + crop_w, source.height)).resize((w - photo_x, h), Image.LANCZOS)
    im.paste(photo, (photo_x, 0))

    # Centered on the canvas by its ink: the top of "Israel" to the eyebrow's last baseline
    name_cap = -name_font.getbbox('H', anchor='ls')[1]
    name_top = -name_font.getbbox(NAME_LINES[0], anchor='ls')[1]
    eyebrow_cap = -eyebrow_font.getbbox('H', anchor='ls')[1]
    leading = round(NAME_PX * 0.92)
    eyebrow_leading = round(EYEBROW_PX * EYEBROW_LEADING)
    gap = round(name_cap * EYEBROW_GAP)
    block_h = name_top + leading * (len(NAME_LINES) - 1) + gap + eyebrow_cap + eyebrow_leading * (len(eyebrow_lines) - 1)
    baseline = (h - block_h) // 2 + name_top

    for line in NAME_LINES:
        draw_tracked(draw, (OG_TEXT_LEFT, baseline), line, name_font, -0.03, INK)
        baseline += leading
    baseline += gap + eyebrow_cap - leading

    rule_y = baseline - eyebrow_cap // 2
    draw.rectangle((OG_TEXT_LEFT, rule_y - 1, OG_TEXT_LEFT + rule_w - 1, rule_y), fill=PURPLE)
    for line in eyebrow_lines:
        draw_tracked(draw, (OG_TEXT_LEFT + rule_w + rule_gap, baseline), line, eyebrow_font, 0.14, MUTED)
        baseline += eyebrow_leading

    return im, {
        'eyebrow px': EYEBROW_PX,
        'eyebrow lines': len(eyebrow_lines),
        'name px': NAME_PX,
        'gap px': gap,
        'text to portrait px': photo_x - OG_TEXT_LEFT - round(block_w),
        'portrait': f'{w - photo_x}x{h} at x={photo_x}',
    }


def monogram(size, ink_width, radius, transparent_corners):
    """The monogram's ink box centered on a paper tile, ink_width of the tile wide
    (the same rule as favicon.svg)."""
    big = size * SS
    probe = ImageFont.truetype(str(SERIF), 1000)
    layer = Image.new('L', (3000, 1600), 0)
    draw_tracked(ImageDraw.Draw(layer), (100, 1200), MONOGRAM, probe, MONOGRAM_TRACKING, 255)
    x0, y0, x1, y1 = layer.getbbox()
    scale = big * ink_width / (x1 - x0)

    font = ImageFont.truetype(str(SERIF), round(1000 * scale))
    scale = font.size / 1000
    left = (big - (x1 - x0) * scale) / 2 - (x0 - 100) * scale
    baseline = (big - (y1 - y0) * scale) / 2 + (1200 - y0) * scale

    tile = Image.new('RGBA', (big, big), (0, 0, 0, 0) if transparent_corners else PAPER)
    draw = ImageDraw.Draw(tile)
    draw.rounded_rectangle((0, 0, big - 1, big - 1), radius=radius * SS, fill=PAPER)
    draw_tracked(draw, (left, baseline), MONOGRAM, font, MONOGRAM_TRACKING, INK)
    return tile.resize((size, size), Image.LANCZOS)


def main():
    for path in (SERIF, PORTRAIT):
        if not path.exists():
            sys.exit(f'Missing {path}')
    OUT_DIR.mkdir(exist_ok=True)
    rows = []

    og, notes = og_image()
    og.save(OUT_DIR / 'og-image.png', optimize=True)
    rows.append(('og-image.png', og.size, notes))

    # Same tile as favicon.svg (64 units, 8 corner radius, ink 84% wide), per size
    icons = [monogram(n, 0.84, n / 8, True) for n in (16, 32, 48)]
    icons[-1].save(OUT_DIR / 'favicon.ico', format='ICO', sizes=[i.size for i in icons], append_images=icons[:-1])
    rows.append(('favicon.ico', '16/32/48', {}))

    # iOS rounds the corners itself and wants an opaque, full-bleed square
    touch = monogram(180, 0.7, 0, False).convert('RGB')
    touch.save(OUT_DIR / 'apple-touch-icon.png', optimize=True)
    rows.append(('apple-touch-icon.png', touch.size, {}))

    for filename, size, notes in rows:
        dims = size if isinstance(size, str) else f'{size[0]}x{size[1]}'
        kb = (OUT_DIR / filename).stat().st_size / 1024
        extra = '  ' + ', '.join(f'{k} {v}' for k, v in notes.items()) if notes else ''
        print(f'{filename:<22} {dims:>9}  {kb:>6.1f} KB{extra}')


if __name__ == '__main__':
    main()
