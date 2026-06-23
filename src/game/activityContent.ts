import type { GeneratorSourceType } from "./types";

export interface ActivityItemDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  nextId?: string;
  rewardCurrency?: number;
}

export interface ActivityGeneratorDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  sourceType: Extract<GeneratorSourceType, "finite">;
  energyCost: number;
  maxTaps: number;
  sequenceOutputs: string[];
  nextId?: string;
}

export interface ActivityDef {
  id: string;
  title: string;
  subtitle: string;
  energyLabel: string;
  currencyLabel: string;
}

export const activeActivity: ActivityDef = {
  id: "travel-fair",
  title: "Travel Fair",
  subtitle: "Spend tickets on the side board and merge souvenirs into reward boxes.",
  energyLabel: "Tickets",
  currencyLabel: "Fair Coins"
};

export const activityItemDefs: Record<string, ActivityItemDef> = {
  "fair-stamp-1": {
    id: "fair-stamp-1",
    chainId: "fair-souvenir",
    label: "Fair Stamp",
    shortLabel: "Stamp",
    emoji: "🏷️",
    level: 1,
    nextId: "fair-stamp-2"
  },
  "fair-stamp-2": {
    id: "fair-stamp-2",
    chainId: "fair-souvenir",
    label: "Souvenir Pair",
    shortLabel: "Pair",
    emoji: "🎐",
    level: 2,
    nextId: "fair-reward-box"
  },
  "fair-reward-box": {
    id: "fair-reward-box",
    chainId: "fair-souvenir",
    label: "Fair Reward Box",
    shortLabel: "Box",
    emoji: "🎁",
    level: 3,
    rewardCurrency: 12
  }
};

export const activityGeneratorDefs: Record<string, ActivityGeneratorDef> = {
  "fair-voucher-roll-1": {
    id: "fair-voucher-roll-1",
    chainId: "fair-voucher-roll",
    label: "Voucher Roll",
    shortLabel: "Roll",
    emoji: "🎟️",
    level: 1,
    sourceType: "finite",
    energyCost: 1,
    maxTaps: 4,
    sequenceOutputs: ["fair-stamp-1", "fair-stamp-1", "fair-stamp-2"],
    nextId: "fair-voucher-roll-2"
  },
  "fair-voucher-roll-2": {
    id: "fair-voucher-roll-2",
    chainId: "fair-voucher-roll",
    label: "Full Voucher Roll",
    shortLabel: "Roll+",
    emoji: "🎫",
    level: 2,
    sourceType: "finite",
    energyCost: 1,
    maxTaps: 6,
    sequenceOutputs: ["fair-stamp-1", "fair-stamp-2", "fair-stamp-1", "fair-stamp-2"]
  }
};
