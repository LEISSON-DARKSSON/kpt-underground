/**
 * Artist fund data — Tallinn Underground Radio roster.
 * All artists sourced from RAVEMAGEDDON, Techno Takeover @AtticBass,
 * Beats From The Vault @ Krematoorium, and affiliated events.
 */

export interface ArtistProfile {
  id: string;
  name: string;
  scene: string;
  location: string;
  fundAmount: number; // EUR cents distributed to date
  bio: string;
  frequency: string;
}

export const ARTISTS: ArtistProfile[] = [
  {
    id: "a001",
    name: "NEOONDREED",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 245000,
    bio: "High-energy techno transmissions from Krematoorium to RAVEMAGEDDON. Stuts Live sessions at 145 BPM — no pause, no permission, no compromise. The system runs until the system runs out.",
    frequency: "135–150 HZ",
  },
  {
    id: "a002",
    name: "LEISSON",
    scene: "HARD TECHNO",
    location: "Tallinn, EE",
    fundAmount: 280000,
    bio: "Hardcore techno and hybrid sets that treat the redline as a starting point. Resident force behind Techno Takeover @AtticBass. Sound check is the opening act. Every frequency is a weapon.",
    frequency: "140–160 HZ",
  },
  {
    id: "a003",
    name: "MEELIS VILI",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 195000,
    bio: "Techno Takeover veteran since session 006. Methodical four-to-the-floor architecture with a Baltic coldness that cuts through concrete. RAVEMAGEDDON-certified signal operator.",
    frequency: "130–142 HZ",
  },
  {
    id: "a004",
    name: "NUPR NAPR",
    scene: "HARD TECHNO",
    location: "Tallinn, EE",
    fundAmount: 165000,
    bio: "Unfiltered aggression channeled through the mixing desk. RAVEMAGEDDON alumni with a frequency tolerance that starts where others peak. The name is the warning.",
    frequency: "145–158 HZ",
  },
  {
    id: "a005",
    name: "AZURAS",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 175000,
    bio: "Dark-room techno that maps the negative space between kicks. RAVEMAGEDDON frequency carrier. Operates in the zone where hypnosis becomes infrastructure.",
    frequency: "132–145 HZ",
  },
  {
    id: "a006",
    name: "PULK",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 210000,
    bio: "Beats From The Vault resident at Krematoorium. Digging through the archive of what the underground produced when nobody was documenting. Every mix is an excavation.",
    frequency: "128–140 HZ",
  },
  {
    id: "a007",
    name: "REGLOK",
    scene: "DnB",
    location: "Tallinn, EE",
    fundAmount: 155000,
    bio: "Drum and bass signal from the Solstitium network. 174 BPM is not a speed limit — it is a frequency commitment. The Tallinn jungle connection that refuses to break.",
    frequency: "170–180 HZ",
  },
  {
    id: "a008",
    name: "DARKSSON",
    scene: "DUBSTEP",
    location: "Tallinn, EE",
    fundAmount: 185000,
    bio: "Deep dubstep transmissions from below the surface. Sub-bass pressure that you measure in wall vibrations, not decibels. The dark half of the signal chain.",
    frequency: "60–140 HZ",
  },
  {
    id: "a009",
    name: "CLY",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 140000,
    bio: "Krematoorium Beats From The Vault operator. Four hours deep into a stream when most have disconnected — that is when the real transmission begins.",
    frequency: "130–142 HZ",
  },
  {
    id: "a010",
    name: "SUVA",
    scene: "TECHNO",
    location: "Tallinn, EE",
    fundAmount: 150000,
    bio: "Back-to-back Krematoorium sessions with CLY — two signals merged into one unbroken transmission. Beats From The Vault Live contributor. The frequency holds.",
    frequency: "128–138 HZ",
  },
];

export function getTotalFundDistributed(): number {
  return ARTISTS.reduce((sum, a) => sum + a.fundAmount, 0);
}

export function formatFundAmount(cents: number): string {
  return `\u20AC${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
