/**
 * Artist fund data — Tallinn Underground Radio roster.
 * All artists sourced from RAVEMAGEDDON, Techno Takeover @AtticBass,
 * Beats From The Vault @ Krematoorium, Dzungel, DSTRCT, and affiliated events.
 * Profiles verified via SoundCloud.
 */

export interface ArtistProfile {
  id: string;
  name: string;
  scene: string;
  location: string;
  fundAmount: number; // EUR cents distributed to date
  bio: string;
  frequency: string;
  soundcloud?: string;
}

export const ARTISTS: ArtistProfile[] = [
  {
    id: "a001",
    name: "NEOONDREED",
    scene: "TEKNO",
    location: "Tallinn, EE",
    fundAmount: 245000,
    bio: "Supapyx SoundsysteM operator. TRIBE TEKNO sets at Stuts, UNDERGROUND SIRENS transmissions, RAVEMAGEDDON-certified. 413 followers deep. Also runs NEO_N dnb. The system runs until the system runs out.",
    frequency: "135–150 BPM",
    soundcloud: "neoondreed",
  },
  {
    id: "a002",
    name: "LEISSON",
    scene: "RAPTEK",
    location: "Tallinn, EE",
    fundAmount: 280000,
    bio: "Trailblazer behind RAPTEK — a hybrid sub-genre born in Estonia's underground. Fuses Hardtek, Hardcore, Frenchcore, Dubcore, Dubstep, and Jungle with Estonian-language vocals. 160-200 BPM. Resident force behind Techno Takeover @AtticBass. 27 tracks, 382 followers.",
    frequency: "160–200 BPM",
    soundcloud: "leisson-darksson",
  },
  {
    id: "a003",
    name: "MEELIS VILI",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 195000,
    bio: "Techno Takeover veteran since session 006. Methodical four-to-the-floor architecture with a Baltic coldness that cuts through concrete. RAVEMAGEDDON-certified signal operator.",
    frequency: "130–142 BPM",
  },
  {
    id: "a004",
    name: "ANNIKA",
    scene: "HARD TECHNO",
    location: "Tallinn, EE",
    fundAmount: 120000,
    bio: "We love techno and we like it hard. DSTRCT X warm-up sets and Hard Rave transmissions from Tallinn. Artist Pro with 32 followers and a frequency tolerance that starts where others peak.",
    frequency: "140–155 BPM",
    soundcloud: "user-380399946",
  },
  {
    id: "a005",
    name: "LOVIISE",
    scene: "HOUSE",
    location: "Tallinn, EE",
    fundAmount: 135000,
    bio: "Chaos Magic Through The Music. 74 followers, 12 tracks spanning house to techno. Mixes are one whole sound and vocal-trip through different nations, planets, and thick basslines. Heart of House of Heart. Curious Tales of Planet Loviise.",
    frequency: "122–138 BPM",
    soundcloud: "djloviise",
  },
  {
    id: "a006",
    name: "CLY/SUVA",
    scene: "INDUSTRIAL",
    location: "Tallinn, EE",
    fundAmount: 210000,
    bio: "DJ Cly/Suva [Remixta]. 591 followers. The Shadow Industry — Hard/Mental/Industrial Techno transmissions. Bandcamp, YouTube, Instagram. B2B sessions with NEOONDREED. Embrace the darkness.",
    frequency: "140–160 BPM",
    soundcloud: "clysuva",
  },
  {
    id: "a007",
    name: "NUPR NAPR",
    scene: "HARD TECHNO",
    location: "Tallinn, EE",
    fundAmount: 165000,
    bio: "Unfiltered aggression channeled through the mixing desk. RAVEMAGEDDON alumni with a frequency tolerance that starts where others peak. The name is the warning.",
    frequency: "145–158 BPM",
  },
  {
    id: "a008",
    name: "AZURAS",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 175000,
    bio: "Dark-room techno that maps the negative space between kicks. RAVEMAGEDDON frequency carrier. Operates in the zone where hypnosis becomes infrastructure.",
    frequency: "132–145 BPM",
  },
  {
    id: "a009",
    name: "PULK",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 210000,
    bio: "Beats From The Vault resident at Krematoorium. 105 followers, 777 following — connected to everything. Acid techno lineage through Sterling Moss and Chris Liberator. Every mix is an excavation.",
    frequency: "128–145 BPM",
    soundcloud: "h2lbepulk",
  },
  {
    id: "a010",
    name: "REGLOK",
    scene: "DnB / JUNGLE",
    location: "Estonia",
    fundAmount: 190000,
    bio: "Estonia Jungle Community founder. Dzungel event series. Harder & Louder. 576 followers, 13 tracks. REGCORE and Journey Through Junglism Spectre. Also runs Reglok Techno. The jungle connection that refuses to break.",
    frequency: "170–180 BPM",
    soundcloud: "reglok",
  },
  {
    id: "a011",
    name: "DARKSSON",
    scene: "DEEP DUBSTEP",
    location: "Tallinn, EE",
    fundAmount: 185000,
    bio: "Master of deep bass sounds. A mysterious figure who interweaves meditative sound journeys with powerful bass structures. ~140 BPM where bass is not just sound — it is a physical force. Nordic mystery fusing UK dubstep tradition with Estonian darkness.",
    frequency: "60–140 BPM",
    soundcloud: "leisson-darksson",
  },
  {
    id: "a012",
    name: "SUPAPYX SOUNDSYSTEM",
    scene: "TEKNO",
    location: "Estonia",
    fundAmount: 155000,
    bio: "Underground Party Systems. 622 followers, 16 tracks, 1,809 deep in the network. Multicultural hyper column species pioneering darker edges of creativity. Not a producer — a system. Twisting elements according to situation. Affiliated with NEOONDREED. Everything is possible.",
    frequency: "140–165 BPM",
    soundcloud: "supapyx",
  },
];

export function getTotalFundDistributed(): number {
  return ARTISTS.reduce((sum, a) => sum + a.fundAmount, 0);
}

export function formatFundAmount(cents: number): string {
  return `\u20AC${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
