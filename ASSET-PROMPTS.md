# Asset prompt: Grah Shanti (Aditi weds Yashwant, bride's side)

Every other scene reuses the couple clips from the groom's side invite (`shambhu-aditi2`). Grah
Shanti is the one new scene. Until it exists, that screen shows the Haldi clip instead, so the
invite works without it.

**You generate:** one still and one short looping video.
**I handle:** the green-screen removal, the cream-and-red sticker edge (like the save-the-date
inspiration), cropping, and putting it into the invite.

---

## Rules (same as the first invite)

1. **References:** attach `assets/video-input-9x16/haldi.png` and `assets/video-input-9x16/wedding.png`
   so the couple, drawing style and framing match the other scenes exactly. Add
   `assets/ref/photo-couple-1.png` if the faces drift.
2. **Green screen:** flat, solid **#00FF00** background with no floor, no shadows and no gradient.
3. **No green or teal on the couple or the props.** That means **no mango or betel leaves, no
   green tulsi, no green clothes**: anything green disappears with the background.
4. **Portrait 9:16** (1080×1920 is ideal). The couple and the havan fill the **bottom square** of
   the frame (the bottom 1080×1080). Keep the top part empty green.
5. **No text, letters or watermarks.**
6. **Video:** Gemini/Veo at 720×1280 (like the others), or any image-to-video tool. 4–5 s, camera
   fixed, and it must **loop smoothly**: use the still as both the start frame and the end frame
   (Kling *Start & End Frames*, Veo/Flow *Frames to Video*, Runway first + last frame, Luma *Loop*).

### Style block (paste first)

> Hand-drawn 2D cartoon in a playful indie wedding-invitation style: thick, slightly wobbly
> black marker outlines, flat bold colours, no gradients, almost no shading, simple rounded
> faces, small dot eyes, big happy grins, chunky expressive hands. Indian couple drawn exactly
> like the reference images: **Yashwant** is tall, with short black hair, a full dark beard and
> a wide warm grin, and no glasses. **Aditi** has long dark wavy hair past her shoulders, a huge
> open smile and a small red bindi, and no glasses. Solid flat #00FF00 green background, no
> ground, no shadows, no text.

### Motion block (paste first for the video)

> Hand-drawn 2D cel animation at 12 frames per second, with slight boiling line wobble like
> traditional animation. Camera completely still. Background stays flat solid green the whole
> time. Perfect seamless loop: the first frame and the last frame are identical. The characters
> start in the exact pose of the input image, perform the gesture, and return smoothly to that
> exact same pose, position, expression and framing at the end, with no drift and no zoom.

---

## `grahshanti`: Grah Shanti · Tue 1 Dec, 8am

- **Still** (style block, then):
  > Portrait 9:16 frame. In the bottom half, Aditi (on the left) and Yashwant (on the right) sit
  > cross-legged side by side on low wooden patlas, facing the viewer, in front of a small square
  > brass havan kund with a gentle orange fire and a little grey smoke curling up. Both have their
  > hands folded in namaste, eyes half closed and peaceful but smiling. Aditi wears a
  > maroon-and-gold traditional saree with the pallu over her head, gold jhumkas and a red bindi.
  > Yashwant wears a cream kurta with a maroon-and-gold dupatta over his shoulder and a red tilak.
  > A brass thali with marigold flowers, a diya and a small kalash sits beside the havan. Full
  > bodies visible, the whole group inside the bottom square of the frame, top of the frame
  > empty green.
- **Motion** (motion block, then):
  > Both lean in together and gently offer a pinch of samagri into the havan with their right
  > hands, the fire flickers up a little, then they bring their hands back to namaste and smile
  > at the viewer. They finish back in exactly the starting pose.

### Save as

| File | What |
|---|---|
| `assets/video-input-9x16/grahshanti.png` | the 9:16 still |
| `assets/grahshanti.mp4` | the 720×1280 video (or a square 1:1 video, either works) |

If you make a square still instead, save it as `assets/video-input/grahshanti.png`.

Then run:

```bash
.venv/bin/python tools/prepare_assets.py grahshanti
```

That's all: `site/config.js` already points the Grah Shanti screen at `grahshanti`, and the
screen switches from the Haldi stand-in to the new clip on its own. Check it with
`python3 tools/serve.py` and open `http://localhost:5180/?screen=3`.
