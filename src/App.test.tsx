import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import App from "./App";

describe("Travel Merge2 shell", () => {
  it("uses a compact currency HUD instead of a city progress card", () => {
    render(<App />);

    expect(screen.getByLabelText("Energy")).toBeTruthy();
    expect(screen.getByLabelText("Stars")).toBeTruthy();
    expect(screen.getByLabelText("Coins")).toBeTruthy();
    expect(screen.getByLabelText("Gems")).toBeTruthy();
    expect(screen.queryByText("Tokyo Morning Street")).toBeNull();
    expect(screen.queryByLabelText("Current route focus")).toBeNull();
  });

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

  it("keeps route focus inside the order card and links useful board chains", () => {
    render(<App />);

    const focusedOrder = screen.getByLabelText("Focused order: Departure Prep");
    expect(within(focusedOrder).getByText("Route")).toBeTruthy();
    expect(screen.getByLabelText("Pill cell 2").getAttribute("data-route-needed")).toBe("true");
    expect(screen.getByLabelText("Pill cell 3").getAttribute("data-route-needed")).toBe("true");
  });

  it("opens the city postcard map from the merge page and leaves branch hooks visible", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "Map" }));

    expect(screen.getByLabelText("Travel postcard map")).toBeTruthy();
    expect(screen.getByLabelText("City postcard map")).toBeTruthy();
    expect(screen.getByText("City Map")).toBeTruthy();
    expect(screen.getByLabelText("Shopping Arcade reserved")).toBeTruthy();
    expect(screen.getByLabelText("Local Bites reserved")).toBeTruthy();
    expect(screen.getByLabelText("Culture Night reserved")).toBeTruthy();
    expect(screen.queryByLabelText("Merge board")).toBeNull();
  });

  it("spends an order star to unlock the next scenic postcard spot", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Deliver Tokyo Morning Errand"));
    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    fireEvent.click(screen.getByLabelText("Canal Bridge locked"));

    const progress = screen.getByLabelText("Scenic route progress");
    expect(within(progress).getByText("3/8")).toBeTruthy();
    expect(screen.getByLabelText("Canal Bridge unlocked")).toBeTruthy();
    expect(screen.getByLabelText("Stars").textContent).toBe("0");
  });
});
