/**
 * Artist fund data — profiles and fund mechanics.
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
    name: "KRVN",
    scene: "UK BASS",
    location: "London, UK",
    fundAmount: 240000,
    bio: "Modular synthesis in abandoned infrastructure. Has not released on a label with Spotify distribution since 2019. Operates exclusively through tape and direct digital transfer.",
    frequency: "140 HZ",
  },
  {
    id: "a002",
    name: "PHASE_NULL",
    scene: "EU TECHNO",
    location: "Rotterdam, NL",
    fundAmount: 180000,
    bio: "Sub-bass architecture. Builds sound systems from reclaimed industrial components. The music exists primarily as a physical experience — recordings are approximations.",
    frequency: "20–80 HZ",
  },
  {
    id: "a003",
    name: "SUTURA",
    scene: "UK BASS",
    location: "Bristol, UK",
    fundAmount: 165000,
    bio: "Breakbeat archaeology. Reconstructs the lineage from jungle to modern bass culture in sets that refuse to acknowledge genre boundaries. No booking agent. Contact through the network only.",
    frequency: "80–160 HZ",
  },
  {
    id: "a004",
    name: "DRVK MTRX",
    scene: "ACID / 303",
    location: "Detroit, US",
    fundAmount: 210000,
    bio: "Three 303s and a four-track. Operating from the same basement since 2016. The parties happen when they happen. If you know, you know.",
    frequency: "40–120 HZ",
  },
  {
    id: "a005",
    name: "OSCILLIA",
    scene: "AMBIENT / EXPERIMENTAL",
    location: "Tbilisi, GE",
    fundAmount: 120000,
    bio: "Field recordings from decommissioned Soviet industrial sites processed through granular synthesis. Each piece is a document of a space that no longer exists.",
    frequency: "Sub–60 HZ",
  },
  {
    id: "a006",
    name: "NØISE.DEPT",
    scene: "BERLIN INDUSTRIAL",
    location: "Warsaw, PL",
    fundAmount: 195000,
    bio: "140+ BPM is not a tempo — it is a commitment. Runs a monthly in an unheated warehouse outside the city. Attendance by word of mouth only. No recording permitted.",
    frequency: "60–200 HZ",
  },
  {
    id: "a007",
    name: "VKTM",
    scene: "US UNDERGROUND",
    location: "Chicago, US",
    fundAmount: 155000,
    bio: "Footwork roots twisted through industrial distortion. Builds tracks from field recordings of the L-train and South Side warehouse sessions. No streaming, vinyl only.",
    frequency: "80–160 HZ",
  },
  {
    id: "a008",
    name: "SØNAR.NULL",
    scene: "EU TECHNO",
    location: "Malmö, SE",
    fundAmount: 130000,
    bio: "Hypnotic four-to-the-floor minimalism processed through analogue tape saturation. Every set is a single unbroken take. No edits, no overdubs.",
    frequency: "30–90 HZ",
  },
  {
    id: "a009",
    name: "HEXWRK",
    scene: "ACID / 303",
    location: "Manchester, UK",
    fundAmount: 175000,
    bio: "Acid house revivalism for abandoned mills. Runs a pirate stream from a canal boat. The 303 never stops. The frequency never compromises.",
    frequency: "50–140 HZ",
  },
];

export function getTotalFundDistributed(): number {
  return ARTISTS.reduce((sum, a) => sum + a.fundAmount, 0);
}

export function formatFundAmount(cents: number): string {
  return `€${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
}
