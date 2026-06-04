import type { CityChapter, GeneratorDef, ItemCategory, ItemDef, OrderDef } from "./types";

export const expansionCategories: ItemCategory[] = ["shopping", "food"];

export const itemDefs: Record<string, ItemDef> = {
  "small-pouch": {
    id: "small-pouch",
    chainId: "travel-prep",
    label: "Small Pouch",
    shortLabel: "Pouch",
    emoji: "👝",
    level: 1,
    scope: "persistent",
    category: "travel",
    nextId: "day-bag"
  },
  "day-bag": {
    id: "day-bag",
    chainId: "travel-prep",
    label: "Day Bag",
    shortLabel: "Bag",
    emoji: "👜",
    level: 2,
    scope: "persistent",
    category: "travel",
    nextId: "backpack"
  },
  backpack: {
    id: "backpack",
    chainId: "travel-prep",
    label: "Backpack",
    shortLabel: "Pack",
    emoji: "🎒",
    level: 3,
    scope: "persistent",
    category: "travel",
    nextId: "organized-luggage"
  },
  "organized-luggage": {
    id: "organized-luggage",
    chainId: "travel-prep",
    label: "Organized Luggage",
    shortLabel: "Luggage",
    emoji: "🧳",
    level: 4,
    scope: "persistent",
    category: "travel"
  },
  "instant-noodles": {
    id: "instant-noodles",
    chainId: "general-snack",
    label: "Instant Noodles",
    shortLabel: "Noodles",
    emoji: "🍜",
    level: 1,
    scope: "persistent",
    category: "general-food",
    nextId: "travel-meal-kit"
  },
  "travel-meal-kit": {
    id: "travel-meal-kit",
    chainId: "general-snack",
    label: "Travel Meal Kit",
    shortLabel: "Meal Kit",
    emoji: "🍱",
    level: 2,
    scope: "persistent",
    category: "general-food"
  },
  "rice-ball": {
    id: "rice-ball",
    chainId: "tokyo-local-food",
    label: "Rice Ball",
    shortLabel: "Onigiri",
    emoji: "🍙",
    level: 1,
    scope: "city",
    category: "local-food",
    nextId: "bento"
  },
  bento: {
    id: "bento",
    chainId: "tokyo-local-food",
    label: "Bento",
    shortLabel: "Bento",
    emoji: "🍱",
    level: 2,
    scope: "city",
    category: "local-food",
    nextId: "ramen-ticket"
  },
  "ramen-ticket": {
    id: "ramen-ticket",
    chainId: "tokyo-local-food",
    label: "Ramen Ticket",
    shortLabel: "Ramen",
    emoji: "🎟️",
    level: 3,
    scope: "city",
    category: "local-food"
  },
  charm: {
    id: "charm",
    chainId: "tokyo-souvenir",
    label: "Charm",
    shortLabel: "Charm",
    emoji: "🔖",
    level: 1,
    scope: "city",
    category: "souvenir",
    nextId: "wind-chime"
  },
  "wind-chime": {
    id: "wind-chime",
    chainId: "tokyo-souvenir",
    label: "Wind Chime",
    shortLabel: "Chime",
    emoji: "🎐",
    level: 2,
    scope: "city",
    category: "souvenir",
    nextId: "stamp-booklet"
  },
  "stamp-booklet": {
    id: "stamp-booklet",
    chainId: "tokyo-souvenir",
    label: "Stamp Booklet",
    shortLabel: "Booklet",
    emoji: "📒",
    level: 3,
    scope: "city",
    category: "souvenir"
  },
  "station-ticket": {
    id: "station-ticket",
    chainId: "tokyo-transit",
    label: "Station Ticket",
    shortLabel: "Ticket",
    emoji: "🎫",
    level: 1,
    scope: "city",
    category: "transit",
    nextId: "day-pass"
  },
  "day-pass": {
    id: "day-pass",
    chainId: "tokyo-transit",
    label: "Day Pass",
    shortLabel: "Pass",
    emoji: "🚇",
    level: 2,
    scope: "city",
    category: "transit"
  }
};

export const generatorDefs: Record<string, GeneratorDef> = {
  "suitcase-1": {
    id: "suitcase-1",
    chainId: "suitcase",
    label: "Suitcase",
    shortLabel: "Case",
    emoji: "🧳",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    nextId: "suitcase-2",
    outputs: [
      { itemId: "small-pouch", weight: 70 },
      { itemId: "day-bag", weight: 30 }
    ]
  },
  "suitcase-2": {
    id: "suitcase-2",
    chainId: "suitcase",
    label: "Organized Suitcase",
    shortLabel: "Case+",
    emoji: "🧳",
    level: 2,
    energyCost: 1,
    cityLimited: false,
    outputs: [
      { itemId: "small-pouch", weight: 35 },
      { itemId: "day-bag", weight: 45 },
      { itemId: "backpack", weight: 20 }
    ]
  },
  "snack-source-1": {
    id: "snack-source-1",
    chainId: "snack-source",
    label: "Snack Source",
    shortLabel: "Snack",
    emoji: "🍜",
    level: 1,
    energyCost: 1,
    cityLimited: false,
    outputs: [{ itemId: "instant-noodles", weight: 100 }]
  },
  "tokyo-convenience-bag-1": {
    id: "tokyo-convenience-bag-1",
    chainId: "tokyo-convenience-bag",
    label: "Tokyo Convenience Bag",
    shortLabel: "Tokyo",
    emoji: "🏪",
    level: 1,
    energyCost: 1,
    cityLimited: true,
    outputs: [
      { itemId: "rice-ball", weight: 42 },
      { itemId: "charm", weight: 28 },
      { itemId: "station-ticket", weight: 30 }
    ]
  }
};

export const orderDefs: Record<string, OrderDef> = {
  "departure-prep": {
    id: "departure-prep",
    requester: "Avery",
    title: "Departure Prep",
    flavor: "Pack the day bag and city pass before the group leaves the hotel.",
    requirements: [
      { itemId: "day-bag", count: 1 },
      { itemId: "day-pass", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1
  },
  "tokyo-morning-errand": {
    id: "tokyo-morning-errand",
    requester: "Mina",
    title: "Tokyo Morning Errand",
    flavor: "Grab a bite and get everyone to the first station.",
    requirements: [
      { itemId: "rice-ball", count: 1 },
      { itemId: "station-ticket", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1
  },
  "cat-preference": {
    id: "cat-preference",
    requester: "Mochi",
    title: "Cat Preference",
    flavor: "Mochi wants a tiny lucky charm tucked into the day bag.",
    requirements: [
      { itemId: "day-bag", count: 1 },
      { itemId: "charm", count: 1 }
    ],
    rewardStars: 1,
    rewardCityProgress: 1,
    rewardCatMood: 1
  },
  "cast-request": {
    id: "cast-request",
    requester: "Theo",
    title: "Late Train Backup",
    flavor: "Theo insists on emergency food before the group misses dinner.",
    requirements: [{ itemId: "travel-meal-kit", count: 1 }],
    rewardStars: 1,
    rewardCityProgress: 1
  }
};

export const cityChapters: Record<string, CityChapter> = {
  tokyoDay1: {
    id: "tokyoDay1",
    cityName: "Tokyo",
    dayLabel: "Day 1",
    sceneTitle: "Tokyo Morning Street",
    sceneSubtitle: "The long-term travel board continues while Tokyo adds temporary local orders.",
    cityGeneratorIds: ["tokyo-convenience-bag-1"],
    orderIds: ["departure-prep", "tokyo-morning-errand", "cat-preference", "cast-request"]
  }
};
