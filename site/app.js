import config from './config.js';
import { validateRsvp, submitRsvp } from './rsvp.js';
import { createAlphaVideo } from './alpha-video.js';

const app = document.getElementById('app');
const music = document.getElementById('music');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- which guest list this link is for ----------
const params = new URLSearchParams(location.search);
const inviteName = config.invites[params.get('invite')] ? params.get('invite') : config.defaultInvite;
const invite = config.invites[inviteName];
const manifest = await fetch('media/manifest.json').then((r) => r.json()).catch(() => ({}));
const stills = manifest.stills || [];
const videos = manifest.videos || [];
const durations = manifest.durations || {};
// width / height of each couple picture: 1 for most; the intro and Ganpati Sthapna are taller
const ratios = manifest.ratios || {};
// pictures that reach the side edges (Grah Shanti): RSVP cards show these whole, without zooming in
const edges = manifest.edges || [];
const showWhole = (art) => (ratios[art] || 1) < 0.99 || edges.includes(art);

// a scene waiting to be made (Ganpati Sthapna, Grah Shanti) shows its fallback until its picture exists
const artFor = (e) => (e.fallback && !e.art.every((a) => stills.includes(a)) ? e.fallback : e.art);
const events = invite.events.map((id) => { const e = { id, ...config.events[id] }; return { ...e, art: artFor(e) }; });
const saveDates = [].concat(invite.saveDate || config.saveDate).sort();

const [nameA, nameB] = config.couple;
let guest = load('guest-name') || '';

// ---------- formatting ----------
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const toDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return new Date(y, m - 1, d); };
const ordinal = (n) => n + (n % 10 === 1 && n !== 11 ? 'st' : n % 10 === 2 && n !== 12 ? 'nd' : n % 10 === 3 && n !== 13 ? 'rd' : 'th');
const shortDate = (iso) => { const d = toDate(iso); return `${ordinal(d.getDate())} ${MONTHS[d.getMonth()].slice(0, 3)}`; };
const pad = (n) => String(n).padStart(2, '0');
function fmtTime(hm) {
  const [h, m] = hm.split(':').map(Number);
  if (h === 0 && m === 0) return 'midnight';
  return `${h % 12 || 12}${m ? ':' + String(m).padStart(2, '0') : ''}${h < 12 ? 'am' : 'pm'}`;
}
const when = (e) => fmtTime(e.start) + (e.onwards ? ' onwards' : '');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const firstName = () => esc(guest.trim().split(/\s+/)[0] || '');

