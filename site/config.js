// All invitation content lives here. Edit this file to change names, events, venues or links.

// Ganpati Sthapna and Grah Shanti are at home (no map pin, so no Directions button; add
// `map: '<Google Maps link>'` here to show one)
const home = {
  venue: 'Home',
  city: 'Badi Sadri, Rajasthan',
};

const venue = {
  venue: 'Bhairav Vatika',
  city: 'Aashram ke peeche, Barisadri, Rajasthan',
  // PLACEHOLDER: a search link. Swap in the exact Google Maps pin when you have it.
  map: 'https://maps.google.com/?q=Bhairav+Vatika,+Badi+Sadri,+Rajasthan',
};

export default {
  // bride's side: Aditi first
  couple: ['Aditi', 'Yashwant'],

  // date: YYYY-MM-DD · start: 24-hour HH:MM (IST)
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
      ...home,
      art: ['ganpati'],
      fallback: ['haldi'],
      deco: 'haldi',
    },
    grahshanti: {
      title: 'Grah Shanti',
      label: 'Grah Shanti',
      date: '2026-12-01',
      start: '08:00',
      ...home,
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
      label: 'Sangeet Sandhya',
      sub: '& Preetibhoj',
      date: '2026-12-01',
      start: '20:00',
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

  // One link per guest list: https://<site>/?invite=<name>. No ?invite= means `defaultInvite`.
  // save: the event(s) whose date goes on the "Save the Date" screen.
  // saveArt: the couple picture on the "Save the Date" screen.
  invites: {
    all: { events: ['ganpati', 'grahshanti', 'sagai', 'sangeet', 'lagan'], save: ['lagan'], saveArt: 'wedding' },
    puja: { events: ['ganpati', 'grahshanti'], save: ['ganpati', 'grahshanti'], saveArt: 'haldi' },
    sangeet: { events: ['sagai', 'sangeet'], save: ['sagai'], saveArt: 'engagement' },
    wedding: { events: ['lagan'], save: ['lagan'], saveArt: 'wedding' },
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
