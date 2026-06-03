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
      "persistent"
    ]);
    expect(cityErrand.requirements.map((requirement) => itemDefs[requirement.itemId].scope)).toContain("city");
  });

  it("creates a board with resident generators already occupying cells", () => {
    const state = createInitialState();
    const generatorCells = state.board.filter((piece) => piece?.kind === "generator");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("suitcase-1");
    expect(generatorCells.map((piece) => piece?.defId)).toContain("tokyo-convenience-bag-1");
  });

  it("starts with a hidden-information reveal board and a small working pocket", () => {
    const state = createInitialState();
    const hiddenCells = state.board.filter((piece) => piece?.kind === "hidden");
    const directlyPlayableCells = state.board.filter((piece) => piece === null || piece.kind !== "hidden");
    expect(state.board.length).toBe(state.boardCols * state.boardCols);
    expect(hiddenCells.length).toBeGreaterThanOrEqual(27);
    expect(hiddenCells.length).toBeLessThanOrEqual(30);
    expect(directlyPlayableCells.length).toBeGreaterThanOrEqual(6);
    expect(directlyPlayableCells.length).toBeLessThanOrEqual(9);
    expect(directlyPlayableCells.some((piece) => piece?.kind === "generator")).toBe(true);
  });
});