// ---------- small drawings (all in crayon red) ----------
// The heart logo with both names, drawn as a wobbly outline like the inspiration's doodles.
function heart(cls = '') {
  return `<svg class="heart ${cls}" viewBox="0 0 220 200" role="img" aria-label="${nameA} and ${nameB}">
    <path class="heart__fill" filter="url(#rough)" d="M110 188 C 40 140, 6 100, 10 58 C 14 22, 52 6, 80 18 C 96 25, 106 38, 110 50 C 114 38, 124 25, 140 18 C 168 6, 206 22, 210 58 C 214 100, 180 140, 110 188 Z"/>
    <path class="heart__line" filter="url(#rough)" d="M108 186 C 42 141, 8 101, 11 60 C 13 22, 50 7, 79 17 C 97 24, 105 36, 111 52 C 115 36, 126 24, 141 17 C 170 7, 207 24, 209 60 C 212 101, 178 140, 112 187"/>
    <g transform="rotate(-10 110 95)" fill="currentColor" font-family="'Caveat Brush', cursive" text-anchor="middle">
      <text x="108" y="86" font-size="40">${nameA} +</text>
      <text x="114" y="126" font-size="37">${nameB}</text>
    </g>
  </svg>`;
}
const squiggle = `<svg class="squiggle" viewBox="0 0 240 14" aria-hidden="true"><path d="M3 8 C 30 2, 50 13, 80 7 S 130 2, 160 8 S 210 12, 237 6" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round"/></svg>`;
const underline = `<svg class="underline" viewBox="0 0 300 16" aria-hidden="true"><path d="M8 10 C 70 4, 150 3, 292 8" fill="none" stroke="currentColor" stroke-width="4.5" stroke-linecap="round"/></svg>`;
const pin = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z" fill="currentColor"/><circle cx="12" cy="10" r="2.6" fill="var(--paper)"/></svg>`;
const HEART_PATH = 'M12 21 C 5 15.5, 1.5 11.5, 2.2 7.2 C 2.9 3.6, 7.3 2.4, 9.6 5 C 10.6 6.1, 11.4 7.4, 12 8.6 C 12.8 6.8, 14 5, 16 4.2 C 19.6 2.9, 23 5.6, 21.6 9.8 C 20.6 13, 17 16.6, 12.6 20.6';
const doodleHeart = (style, cls = '') => `<svg class="doodle ${cls}" style="${style}" viewBox="0 0 24 24" aria-hidden="true"><path d="${HEART_PATH}" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
// hand-drawn hearts dotted down the sides of a screen (never over the words in the middle)
function doodles(n = 4, top = 8, bottom = 60) {
  let out = '';
  for (let i = 0; i < n; i++) {
    const left = i % 2 === 0;
    const x = left ? 4 + Math.random() * 9 : 85 + Math.random() * 8;
    const y = top + ((i + Math.random() * 0.8) / n) * (bottom - top);
    const s = 18 + Math.random() * 12;
    const r = (Math.random() * 40 - 20).toFixed(0);
    out += doodleHeart(`left:${x.toFixed(1)}%;top:${y.toFixed(1)}%;width:${s.toFixed(0)}px;--r:${r}deg;animation-delay:${(0.4 + i * 0.18).toFixed(2)}s`);
  }
  return out;
}

// The couple: the video where there is one (see tools/prepare_assets.py), otherwise the still
// with a little idle wiggle so the screen never feels frozen. Every picture already carries the
// cream + red "sticker" edge.
const IDLE = { intro: 'giggle', haldi: 'giggle', ganpati: 'bow', grahshanti: 'bow', engagement: 'giggle', baraat: 'dance', wedding: 'bow', reception: 'sway', afterparty: 'dance', thanks: 'wave', finale: 'none' };
// With a video, the still stays underneath until the video is actually playing, so a slow
// connection shows the picture instead of an empty screen.
const alphaVideo = createAlphaVideo();
const hasVideo = (art) => alphaVideo !== null && videos.includes(art);
const playsVideo = (arts) => arts.every(hasVideo);
// arts: one clip, or several that play one after the other. The last one loops unless `loop` is off.
function couple(arts, cls = '', { loop = true, still = false } = {}) {
  const first = arts[0];
  const video = !still && playsVideo(arts);
  const img = video
    ? `<img class="couple__still" src="media/couple/${first}.webp" alt="">`
    : `<img class="couple__media idle-${IDLE[first] || 'giggle'}" src="media/couple/${first}.webp" alt="">`;
  // only the intro loads straight away; each later video starts loading a screen ahead (see go())
  const clips = video
    ? arts.map((a, i) => `<video class="couple__media" src="media/couple/${a}.mp4" muted playsinline ${loop && i === arts.length - 1 ? 'loop' : ''} preload="${a === 'intro' ? 'auto' : 'none'}"></video>`).join('')
    : '';
  return `<div class="couple ${clips ? 'couple--video' : ''} ${cls}" style="--ar:${ratios[first] || 1}"><div class="couple__pop">${img}${clips}</div></div>`;
}
// how long a run of clips takes to play once (ms); 0 when they won't play as video
const clipsTime = (arts) => (playsVideo(arts) ? arts.reduce((t, a) => t + (durations[a] || 0), 0) * 1000 : 0);

// ---------- screens ----------
function introScreen() {
  return {
    auto: true,
    duration: config.timing.intro,
    html: `<section class="scene scene--intro">
      ${doodles(4, 10, 46)}
      <div class="intro__top">
        <p class="intro__hey anim a1">${firstName() ? `Hey ${firstName()}!` : 'Hey there!'}</p>
        ${heart('heart--big anim pop a2')}
        <p class="intro__line anim a3">are getting married!</p>
      </div>
      ${couple(['intro'], 'couple--bleed')}
    </section>`,
  };
}

// Laid out like the groom's side invite (in this invite's own style): SAVE / the / DATE stacked
// down the middle, then the names, the big day, month and year, a drawn underline and the
// countdown, all centred on the page. No picture on this screen.
function saveScreen() {
  const dates = saveDates.map(toDate);
  const d = dates[0];
  const daysLeft = Math.ceil((d - new Date()) / 864e5);
  const when = dates.length === 1
    ? `<p class="save__day">${pad(d.getDate())}</p><p class="save__month">${MONTHS[d.getMonth()].toUpperCase()} &bull; ${d.getFullYear()}</p>`
    : `<p class="save__days">${dates.map((x) => `${pad(x.getDate())} ${MONTHS[x.getMonth()].slice(0, 3).toUpperCase()}`).join(' <span>&amp;</span> ')}</p><p class="save__month">${d.getFullYear()}</p>`;
  const letters = (word, start) => [...word].map((c, i) => `<span style="--i:${start + i}">${c}</span>`).join('');
  return {
    auto: true,
    duration: config.timing.save,
    onEnter: () => setTimeout(() => burst(0.45), 900),
    html: `<section class="scene scene--save">
      ${doodleHeart('left:8%;top:9%;width:26px;--r:-14deg;animation-delay:.9s')}
      ${doodleHeart('right:12%;top:12%;width:22px;--r:10deg;animation-delay:1.05s')}
      ${doodleHeart('left:10%;bottom:8%;width:22px;--r:-8deg;animation-delay:1.2s')}
      ${doodleHeart('right:8%;bottom:5%;width:28px;--r:14deg;animation-delay:1.35s')}
      <h2 class="save__title" aria-label="Save the date">
        <span class="save__big crayon">${letters('SAVE', 0)}</span>
        <span class="save__the crayon">the</span>
        <span class="save__big crayon">${letters('DATE', 4)}</span>
      </h2>
      <p class="save__names anim a3">${nameA} + ${nameB}</p>
      <div class="save__when anim pop a4">${when}</div>
      <div class="save__line draw a5">${underline}</div>
      ${daysLeft > 0 ? `<p class="save__count anim pop a6">${daysLeft} days to go!</p>` : ''}
    </section>`,
  };
}

function eventScreen(e) {
  const d = toDate(e.date);
  // a single clip loops; a pair (or a clip leading into the lift-and-spin) plays once through and holds its last frame
  const loop = e.art.length === 1 && !e.finale;
  const time = clipsTime(e.art);
  return {
    auto: true,
    // two clips (or one that leads into the finale) keep the screen up until they've played
    duration: e.art.length > 1 || e.finale ? Math.max(config.timing.event, time + 500) : config.timing.event,
    html: `<section class="scene scene--event">
      <img class="deco" src="media/deco/${e.deco}.webp" alt="">
      <div class="event__top">
        ${heart('heart--small anim pop a1')}
        <h2 class="event__title write a2">${esc(e.label)}</h2>
        ${e.sub ? `<p class="event__sub anim a3">${esc(e.sub)}</p>` : ''}
        <p class="event__when anim a3">${DAYS[d.getDay()]}, ${shortDate(e.date)} &middot; ${e.detail ? fmtTime(e.start) : when(e)}</p>
        ${e.detail ? `<p class="event__detail anim a3">${esc(e.detail)}</p>` : ''}
        <div class="event__line draw a4">${squiggle}</div>
        <p class="event__venue anim a4">${esc(e.venue)}</p>
        <p class="event__city anim a5">${esc(e.city)}</p>
        ${e.map ? `<a class="map-pill anim pop a6 no-tap" href="${e.map}" target="_blank" rel="noopener">${pin}Directions</a>` : ''}
      </div>
      ${couple(e.art, '', { loop })}
    </section>`,
  };
}

// The lift and spin. As a video it fills the screen (the camera rises and rushes into their
// faces) and plays once; as a still, CSS zooms into their faces instead.
function finaleScreen(deco) {
  const video = hasVideo('finale');
  return {
    auto: true,
    duration: video ? Math.round(durations.finale * 1000) + 300 : config.timing.finale,
    html: `<section class="scene scene--finale">
      ${video ? '' : `<img class="deco" src="media/deco/${deco}.webp" alt="">`}
      ${couple(['finale'], video ? 'couple--full' : 'couple--center', { loop: false })}
      ${video ? `<img class="deco deco--fadeout" src="media/deco/${deco}.webp" alt="">` : ''}
    </section>`,
  };
}

function rsvpScreen() {
  const cards = events.map((e) => `
    <button type="button" class="card" data-title="${esc(e.title)}" aria-pressed="${events.length === 1}">
      <span class="card__art"><img ${showWhole(e.art[e.art.length - 1]) ? 'class="card__img--whole" ' : ''}src="media/couple/${e.art[e.art.length - 1]}.webp" alt=""></span>
      <span class="card__label">${esc(e.label)}</span>
      <span class="card__date">${DAYS[toDate(e.date).getDay()]}, ${shortDate(e.date)} &middot; ${when(e)}</span>
      <span class="card__tick" aria-hidden="true">&#10003;</span>
    </button>`).join('');
  return {
    auto: false,
    html: `<section class="scene scene--rsvp">
      <img class="deco deco--soft" src="media/deco/rsvp.webp" alt="">
      <div class="rsvp__scroll">
        ${heart('heart--rsvp anim pop a1')}
        <h2 class="rsvp__title anim a2"><span class="crayon">Padharo Sa!</span> <span class="rsvp__now">we await you</span></h2>
        <form class="rsvp__form anim a3" novalidate>
          <label class="field">
            <span class="field__label">Your name</span>
            <input name="name" autocomplete="name" maxlength="80" required value="${esc(guest)}" placeholder="Type your name">
            <span class="field__error" data-for="name"></span>
          </label>
          <label class="field">
            <span class="field__label">Phone number</span>
            <input name="phone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" required value="${esc(load('guest-phone') || '')}" placeholder="+91 98765 43210">
            <span class="field__error" data-for="phone"></span>
          </label>
          <fieldset class="field">
            <legend class="field__label">${events.length > 1 ? 'Which celebrations will you join?' : 'Will you join us?'}</legend>
            <div class="cards ${events.length === 1 ? 'cards--one' : ''}">${cards}</div>
            <span class="field__error" data-for="events"></span>
          </fieldset>
          <label class="field">
            <span class="field__label">A note for ${nameA} &amp; ${nameB} <em>(optional)</em></span>
            <textarea name="message" rows="3" maxlength="500" placeholder="Wishes, blessings, dance requests…"></textarea>
            <span class="field__error" data-for="message"></span>
          </label>
          <input class="hp" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <button class="btn btn--send" type="submit">Send Wishes!</button>
          <p class="rsvp__status" role="status"></p>
        </form>
        <button type="button" class="link-btn replay">&#8634; Watch the invite again</button>
      </div>
    </section>`,
  };
}

function thanksScreen() {
  return {
    auto: false,
    html: `<section class="scene scene--thanks">
      <img class="deco" src="media/deco/engagement.webp" alt="">
      <div class="thanks__top">
        ${heart('heart--small anim pop a1')}
        <h2 class="thanks__title anim pop a2">Thank you<span class="thanks__name"></span>!</h2>
        <p class="thanks__line anim a3">Your wishes have reached us. We can't wait to celebrate with you!</p>
        <p class="thanks__see anim a4"></p>
        <button type="button" class="link-btn replay anim a5">&#8634; Watch the invite again</button>
      </div>
      ${couple(['thanks'])}
    </section>`,
  };
}

function gateScreen() {
  return `<section class="gate is-active">
    ${doodles(6, 8, 80)}
    <div class="gate__inner">
      ${heart('heart--gate')}
      <p class="gate__kicker">You're invited!</p>
      <form class="gate__form">
        <label for="guest" class="gate__label">Your name</label>
        <input id="guest" name="guest" autocomplete="name" maxlength="80" placeholder="Type your name" value="${esc(guest)}">
        <button class="btn" type="submit">Open Invitation</button>
      </form>
      <p class="gate__hint">&#9835; Best with sound on</p>
    </div>
  </section>`;
}

// ---------- assemble ----------
const screens = [introScreen(), saveScreen()];
for (const e of events) {
  screens.push(eventScreen(e));
  if (e.finale) screens.push(finaleScreen(e.deco));
}
screens.push(rsvpScreen());
const thanks = thanksScreen();
screens.push(thanks);
const autoCount = screens.filter((s) => s.auto).length;

app.innerHTML = `
  <svg class="defs" aria-hidden="true" focusable="false">
    <filter id="rough"><feTurbulence type="fractalNoise" baseFrequency="0.045" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="4"/></filter>
    <filter id="crayon-line" x="-2%" y="-2%" width="104%" height="104%">
      <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="8" result="wob"/>
      <feDisplacementMap in="SourceGraphic" in2="wob" scale="3.5" result="moved"/>
      <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="1" seed="2" result="grain"/>
      <feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.4 2.15" result="grainA"/>
      <feComposite in="moved" in2="grainA" operator="in"/>
    </filter>
  </svg>
  ${gateScreen()}
  ${screens.map((s) => s.html).join('')}
  <div class="frame" aria-hidden="true"><svg><path filter="url(#crayon-line)"/></svg></div>
  <div class="bars" aria-hidden="true">${'<span class="bar"><i></i></span>'.repeat(autoCount)}</div>
  <button type="button" class="sound no-tap" aria-label="Sound off">
    <svg class="sound__on" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
    <svg class="sound__off" viewBox="0 0 24 24"><path d="M4 9v6h4l5 4V5L8 9H4z" fill="currentColor"/><path d="M16.5 9.5l5 5m0-5l-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
  </button>
  <p class="tap-hint" aria-hidden="true">Tap to skip &rsaquo;</p>`;

const gate = app.querySelector('.gate');
const sceneEls = [...app.querySelectorAll('.scene')];
screens.forEach((s, i) => { s.el = sceneEls[i]; });
const bars = [...app.querySelectorAll('.bar i')];
const soundBtn = app.querySelector('.sound');

// ---------- the hand-drawn border round every screen ----------
// Each side is its own slightly wandering stroke that runs a little past the corners, like a
// line drawn with a crayon and a ruler you don't quite trust.
const frame = app.querySelector('.frame');
function drawFrame() {
  const { width: w, height: h } = frame.getBoundingClientRect();
  if (!w || !h) return;
  const svg = frame.querySelector('svg');
  svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
  let seed = 11;
  const rand = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647 - 0.5; };
  const side = (x0, y0, x1, y1) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / 38));
    const nx = -(y1 - y0) / len, ny = (x1 - x0) / len; // perpendicular
    let off = 0;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      off = off * 0.6 + rand() * 2.4;
      const x = x0 + (x1 - x0) * t + nx * off, y = y0 + (y1 - y0) * t + ny * off;
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return d;
  };
  const p = 3, o = 5; // inset, overshoot past the corners
  frame.querySelector('path').setAttribute('d', [
    side(p - o, p + 1, w - p + o * 0.4, p - 1),
    side(w - p, p - o * 0.6, w - p + 1, h - p + o),
    side(w - p + o * 0.5, h - p, p - o, h - p + 1),
    side(p + 1, h - p + o * 0.3, p - 1, p - o),
  ].join(' '));
}
drawFrame();
new ResizeObserver(drawFrame).observe(frame);

// ---------- playback ----------
let index = -1;
let elapsed = 0;
let held = false;

function stopVideos(s) {
  s.el.querySelectorAll('video').forEach((v) => { v.onended = null; v.pause(); });
  s.el.querySelector('.couple')?.classList.remove('is-playing');
  s.current = null;
  s.waiting = false;
}

// Plays a screen's clips in order: each one once, then the next; the last one loops if it was
// told to. The canvas keeps the last frame of one clip until the next has a frame to show.
function playClips(s) {
  const vids = [...s.el.querySelectorAll('video')];
  if (!vids.length || !alphaVideo) return;
  const box = vids[0].closest('.couple');
  vids.forEach((v) => { v.preload = 'auto'; });
  const start = (k) => {
    const v = vids[k];
    s.current = v;
    s.waiting = !(k === vids.length - 1 && v.loop); // still has a clip to finish
    v.currentTime = 0;
    v.onended = () => {
      if (screens[index] !== s || s.current !== v) return;
      if (k + 1 < vids.length) start(k + 1);
      else s.waiting = false;
    };
    if (!held) v.play().catch(() => {});
    alphaVideo.attach(v, v.parentElement, () => box.classList.add('is-playing'), { keep: k > 0 });
  };
  start(0);
}

function go(i) {
  if (i < 0 || i >= screens.length) return;
  const prev = screens[index];
  if (prev) {
    prev.el.classList.remove('is-active', 'play');
    stopVideos(prev);
    alphaVideo?.detach();
  }
  index = i;
  elapsed = 0;
  const s = screens[i];
  s.el.classList.add('is-active');
  void s.el.offsetWidth; // restart the entrance animations
  s.el.classList.add('play');
  screens.slice(i + 1, i + 3).forEach((next) => next.el.querySelectorAll('video').forEach((nv) => { nv.preload = 'auto'; }));
  playClips(s);
  if (s.el.querySelector('.rsvp__scroll')) s.el.querySelector('.rsvp__scroll').scrollTop = 0;
  app.classList.toggle('is-auto', s.auto);
  app.classList.toggle('is-form', !s.auto);
  updateBars();
  s.onEnter?.();
}

function updateBars() {
  const s = screens[index];
  bars.forEach((b, i) => {
    const fill = !s.auto || i < index ? 1 : i === index ? Math.min(elapsed / s.duration, 1) : 0;
    b.style.transform = `scaleX(${fill})`;
  });
}

let last = 0;
function tick(t) {
  const dt = last ? Math.min(t - last, 100) : 0;
  last = t;
  const s = screens[index];
  if (s && s.auto && !held && !document.hidden) {
    elapsed += dt;
    updateBars();
    // a slow connection can hold a clip back: wait up to 4 s more for it to finish
    if (elapsed >= s.duration && (!s.waiting || elapsed >= s.duration + 4000)) go(index + 1);
  }
  requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// Tap right to skip, tap left to go back, press and hold to pause (like stories)
let holdTimer = 0;
let pressed = false;
app.addEventListener('pointerdown', (ev) => {
  const s = screens[index];
  if (!s?.auto || ev.target.closest('.no-tap')) return;
  pressed = true;
  holdTimer = setTimeout(() => { held = true; app.classList.add('is-held'); s.current?.pause(); }, 220);
});
app.addEventListener('pointerup', (ev) => {
  if (!pressed) return;
  pressed = false;
  clearTimeout(holdTimer);
  if (held) { held = false; app.classList.remove('is-held'); screens[index].current?.play().catch(() => {}); return; }
  const r = app.getBoundingClientRect();
  go(ev.clientX - r.left < r.width * 0.3 ? Math.max(index - 1, 0) : index + 1);
});
app.addEventListener('pointercancel', () => {
  pressed = false;
  clearTimeout(holdTimer);
  if (held) { held = false; app.classList.remove('is-held'); screens[index]?.current?.play().catch(() => {}); }
});
app.addEventListener('contextmenu', (ev) => { if (screens[index]?.auto) ev.preventDefault(); });

// ---------- opening ----------
gate.querySelector('form').addEventListener('submit', (ev) => {
  ev.preventDefault();
  guest = gate.querySelector('input').value.trim();
  save('guest-name', guest);
  const hey = app.querySelector('.intro__hey');
  hey.textContent = firstName() ? `Hey ${guest.split(/\s+/)[0]}!` : 'Hey there!';
  app.querySelector('.rsvp__form [name=name]').value = guest;
  music.volume = 0.6;
  music.play().then(() => setSound(true)).catch(() => setSound(false));
  gate.classList.add('is-leaving');
  burst(0.8);
  setTimeout(() => gate.remove(), 700);
  go(0);
});

function setSound(on) {
  soundBtn.classList.toggle('is-off', !on);
  soundBtn.setAttribute('aria-label', on ? 'Sound off' : 'Sound on');
}
soundBtn.addEventListener('click', () => {
  if (music.paused) music.play().then(() => setSound(true)).catch(() => {});
  else { music.pause(); setSound(false); }
});
document.addEventListener('visibilitychange', () => {
  if (document.hidden) music.pause();
  else if (!soundBtn.classList.contains('is-off') && index >= 0) music.play().catch(() => {});
});

app.querySelectorAll('.replay').forEach((b) => b.addEventListener('click', () => go(0)));

// ---------- RSVP ----------
const form = app.querySelector('.rsvp__form');
form.querySelectorAll('.card').forEach((card) => card.addEventListener('click', () => {
  card.setAttribute('aria-pressed', card.getAttribute('aria-pressed') !== 'true');
  form.querySelector('[data-for=events]').textContent = '';
}));
form.addEventListener('input', (ev) => {
  const err = form.querySelector(`.field__error[data-for="${ev.target.name}"]`);
  if (err) err.textContent = '';
});
form.addEventListener('submit', async (ev) => {
  ev.preventDefault();
  const data = {
    name: form.elements.name.value,
    phone: form.elements.phone.value,
    message: form.elements.message.value,
    events: [...form.querySelectorAll('.card[aria-pressed=true]')].map((c) => c.dataset.title),
    invited: events.map((e) => e.title),
    invite: inviteName,
    website: form.elements.website.value,
  };
  const errors = validateRsvp(data);
  form.querySelectorAll('.field__error').forEach((el) => { el.textContent = errors[el.dataset.for] || ''; });
  if (Object.keys(errors).length) {
    form.querySelector('.field__error:not(:empty)')?.closest('.field').scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }
  const btn = form.querySelector('.btn--send');
  const status = form.querySelector('.rsvp__status');
  btn.disabled = true;
  btn.textContent = 'Sending…';
  status.textContent = '';
  try {
    await submitRsvp(data, config.rsvp.endpoint);
    guest = data.name.trim();
    save('guest-phone', data.phone.trim());
    save('guest-name', guest);
    showThanks(data.events);
  } catch (err) {
    console.error(err);
    status.textContent = "Oops, that didn't go through. Please check your connection and try again.";
  } finally {
    btn.disabled = false;
    btn.textContent = 'Send Wishes!';
  }
});

function showThanks(titles) {
  const first = events.filter((e) => titles.includes(e.title)).sort((a, b) => (a.date + a.start).localeCompare(b.date + b.start))[0];
  thanks.el.querySelector('.thanks__name').textContent = guest ? `, ${guest.split(/\s+/)[0]}` : '';
  thanks.el.querySelector('.thanks__see').textContent = first ? `See you on ${shortDate(first.date)}!` : 'See you soon!';
  go(screens.indexOf(thanks));
  burst(1);
  setTimeout(() => burst(0.6), 900);
}

// ---------- confetti ----------
function burst(power = 1) {
  if (reduceMotion || typeof window.confetti !== 'function') return;
  const colors = ['#A8322D', '#D9534A', '#F4B6A8', '#E9B44C', '#FFF8EC'];
  const r = app.getBoundingClientRect();
  const origin = (x) => ({ x: (r.left + r.width * x) / innerWidth, y: 0.55 });
  window.confetti({ particleCount: Math.round(90 * power), spread: 70, startVelocity: 42, origin: origin(0.15), angle: 60, colors, scalar: 0.9 });
  window.confetti({ particleCount: Math.round(90 * power), spread: 70, startVelocity: 42, origin: origin(0.85), angle: 120, colors, scalar: 0.9 });
}

// Checking one screen while editing: ?screen=3 skips the name gate and holds on screen 3
// (0 = intro, 1 = save the date, …). Guests never get this link.
if (params.has('screen')) {
  gate.remove();
  go(Math.min(Number(params.get('screen')) || 0, screens.length - 1));
  held = true;
}

// ---------- helpers ----------
function load(key) { try { return localStorage.getItem(key); } catch { return null; } }
function save(key, value) { try { localStorage.setItem(key, value); } catch {} }

// Warm the cache so every screen is ready when it arrives
for (const s of new Set(events.flatMap((e) => e.art).concat(['finale', 'thanks', 'intro']))) new Image().src = `media/couple/${s}.webp`;
for (const e of events) new Image().src = `media/deco/${e.deco}.webp`;
