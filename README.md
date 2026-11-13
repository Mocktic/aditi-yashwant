# Aditi weds Yashwant · e-invite (bride's side)

The bride's side version of the groom's side invite in `../shambhu-aditi2`. It works the same way
and reuses the same cartoon couple clips and music. The look comes from the save-the-date
inspiration (`inspiration.tiff`): cream paper, one crayon red for everything, hand-lettered words,
doodled hearts, a wobbly hand-drawn border, and the couple as photo-sticker cut-outs with a cream
and red edge.

The guest types their name and taps **Open Invitation**. The music starts, then each screen plays
by itself:

intro → Save the Date → one screen per event (Sangeet is followed by the lift-and-spin) → RSVP →
thank-you with confetti.

Tap right to skip, tap left to go back, press and hold to pause. On a laptop it shows as a
phone-width column.

## Run it

```bash
python3 tools/serve.py     # open http://localhost:5180 (also works from your phone on the same Wi-Fi)
```

`site/` is the whole website, plain static files with no build step. On **Vercel**, import this
folder with Framework Preset **Other** and no build command; `vercel.json` serves `site/` and keeps
search engines out.

To check a single screen while editing, add `?screen=N` (it skips the name screen and holds):
`0` intro, `1` Save the Date, then the events in order (on the full link: `2` Ganpati Sthapna,
`3` Grah Shanti, `4` Sagai, `5` Sangeet, `6` lift-and-spin, `7` Lagan Phere, `8` RSVP, `9` thank you).
It combines with `&invite=…`.

## Links to share

| Guests | Link | Events | Save the Date |
|---|---|---|---|
| Everyone (all the days) | `/` or `/?invite=all` | Ganpati Sthapna, Grah Shanti, Sagai, Sangeet Sandhya & Preetibhoj, Lagan Phere | 01.12.2026 |
| Puja | `/?invite=puja` | Ganpati Sthapna, Grah Shanti | 30.11.2026 |
| Sagai + Sangeet | `/?invite=sangeet` | Sagai, Sangeet Sandhya & Preetibhoj | 01.12.2026 |
| Wedding | `/?invite=wedding` | Lagan Phere | 02.12.2026 |

The link decides which event screens and RSVP cards the guest sees. Each link
has its own Save the Date date (`saveDate` on each link in `site/config.js`). Change the lists under `invites` in `site/config.js`.

## Changing content

Everything editable is in **`site/config.js`**: names, events (date, time, venue, map link), which
couple clip(s) each event plays, the guest lists, and how long each screen stays.

Every event is at **Bhairav Vatika**, Aashram ke peeche, Barisadri (`venue` at the top of the file,
with its Google Maps pin). Sangeet Sandhya & Preetibhoj shows "5pm" with a small line under it,
"Preetibhoj 5pm onwards · Sangeet 8pm" (`start`, `onwards` and `detail` on that event).

### Which clip plays where

| Screen | Clip(s) | Line art |
|---|---|---|
| Intro | `intro` | none |
| Save the Date | none (a postage-stamp card, same layout as the groom's side) | none |
| Ganpati Sthapna | `ganpati` (new, see below); `haldi` until it exists | marigolds and kalash |
| Grah Shanti | `grahshanti` (new, see below); `haldi` until it exists | mandap and havan |
| Sagai | `engagement` | balloons and hearts |
| Sangeet Sandhya & Preetibhoj | `reception` once, then the full-screen `finale` lift-and-spin | curtains and dinner tables |
| Lagan Phere | `baraat` once, then `wedding` | bunting, dhol and shehnai |
| Thank you | `thanks` | balloons and hearts |

Where an event lists two clips, the first plays once and then the second plays. The screen stays up
until both have finished, so neither gets cut off.

## The Ganpati Sthapna and Grah Shanti clips

They're the only new artwork. The prompts are in **`ASSET-PROMPTS.md`**. Save each still and video
where it says, then run the asset script for that scene:

```bash
python3 -m venv .venv && .venv/bin/pip install pillow numpy scipy   # first time only
.venv/bin/python tools/prepare_assets.py ganpati      # or grahshanti, or both
```

## Media and the asset script

`assets/` holds the raw green-screen stills and videos copied from the groom's side invite, plus
the line art and the song. It stays out of git; Vercel only needs `site/`.
`tools/prepare_assets.py` turns it into `site/media/`:

- removes the green screen,
- adds the cream border and hand-drawn red line round the couple, baked into every still and
  every video frame,
- stores each video as picture + transparency side by side (`site/alpha-video.js` recombines them
  so the paper shows behind the couple),
- redraws the white line art in crayon red,
- and fades the song in and out so the loop restarts smoothly.

Run it with no arguments to rebuild everything (about a minute and a half), or with scene names to
rebuild just those. It needs `ffmpeg` (`brew install ffmpeg`).

## RSVPs

They go to a **new Google Sheet for the bride's side**, kept apart from the groom's side RSVPs.

1. Create an empty Google Sheet (e.g. "Aditi weds Yashwant: bride's side RSVPs").
2. **Extensions → Apps Script**, replace the code with `tools/rsvp-apps-script.gs`, **Save**.
3. **Deploy → New deployment → Web app**. Execute as **Me**, Who has access **Anyone**. Deploy and
   allow access.
4. Copy the web app URL (ends in `/exec`). Opening it in a browser should say "RSVP sheet is
   connected". Paste it into `rsvp.endpoint` in `site/config.js`, send yourself a test RSVP, and
   check the row appears (delete it afterwards).

Until step 4 is done, RSVPs are only kept in the guest's own browser, so do it before sharing.

The sheet gets an **RSVPs** tab (time, name, events attending `A | B`, message, which link the
guest used, phone) and a **Summary** tab with a live count per event.

## Link preview (WhatsApp, Instagram, iMessage)

`site/preview.jpg` (1200×630) is a Save the Date card in the invite's style. To change it, edit
`tools/preview.html`, start the server, and run `bash tools/make-preview.sh` (set `PORT=` if the
server isn't on 5180).

The `og:` tags in `site/index.html` need the full address. Replace `https://YOUR-DOMAIN/` (5 places)
once the site is on its domain. WhatsApp caches previews, so after changing the picture share the
link with `?v=2` (then `?v=3`, …).
