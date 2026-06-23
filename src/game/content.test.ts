import { describe, expect, it } from "vitest";
import { cityChapters, expansionCategories, generatorDefs, itemDefs, orderDefs } from "./content";
import { createInitialState } from "./createInitialState";

describe("travel merge content", () => {
  it("keeps shopping and food as reserved expansion categories", () => {
    expect(expansionCategories).toContain("shopping");
    expect(expansionCategories).toContain("food");
  });

  it("defines one current-city generator for Tokyo Day 1", () => {
    const city = cityChapters.tokyoDay1;
    expect(city.cityName).toBe("Tokyo");
    expect(city.cityGeneratorIds).toEqual(["tokyo-convenience-bag-1"]);
    expect(generatorDefs["tokyo-convenience-bag-1"].cityLimited).toBe(true);
  });

  it("defines orders that mix persistent and city items", () => {
    const departure = orderDefs["departure-prep"];
    const cityErrand = orderDefs["tokyo-morning-errand"];
    expect(departure.requirements.map((requirement) => itemDefs[requirement.itemId].scope)).toEqual([
      "persistent",
      "city"
    ]);
    expect(cityErrand.requirements.map((requirement) => itemDefs[requirement.itemId].scope)).toContain("city");
  });

  it("uses travel and transit for the opening flow without toiletry or medicine content", () => {
    const state = createInitialState();
    const openingItemIds = state.board.flatMap((piece) => (piece?.kind === "item" ? [piece.defId] : []));
    const productContent = JSON.stringify({ itemDefs, generatorDefs }).toLowerCase();
    expect(openingItemIds.filter((itemId) => itemId === "station-ticket")).toHaveLength(1);
    expect(productContent).not.toContain("toiletry");
    expect(productContent).not.toContain("cleanser");
    expect(productContent).not.toContain("skincare");
    expect(productContent).not.toContain("medicine");
    expect(productContent).not.toContain("pill");
    expect(orderDefs["departure-prep"].requirements.map((requirement) => requirement.itemId)).toEqual([
      "day-bag",
      "day-pass"
    ]);
  });

  it("creates a board with resident generators already occupying cells", () => {
    const state = createInitialState();
    const generatorCells = state.board.filter((piece) => piece?.kind === "generator");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("suitcase-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("travel-guidebook-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("camera-kit-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("festival-voucher-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("souvenir-gift-box");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("tokyo-convenience-bag-1");
  });

  it("defines the six common source patterns used by modern Merge2 boards", () => {
    const sourceTypes = new Set(Object.values(generatorDefs).map((generator) => generator.sourceType));
    expect(sourceTypes).toEqual(
      new Set(["permanent", "upgradeable", "charge", "finite", "container", "sealed"])
    );
  });

  it("starts with a hidden-information reveal board and a small working pocket", () => {
    const state = createInitialState();
    const hiddenCells = state.board.filter((piece) => piece?.kind === "hidden");
    const directlyPlayableCells = state.board.filter((piece) => piece === null || piece.kind !== "hidden");
    expect(state.boardCols).toBe(7);
    expect(state.boardRows).toBe(9);
    expect(state.board.length).toBe(state.boardCols * state.boardRows);
    expect(hiddenCells.length).toBeGreaterThanOrEqual(45);
    expect(hiddenCells.length).toBeLessThanOrEqual(50);
    expect(directlyPlayableCells.length).toBeGreaterThanOrEqual(13);
    expect(directlyPlayableCells.length).toBeLessThanOrEqual(15);
    expect(directlyPlayableCells.some((piece) => piece?.kind === "generator")).toBe(true);
  });
});
