import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Travel Merge2 shell", () => {
  it("uses the mature merge-page bottom controls: backpack, info board, and meta exit", () => {
    render(<App />);

    const bottomControls = screen.getByLabelText("Merge page bottom controls");
    expect(within(bottomControls).getByRole("button", { name: "Backpack" })).toBeTruthy();
    expect(within(bottomControls).getByLabelText("Selected item information")).toBeTruthy();
    expect(within(bottomControls).getByRole("button", { name: "Map" })).toBeTruthy();
  });

  it("keeps active orders in a compact customer strip above the board", () => {
    render(<App />);

    const orderStrip = screen.getByLabelText("Active customer orders");
    expect(within(orderStrip).getByText("Departure Prep")).toBeTruthy();
    expect(within(orderStrip).getByText("Tokyo Morning Errand")).toBeTruthy();
  });
});
