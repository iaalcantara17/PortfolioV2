"""Strip metadata from photo originals, in place.

optimize-photos.py and make-head-images.py run this on every original they read, before
anything else, so a photo dropped into photos-src/ loses its metadata the first time the
pipeline runs. It can also be run by itself, from the repo root:

    python scripts/strip_metadata.py [file or folder ...]    (default: photos-src)

Removes EXIF (camera, serial number, lens, dates, GPS), XMP, IPTC/Photoshop blocks,
comments, C2PA content credentials, anything appended after the image (a phone's gain
map or depth image) and any other non-image data. Keeps only what the
image needs to decode and show its colors: for JPEG the JFIF header, the ICC color
profile and Adobe's color marker; for PNG the image chunks plus the color and pixel-size
ones. The compressed image data is copied byte for byte, never re-encoded, so the pixels
stay exactly the same, and the result is checked against the original before it's saved.

A photo turned by its orientation tag keeps a new EXIF block holding that one tag and
nothing else, so it still shows the right way up.

A file with nothing to strip isn't rewritten, so running the pipeline again changes
nothing. Only JPEG and PNG are handled; anything else is refused.
"""

import io
import os
import struct
import sys
import tempfile
import zlib
from pathlib import Path

from PIL import Image

JPEG_SOI = b'\xff\xd8'
PNG_SIGNATURE = b'\x89PNG\r\n\x1a\n'

# JPEG APPn segments kept, by marker and the identifier their data starts with
JPEG_KEEP = {0xE0: b'JFIF\x00', 0xE2: b'ICC_PROFILE\x00', 0xEE: b'Adobe'}

# PNG chunks kept: the image itself, transparency, color and pixel size (and APNG's
# animation chunks, so an animated PNG still plays)
PNG_KEEP = {
    b'IHDR', b'PLTE', b'IDAT', b'IEND', b'tRNS',
    b'gAMA', b'cHRM', b'sRGB', b'iCCP', b'sBIT', b'bKGD', b'pHYs',
    b'acTL', b'fcTL', b'fdAT',
}

ORIENTATION_TAG = 0x0112


def orientation_tiff(orientation):
    """A big-endian TIFF block with one entry: the orientation tag."""
    return (b'MM\x00\x2a' + struct.pack('>I', 8) + struct.pack('>H', 1)
            + struct.pack('>HHIH', ORIENTATION_TAG, 3, 1, orientation) + b'\x00\x00'
            + struct.pack('>I', 0))


def scan_end(data, i):
    """Where a scan's compressed data, starting at i, ends: at the next marker that isn't
    a stuffed 0xFF byte or a restart marker."""
    while True:
        i = data.find(b'\xff', i)
        if i < 0 or i + 1 >= len(data):
            raise ValueError('malformed JPEG: no end-of-image marker')
        following = data[i + 1]
        if following == 0x00 or 0xD0 <= following <= 0xD7:
            i += 2
        elif following == 0xFF:
            i += 1
        else:
            return i


def strip_jpeg(data, orientation):
    out = [JPEG_SOI]
    i = len(JPEG_SOI)
    while True:
        if i + 1 >= len(data) or data[i] != 0xFF:
            raise ValueError('malformed JPEG')
        marker = data[i + 1]
        if marker == 0xFF:
            # Fill byte before a marker
            i += 1
            continue
        if marker == 0xD9:
            # End of image. Anything after it (a phone's gain map or depth image, a camera
            # trailer), with whatever metadata it carries, is dropped.
            out.append(b'\xff\xd9')
            break
        if 0xD0 <= marker <= 0xD7 or marker == 0x01:
            out.append(data[i:i + 2])
            i += 2
            continue
        length = struct.unpack('>H', data[i + 2:i + 4])[0]
        segment = data[i:i + 2 + length]
        is_app = 0xE0 <= marker <= 0xEF
        if not (marker == 0xFE or (is_app and not segment[4:].startswith(JPEG_KEEP.get(marker, b'\xff')))):
            out.append(segment)
        i += 2 + length
        if marker == 0xDA:
            # Start of scan: its compressed data follows, copied as is
            end = scan_end(data, i)
            out.append(data[i:end])
            i = end

    if orientation:
        exif = b'Exif\x00\x00' + orientation_tiff(orientation)
        app1 = b'\xff\xe1' + struct.pack('>H', len(exif) + 2) + exif
        # After the JFIF header, which has to come first when there is one
        at = 2 if len(out) > 1 and out[1][:2] == b'\xff\xe0' else 1
        out.insert(at, app1)
    return b''.join(out)


def png_chunk(kind, body):
    return struct.pack('>I', len(body)) + kind + body + struct.pack('>I', zlib.crc32(kind + body))


def strip_png(data, orientation):
    out = [PNG_SIGNATURE]
    i = len(PNG_SIGNATURE)
    while i < len(data):
        length, kind = struct.unpack('>I4s', data[i:i + 8])
        chunk = data[i:i + 12 + length]
        if kind == b'IDAT' and orientation:
            # eXIf has to come before the image data
            out.append(png_chunk(b'eXIf', orientation_tiff(orientation)))
            orientation = None
        if kind in PNG_KEEP:
            out.append(chunk)
        i += 12 + length
        if kind == b'IEND':
            break
    return b''.join(out)


def pixels(data):
    with Image.open(io.BytesIO(data)) as im:
        return im.mode, im.size, im.tobytes()


def strip_metadata(path):
    """Strips path's metadata in place. True if the file changed, False if it had
    nothing to strip."""
    path = Path(path)
    data = path.read_bytes()
    with Image.open(path) as im:
        # Pillow also reads an orientation kept in XMP only
        orientation = im.getexif().get(ORIENTATION_TAG)
    orientation = orientation if orientation in range(2, 9) else None

    if data.startswith(JPEG_SOI):
        stripped = strip_jpeg(data, orientation)
    elif data.startswith(PNG_SIGNATURE):
        stripped = strip_png(data, orientation)
    else:
        raise ValueError(f'{path}: not a JPEG or PNG, so its metadata was not stripped')

    if stripped == data:
        return False
    if pixels(stripped) != pixels(data):
        raise ValueError(f'{path}: stripping would change the pixels, so the file was left as it was')

    # Written beside the original, then swapped in, so an interruption can't leave it half-written
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix='.tmp')
    try:
        with os.fdopen(fd, 'wb') as f:
            f.write(stripped)
        os.replace(tmp, path)
    except BaseException:
        Path(tmp).unlink(missing_ok=True)
        raise
    return True


def main():
    targets = [Path(arg) for arg in sys.argv[1:]] or [Path('photos-src')]
    files = []
    for target in targets:
        if target.is_dir():
            files += sorted(p for p in target.iterdir() if p.suffix.lower() in ('.jpg', '.jpeg', '.png'))
        else:
            files.append(target)
    for path in files:
        before = path.stat().st_size
        changed = strip_metadata(path)
        after = path.stat().st_size
        note = f'stripped, {before - after:,} bytes removed' if changed else 'nothing to strip'
        print(f'{str(path):<36} {note}')


if __name__ == '__main__':
    main()
