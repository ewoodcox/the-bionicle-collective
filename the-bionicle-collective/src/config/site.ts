/**
 * The Bionicle Collective – site config
 * Replace placeholder hex codes with your own; add your social URLs.
 */

export const site = {
  name: 'The Bionicle Collective',
  description: `Welcome to The Bionicle Collective — a growing archive dedicated to preserving the legacy of LEGO’s BIONICLE theme.
  
  Based in Utah, USA, this collection began with a simple realization: after starting in 2003 and continuing through the end of Generation 1, I had already accumulated over 100 sets. In 2010, I made the decision to intentionally grow and preserve the collection rather than let it fade into nostalgia.
  
  Today, The Bionicle Collective includes over 300 sets, rare collectibles, sealed products, promotional items, and custom MOCs spanning both Generation 1 and Generation 2.
  
  But this project goes beyond collecting.
  
  Through retrospectives and year-focused deep dives, I explore the history, design evolution, storytelling, and cultural impact of BIONICLE — preserving not just the sets, but the era itself.
  
  Whether you're a longtime collector, a casual fan rediscovering your childhood, or someone exploring BIONICLE for the first time, this site is here to celebrate one of LEGO’s boldest experiments in serialized storytelling.
  
  The legend lives on.
  `
} as const;

/** Color scheme (matches global.css :root). */
export const colors = {
  primary: '#008f9b',
  secondary: '#7c503a',
  accent: '#b87d44',
  background: '#111314',
  backgroundAlt: '#1a1d1f',
  text: '#e2eaea',
  textMuted: '#7a9194',
} as const;

/** Social links for the collection (YouTube, Facebook, Instagram, Bluesky). */
export const social = {
  youtube: 'https://youtube.com/@bioniclecollective',
  facebook: 'https://facebook.com/bioniclecollective',
  instagram: 'https://instagram.com/bioniclecollective',
  bluesky: 'https://bsky.app/profile/lumberingstill.bsky.social',
} as const;
