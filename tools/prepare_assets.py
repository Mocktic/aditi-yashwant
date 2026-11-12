"""Turn the raw assets into web-ready media for the invite.

    assets/video-input/<scene>.png  green-screen stills  -> site/media/couple/<scene>.webp (transparent, sticker outline)
      (or video-input-9x16/<scene>.png, whose bottom square is used)
    assets/<scene>.mp4              green-screen videos  -> site/media/couple/<scene>.mp4  (colour | alpha side by side;
                                    9:16 Gemini videos lose the watermark and are cropped to the couple's square)
    assets/deco-clean/deco-*.png    white line art       -> site/media/deco/<name>.webp (redrawn in crayon red)
    assets/music.mp3                the song             -> site/media/music.mp3

Every couple picture gets the "photo sticker" edge from the save-the-date inspiration: a thin cream
border and a hand-drawn red line around the cut-out. It is baked into the stills and into every video
frame, so the page needs no extra work and the still and the video line up exactly.

It also writes site/media/manifest.json listing which scenes have a still and a video, so the page
plays the video where there is one and the still everywhere else. Run it again after adding files
(e.g. the Grah Shanti scene, see ASSET-PROMPTS.md):

    python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy   # first time only
    .venv/bin/python tools/prepare_assets.py              # everything
    .venv/bin/python tools/prepare_assets.py grahshanti   # just one scene (faster)
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / 'assets'
OUT = ROOT / 'site' / 'media'
SCENES = ['intro', 'haldi', 'grahshanti', 'engagement', 'baraat', 'wedding', 'reception', 'finale', 'afterparty', 'thanks']
STILL_SIZE = 900
VIDEO_SIZE = 720
WATERMARK_ALPHA = ROOT / 'tools' / 'gemini-watermark-alpha.png'
WATERMARK_AT = (560, 1120)

# keep in sync with site/styles.css (--red, --sticker)
RED = np.array((0xA8, 0x32, 0x2D), np.float32)
CREAM = np.array((0xFF, 0xF8, 0xEC), np.float32)
# sticker edge in pixels of a 720 px video frame (stills are scaled to match)
GAP = 6.5    # cream border
LINE = 4.0   # red line outside it
WOBBLE = 1.6  # how far the red line wanders in and out, like a hand-drawn line


def key(rgb):
    """Alpha matte for a green-screen frame. Background is green touching the frame edge, plus
    enclosed gaps (between an arm and a body) that are pure screen green. Drawn green leaves
    (garlands, the haldi skirt) are a duller green with red in them, so they are kept."""
    a = rgb.astype(np.int16)
    spill = a[..., 1] - np.maximum(a[..., 0], a[..., 2])
    core = spill > 60
    labels, count = ndimage.label(core)
    edge_ids = np.unique(np.concatenate([labels[0], labels[-1], labels[:, 0], labels[:, -1]]))
    medians = ndimage.median(spill, labels, np.arange(1, count + 1)) if count else []
    screen_ids = np.arange(1, count + 1)[np.asarray(medians) > 150]
    bg = np.isin(labels, np.union1d(edge_ids[edge_ids > 0], screen_ids))
    near = ndimage.binary_dilation(bg, iterations=4)  # outline anti-aliasing next to the background
    soft = 1 - np.clip((spill - 15) / 70, 0, 1)
    alpha = np.where(bg, 0.0, np.where(near, soft, 1.0))
    out = a.copy()
    # despill: pull the green tint out of the edge pixels
    out[..., 1] = np.where(near, np.minimum(a[..., 1], np.maximum(a[..., 0], a[..., 2])), a[..., 1])
    return out.clip(0, 255).astype(np.uint8), alpha


_fields = {}


def fields(shape, scale):
    """Fixed noise, the same for every frame: a slow wobble for the line's width and a fine grain
    that makes the red look like crayon on paper."""
    k = (shape, scale)
    if k not in _fields:
        rng = np.random.default_rng(7)
        wob = ndimage.gaussian_filter(rng.standard_normal(shape), 9 * scale)
        wob /= np.abs(wob).max() or 1
        grain = ndimage.gaussian_filter(rng.random(shape), 0.6)
        grain = (grain - grain.min()) / (np.ptp(grain) or 1)
        _fields[k] = (wob.astype(np.float32), grain.astype(np.float32))
    return _fields[k]


def sticker(rgb, alpha, scale=1.0):
    """Put the cut-out on a cream border with a red line round it. Returns straight colour + alpha."""
    solid = alpha > 0.5
    if not solid.any():
        return rgb, alpha
    dist = ndimage.distance_transform_edt(~solid).astype(np.float32)
    wob, grain = fields(alpha.shape, scale)
    gap, line = GAP * scale, LINE * scale
    a_cream = np.clip(gap + 0.5 - dist, 0, 1)
    a_red = np.clip(gap + line + WOBBLE * scale * wob + 0.5 - dist, 0, 1)
    red = RED * (0.86 + 0.24 * grain[..., None])  # crayon grain
    # red line, cream on top of it, then the couple on top of both
    c1 = CREAM * a_cream[..., None] + red * (a_red * (1 - a_cream))[..., None]
    a1 = a_cream + a_red * (1 - a_cream)
    a = alpha.astype(np.float32)
    c = rgb.astype(np.float32) * a[..., None] + c1 * (1 - a)[..., None]
    out_a = a + a1 * (1 - a)
    colour = np.where(out_a[..., None] > 0, c / np.maximum(out_a, 1e-6)[..., None], 0)
    return colour.clip(0, 255).astype(np.uint8), out_a


def still(scene):
    """The square still from assets/video-input/, or else the bottom square of the 9:16 still in
    assets/video-input-9x16/ (the couple stands in the bottom of the portrait frame)."""
    src = SRC / 'video-input' / f'{scene}.png'
    tall = SRC / 'video-input-9x16' / f'{scene}.png'
    if src.exists():
        im = Image.open(src).convert('RGB')
    elif tall.exists():
        im = Image.open(tall).convert('RGB')
        w, h = im.size
        im = im.crop((0, max(h - w, 0), w, h))
    else:
        return False
    im = im.resize((STILL_SIZE, STILL_SIZE), Image.LANCZOS)
    rgb, alpha = sticker(*key(np.asarray(im)), scale=STILL_SIZE / VIDEO_SIZE)
    rgba = np.dstack([rgb, (alpha * 255).round().astype(np.uint8)])
    Image.fromarray(rgba, 'RGBA').save(OUT / 'couple' / f'{scene}.webp', quality=88, method=6)
    return True


def remove_watermark(frame, alpha):
    """Undo the Gemini sparkle: it is white blended at a fixed spot (x 560, y 1120 on a
    720x1280 frame) with the opacity map in tools/gemini-watermark-alpha.png."""
    x, y = WATERMARK_AT
    s = alpha.shape[0]
    patch = frame[y:y + s, x:x + s].astype(np.float32)
    a = alpha[..., None]
    frame[y:y + s, x:x + s] = ((patch - 255 * a) / (1 - a)).round().clip(0, 255).astype(np.uint8)


def video(scene):
    """Square videos (1:1) are used as they are. Portrait Gemini videos (9:16, made from
    assets/video-input-9x16/) get the watermark removed, then the loops are cropped back to the
    square the couple stands in; `finale` stays full-screen because its camera move fills the frame.

    Phones can't play transparent video everywhere, so each frame is stored as colour on the left
    and its transparency (white = solid) on the right of a normal MP4; site/alpha-video.js puts the
    two back together in the browser."""
    src = SRC / f'{scene}.mp4'
    if not src.exists():
        return False
    w, h = (int(v) for v in subprocess.check_output(
        ['ffprobe', '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height', '-of', 'csv=p=0', str(src)]
    ).decode().strip().split(','))
    portrait = h > w
    if portrait and (w, h) != (720, 1280):
        raise SystemExit(f'{src.name}: expected a 720x1280 Gemini video, got {w}x{h}')
    fullscreen = portrait and scene == 'finale'
    out_w, out_h = (720, 1280) if fullscreen else (VIDEO_SIZE, VIDEO_SIZE)
    alpha = np.asarray(Image.open(WATERMARK_ALPHA), np.float32) / 255 if portrait else None
    dec = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-i', str(src), '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'],
        stdout=subprocess.PIPE)
    enc = subprocess.Popen(
        ['ffmpeg', '-v', 'error', '-y', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', f'{out_w * 2}x{out_h}', '-r', '24', '-i', '-',
         '-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-preset', 'slow', '-crf', '24',
         '-pix_fmt', 'yuv420p', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709',
         '-movflags', '+faststart', '-an', str(OUT / 'couple' / f'{scene}.mp4')],
        stdin=subprocess.PIPE)
    while True:
        buf = dec.stdout.read(w * h * 3)
        if len(buf) < w * h * 3:
            break
        frame = np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()
        if portrait:
            remove_watermark(frame, alpha)
            if not fullscreen:
                frame = frame[h - w:]  # the couple's square sits at the bottom of the 9:16 frame
        if frame.shape[:2] != (out_h, out_w):
            frame = np.asarray(Image.fromarray(frame).resize((out_w, out_h), Image.LANCZOS))
        rgb, matte = sticker(*key(frame))
        alpha_half = np.repeat((matte * 255).round().astype(np.uint8)[..., None], 3, axis=2)
        enc.stdin.write(np.concatenate([rgb, alpha_half], axis=1).tobytes())
    enc.stdin.close()
    enc.wait()
    dec.wait()
    return True


def decos():
    """The white line art from the first invite, recoloured to crayon red with a little grain."""
    for src in sorted((SRC / 'deco-clean').glob('deco-*.png')):
        im = Image.open(src).convert('RGBA')
        w = 720
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        a = np.asarray(im, np.float32)[..., 3]
        _, grain = fields(a.shape, 0.5)
        rgb = np.broadcast_to(RED, a.shape + (3,))
        alpha = a * (0.78 + 0.22 * grain)
        out = np.dstack([rgb, alpha]).round().clip(0, 255).astype(np.uint8)
        Image.fromarray(out, 'RGBA').save(OUT / 'deco' / f'{src.stem.removeprefix("deco-")}.webp', quality=90, method=6)


def music():
    """The song loops, so it gets a short fade-in and a 2 s fade-out to make the restart smooth."""
    src = SRC / 'music.mp3'
    if not src.exists():
        return
    length = float(subprocess.check_output(
        ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(src)]).decode())
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-i', str(src),
                    '-af', f'afade=t=in:d=0.3,afade=t=out:st={length - 2:.2f}:d=2',
                    '-c:a', 'libmp3lame', '-b:a', '192k', str(OUT / 'music.mp3')], check=True)


def main():
    only = sys.argv[1:]
    for name in only:
        if name not in SCENES:
            raise SystemExit(f'unknown scene {name!r}; scenes are: {", ".join(SCENES)}')
    (OUT / 'couple').mkdir(parents=True, exist_ok=True)
    (OUT / 'deco').mkdir(parents=True, exist_ok=True)
    path = OUT / 'manifest.json'
    manifest = json.loads(path.read_text()) if path.exists() else {}
    manifest = {'stills': manifest.get('stills', []), 'videos': manifest.get('videos', []), 'durations': manifest.get('durations', {})}
    for scene in only or SCENES:
        for kind in ('stills', 'videos'):
            if scene in manifest[kind]:
                manifest[kind].remove(scene)
        manifest['durations'].pop(scene, None)
        if still(scene):
            manifest['stills'].append(scene)
        if video(scene):
            manifest['videos'].append(scene)
            manifest['durations'][scene] = round(float(subprocess.check_output(
                ['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', str(OUT / 'couple' / f'{scene}.mp4')]
            ).decode()), 2)
        print(f'{scene:11} still={scene in manifest["stills"]} video={scene in manifest["videos"]}')
    if not only:
        decos()
        music()
    order = {s: i for i, s in enumerate(SCENES)}
    for kind in ('stills', 'videos'):
        manifest[kind].sort(key=order.get)
    path.write_text(json.dumps(manifest, indent=2) + '\n')


if __name__ == '__main__':
    main()
