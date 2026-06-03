import type { MapSpotDef } from "./types";

export const mapSpotDefs: MapSpotDef[] = [
  {
    id: "harbor-arrival",
    category: "scenic",
    title: "Harbor Arrival",
    shortLabel: "Harbor",
    emoji: "⛵",
    starCost: 0,
    areaClass: "area-wide"
  },
  {
    id: "old-town-street",
    category: "scenic",
    title: "Old Town Street",
    shortLabel: "Old Town",
    emoji: "🏘️",
    starCost: 0,
    areaClass: "area-tall"
  },
  {
    id: "canal-bridge",
    category: "scenic",
    title: "Canal Bridge",
    shortLabel: "Bridge",
    emoji: "🌉",
    starCost: 1,
    areaClass: "area-small"
  },
  {
    id: "tower-square",
    category: "scenic",
    title: "Tower Square",
    shortLabel: "Tower",
    emoji: "🕍",
    starCost: 1,
    areaClass: "area-medium"
  },
  {
    id: "royal-garden",
    category: "scenic",
    title: "Royal Garden",
    shortLabel: "Garden",
    emoji: "🌳",
    starCost: 1,
    areaClass: "area-small"
  },
  {
    id: "design-museum",
    category: "scenic",
    title: "Design Museum",
    shortLabel: "Museum",
    emoji: "🏛️",
    starCost: 2,
    areaClass: "area-tall"
  },
  {
    id: "riverside-walk",
    category: "scenic",
    title: "Riverside Walk",
    shortLabel: "River",
    emoji: "🚲",
    starCost: 2,
    areaClass: "area-wide"
  },
  {
    id: "postcard-view",
    category: "scenic",
    title: "Postcard View",
    shortLabel: "View",
    emoji: "📮",
    starCost: 3,
    areaClass: "area-medium",
    postcardFragment: "City panorama"
  },
  {
    id: "local-bites",
    category: "food",
    title: "Local Bites",
    shortLabel: "Food",
    emoji: "🍽️",
    starCost: 0,
    areaClass: "area-small"
  },
  {
    id: "shopping-arcade",
    category: "shopping",
    title: "Shopping Arcade",
    shortLabel: "Mall",
    emoji: "🛍️",
    starCost: 0,
    areaClass: "area-medium"
  },
  {
    id: "culture-night",
    category: "culture",
    title: "Culture Night",
    shortLabel: "Culture",
    emoji: "🎭",
    starCost: 0,
    areaClass: "area-wide"
  }
];

export const initialUnlockedMapSpotIds = ["harbor-arrival", "old-town-street"];
