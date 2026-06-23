export type ItemScope = "persistent" | "city";
export type ItemCategory =
  | "travel"
  | "general-food"
  | "local-food"
  | "souvenir"
  | "transit"
  | "shopping"
  | "food";

export type PieceKind = "item" | "generator" | "locked" | "hidden";

export interface ItemDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  scope: ItemScope;
  category: ItemCategory;
  nextId?: string;
}

export interface WeightedOutput {
  itemId: string;
  weight: number;
}

export type GeneratorSourceType = "permanent" | "upgradeable" | "charge" | "finite" | "container" | "sealed";

export interface GeneratorDef {
  id: string;
  chainId: string;
  label: string;
  shortLabel: string;
  emoji: string;
  level: number;
  energyCost: number;
  outputs: WeightedOutput[];
  cityLimited: boolean;
  sourceType: GeneratorSourceType;
  nextId?: string;
  maxTaps?: number;
  sequenceOutputs?: string[];
  rewardCoins?: number;
  rewardGems?: number;
  rewardStars?: number;
}

export interface OrderRequirement {
  itemId: string;
  count: number;
}

export interface OrderDef {
  id: string;
  requester: string;
  title: string;
  flavor: string;
  requirements: OrderRequirement[];
  rewardStars: number;
  rewardActivityEnergy: number;
  rewardCityProgress: number;
  rewardCatMood?: number;
}

export interface CityChapter {
  id: string;
  cityName: string;
  dayLabel: string;
  sceneTitle: string;
  sceneSubtitle: string;
  cityGeneratorIds: string[];
  orderIds: string[];
}

export type MapSpotCategory = "scenic" | "food" | "shopping" | "culture";
export type MapSpotStatus = "unlocked" | "available" | "locked" | "reserved";

export interface MapSpotDef {
  id: string;
  category: MapSpotCategory;
  title: string;
  shortLabel: string;
  emoji: string;
  starCost: number;
  areaClass: string;
  postcardFragment?: string;
}

export interface BoardPiece {
  uid: string;
  kind: PieceKind;
  defId: string;
  remainingTaps?: number;
  sequenceIndex?: number;
}

export interface GameState {
  board: Array<BoardPiece | null>;
  boardCols: number;
  boardRows: number;
  energy: number;
  stars: number;
  coins: number;
  gems: number;
  cityProgress: number;
  catMood: number;
  selectedIndex: number | null;
  activityEnergy: number;
  activityCurrency: number;
  activityBoard: Array<BoardPiece | null>;
  activityBoardCols: number;
  activitySelectedIndex: number | null;
  activityNextUid: number;
  focusedOrderId?: string | null;
  activeOrderIds: string[];
  completedOrderIds: string[];
  unlockedMapSpotIds: string[];
  message: string;
  nextUid: number;
  cityChapterId: string;
}
