// All invitation content lives here. Edit this file to change names, events, venues or links.

// every event is at Bhairav Vatika
const venue = {
  venue: 'Bhairav Vatika',
  city: 'Aashram ke peeche, Barisadri, Rajasthan',
  map: 'https://maps.app.goo.gl/hFtgCET7Brw7Jw9c6',
};

export default {
  // bride's side: Aditi first
  couple: ['Aditi', 'Yashwant'],

  // date: YYYY-MM-DD · start: 24-hour HH:MM (IST) · onwards: show "5pm onwards" instead of "5pm"
  // detail: an optional small line under the date and time
  // title is the full name stored in the RSVP sheet; label (+ optional sub) is what shows on screen.
  // art: the couple clip(s) in media/couple/. Two clips play one after the other (the first once,
  //   then the second), and the screen stays up until both have played.
  // fallback: the clip to show until `art` exists (Ganpati Sthapna, Grah Shanti: see ASSET-PROMPTS.md).
  // finale: after this screen, the full-screen lift-and-spin plays.
  // deco: the red line-art frame in media/deco/.
  events: {
    ganpati: {
      title: 'Ganpati Sthapna',
      label: 'Ganpati Sthapna',
      date: '2026-11-30',
      start: '15:00',
      ...venue,
      art: ['ganpati'],
      fallback: ['haldi'],
      deco: 'haldi',
    },
    grahshanti: {
      title: 'Grah Shanti',
      label: 'Grah Shanti',
      date: '2026-12-01',
      start: '08:00',
      ...venue,
      art: ['grahshanti'],
      fallback: ['haldi'],
      deco: 'wedding',
    },
    sagai: {
      title: 'Sagai (Engagement)',
      label: 'Sagai',
      sub: 'Engagement',
      date: '2026-12-01',
      start: '14:00',
      ...venue,
      art: ['engagement'],
      deco: 'engagement',
    },
    sangeet: {
      title: 'Sangeet Sandhya & Preetibhoj',
      label: 'Preetibhoj',
      sub: '& Sangeet Sandhya',
      date: '2026-12-01',
      start: '17:00',
      onwards: true,
      ...venue,
      art: ['reception'],
      finale: true,
      deco: 'reception',
    },
    lagan: {
      title: 'Lagan Phere (Wedding)',
      label: 'Lagan Phere',
      sub: 'Wedding',
      date: '2026-12-02',
      start: '08:00',
      ...venue,
      art: ['baraat', 'wedding'],
      deco: 'baraat',
    },
  },

  // The date on the "Save the Date" screen, on every link (a link can override it with its own saveDate).
  saveDate: '2026-12-01',

  // One link per guest list: https://<site>/?invite=<name>. No ?invite= means `defaultInvite`.
  invites: {
    all: { events: ['ganpati', 'grahshanti', 'sagai', 'sangeet', 'lagan'] },
    puja: { events: ['ganpati', 'grahshanti'] },
    sangeet: { events: ['sagai', 'sangeet'] },
    wedding: { events: ['lagan'] },
  },
  defaultInvite: 'all',

  // How long each screen stays before moving on by itself (milliseconds).
  // Screens with two clips stay longer, until both have played.
  timing: { intro: 5500, save: 5000, event: 5000, finale: 3300 },

  // The bride's side Google Sheet (Apps Script web app, see README → RSVPs).
  // Empty: RSVPs are only kept in the guest's browser, so fill this in before sharing the link.
  rsvp: {
    endpoint: 'https://script.google.com/macros/s/AKfycbwzlt3nxoJWvEO6Jhn6OSkNW_z8m-eF6pMCI4QgtX079Q541gfud1Qwo_J8uSDt4p4XZQ/exec',
  },
};
