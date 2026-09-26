"""Generate the site's optimized photo variants from the camera originals.

Reads every JPG/PNG in photos-src/ (never served) and writes, per photo,
AVIF + WebP at 400/1200/2400px long edge into src/assets/photos/, plus a
manifest.json of each original's dimensions and each variant's actual
dimensions. All EXIF/XMP/ICC metadata is dropped (pixels are converted to
sRGB first if the source profile isn't sRGB).

Every file stays under 500 KB: quality steps down first, and a variant still
over the limit at the lowest quality is shrunk 10% at a time until it fits.

Requires Pillow >= 11.2 (native AVIF). Run from the repo root:

    python scripts/optimize-photos.py [--src photos-src]
"""

import argparse
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms, ImageOps

OUT_DIR = Path('src/assets/photos')
WIDTHS = (400, 1200, 2400)
MAX_BYTES = 500 * 1024
QUALITY = {'avif': 55, 'webp': 80}
MIN_QUALITY = {'avif': 35, 'webp': 60}
FORMATS = ('avif', 'webp')
# A variant still over MAX_BYTES at MIN_QUALITY is shrunk by this much and retried
SHRINK = 0.9
SOURCE_EXTS = {'.jpg', '.jpeg', '.png'}


def to_srgb(im):
    icc = im.info.get('icc_profile')
    if icc:
        src = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        if 'srgb' not in ImageCms.getProfileDescription(src).lower():
            im = ImageCms.profileToProfile(im, src, ImageCms.createProfile('sRGB'), outputMode='RGB')
    return im.convert('RGB')


def encode(im, fmt, quality):
    buf = io.BytesIO()
    if fmt == 'avif':
        im.save(buf, 'AVIF', quality=quality, speed=4)
    else:
        im.save(buf, 'WEBP', quality=quality, method=6)
    return buf.getvalue()


def encode_under_limit(im, fmt):
    """The highest quality, in steps of 5, that fits MAX_BYTES. None if even
    MIN_QUALITY doesn't fit."""
    quality = QUALITY[fmt]
    while quality >= MIN_QUALITY[fmt]:
        data = encode(im, fmt, quality)
        if len(data) <= MAX_BYTES:
            return data, quality
        quality -= 5
    return None


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--src', default='photos-src')
    args = parser.parse_args()

    sources = sorted(p for p in Path(args.src).iterdir() if p.suffix.lower() in SOURCE_EXTS)
    if not sources:
        sys.exit(f'No source photos found in {args.src}/')

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    manifest = {}
    rows = []

    for path in sources:
        name = path.stem.lower()
        with Image.open(path) as original:
            im = to_srgb(ImageOps.exif_transpose(original))
        variants = {}
        manifest[name] = {'width': im.width, 'height': im.height, 'variants': variants}

        for width in WIDTHS:
            long_edge = min(width, max(im.size))
            while True:
                scale = long_edge / max(im.size)
                size = (round(im.width * scale), round(im.height * scale))
                resized = im.resize(size, Image.LANCZOS)
                encoded = {fmt: encode_under_limit(resized, fmt) for fmt in FORMATS}
                if all(encoded.values()):
                    break
                # Over the limit even at the lowest quality. Both formats shrink, so a
                # variant's AVIF and WebP stay the same pixels at one size.
                long_edge = round(long_edge * SHRINK)
            variants[str(width)] = {'width': size[0], 'height': size[1]}

            for fmt, (data, quality) in encoded.items():
                out = OUT_DIR / f'{name}-{width}.{fmt}'
                if out.name != out.name.lower():
                    sys.exit(f'Refusing to write non-lowercase filename: {out.name}')
                out.write_bytes(data)
                rows.append((out.name, size, quality, len(data), max(size) < min(width, max(im.size))))

    (OUT_DIR / 'manifest.json').write_text(json.dumps(manifest, indent=2) + '\n')

    for filename, (w, h), quality, nbytes, shrunk in rows:
        flag = '  shrunk to fit' if shrunk else ''
        print(f'{filename:<24} {w:>4}x{h:<4}  q{quality:<3} {nbytes / 1024:>7.1f} KB{flag}')


if __name__ == '__main__':
    main()
