export type ItemScope = "persistent" | "city";
export type ItemCategory =
  | "travel"
  | "toiletry"
  | "medicine"
  | "general-food"
  | "local-food"
  | "souvenir"
  | "transit"
  | "shopping"
  | "food";

export type PieceKind = "item" | "generator" | "locked";

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
  nextId?: string;
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

export interface BoardPiece {
  uid: string;
  kind: PieceKind;
  defId: string;
}

export interface GameState {
  board: Array<BoardPiece | null>;
  boardCols: number;
  energy: number;
  stars: number;
  cityProgress: number;
  catMood: number;
  selectedIndex: number | null;
  activeOrderIds: string[];
  completedOrderIds: string[];
  message: string;
  nextUid: number;
  cityChapterId: string;
}

