# Asset prompts: Ganpati Sthapna and Grah Shanti (Aditi weds Yashwant, bride's side)

Every other scene reuses the couple clips from the groom's side invite (`shambhu-aditi2`).
Ganpati Sthapna and Grah Shanti are the two new scenes. Grah Shanti is done. Until the Ganpati
Sthapna clip exists, that screen shows the Haldi clip instead, so the invite works without it.

**You generate:** for each scene, one still and one short looping video.
**I handle:** the green-screen removal, the cream-and-red sticker edge (like the save-the-date
inspiration), cropping, and putting it into the invite.

---

## Rules (same as the first invite)

1. **References:** attach `assets/video-input-9x16/grahshanti.png` and `assets/video-input-9x16/wedding.png`
   so the couple, drawing style and framing match the other scenes exactly. Add
   `assets/ref/photo-couple-1.png` if the faces drift.
2. **Green screen:** flat, solid **#00FF00** background with no floor, no shadows and no gradient.
3. **No green or teal on the couple or the props.** That means **no mango or betel leaves, no
   green tulsi, no durva grass, no green clothes**: anything green disappears with the background.
4. **Portrait 9:16** (1080×1920 is ideal). The scene fills the **bottom square** of the frame (the
   bottom 1080×1080). Keep the top part empty green, and leave a clear gap of green above the
   tallest head even while they move, or the hair gets sliced flat (that happened to the intro).
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

## `ganpati`: Ganpati Sthapna · Mon 30 Nov, 3pm

The first ceremony: welcoming Ganesha home. Standing (Grah Shanti is seated), with an aarti, so
the two puja screens look different.

- **Still** (style block, then):
  > Portrait 9:16 frame. In the bottom half, a small wooden chowki covered with a red cloth with a
  > gold border stands in the centre, and on it sits a cute, smiling Lord Ganesha idol in the same
  > cartoon style: orange-pink skin, a gold crown, a red-and-gold dhoti, a small modak in one
  > hand, a little brass plate of modaks and a marigold garland in front of him. Aditi stands on
  > the left of the chowki, Yashwant on the right, both turned slightly towards Ganesha and
  > smiling at the viewer. Aditi wears a bright orange-and-pink bandhani saree with a gold
  > border, the pallu over one shoulder, gold jhumkas, red bangles and a red bindi; she holds a
  > brass aarti thali with a lit diya, kumkum and a few rose petals in both hands at chest
  > height. Yashwant wears a saffron-orange kurta with white churidar and a red-and-gold dupatta
  > over his shoulders, with a red tilak; his right hand holds up a small brass bell and his
  > left hand is raised in a half namaste. Marigold strings hang on both sides of the chowki.
  > Full bodies visible, the whole group inside the bottom square of the frame, with empty green
  > above their heads and nothing touching the frame edges.
- **Motion** (motion block, then):
  > Aditi slowly circles the aarti thali in front of Ganesha in one gentle clockwise circle, the
  > diya flame flickering, while Yashwant rings the little bell with a soft wrist shake; a few
  > rose petals drift down onto the chowki. Then both turn their heads to the viewer with a big
  > happy smile. They finish back in exactly the starting pose.

### Save as

| File | What |
|---|---|
| `assets/video-input-9x16/ganpati.png` | the 9:16 still |
| `assets/ganpati.mp4` | the 720×1280 video (or a square 1:1 video, either works) |

Then run:

```bash
.venv/bin/python tools/prepare_assets.py ganpati
```

The Ganpati Sthapna screen switches from the Haldi stand-in to the new clip on its own. Check it at
`http://localhost:5180/?screen=2`.

### If the result isn't right

- **Ganesha looks too realistic or too odd:** add *"Ganesha drawn as a friendly, simple cartoon
  idol in the same marker-outline style as the couple, respectful and cheerful"*.
- **Something comes out green** (garland leaves, the dupatta): ask for it in orange, red, yellow
  or gold, or it will vanish when the green screen is removed.
- **The aarti circle drifts off and doesn't loop:** keep the motion smaller, e.g. *"a small,
  gentle aarti circle close to the chest"*, and use the still as both the first and last frame.

---

## `grahshanti`: Grah Shanti · Tue 1 Dec, 8am (done)

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
