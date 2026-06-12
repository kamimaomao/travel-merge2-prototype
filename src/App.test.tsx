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
    expect(screen.getByLabelText("Small Pouch cell 8").getAttribute("data-route-needed")).toBe("true");
    expect(screen.getByLabelText("Small Pouch cell 9").getAttribute("data-route-needed")).toBe("true");
    expect(screen.getByLabelText("Station Ticket cell 15").getAttribute("data-route-needed")).toBe("true");
  });

  it("surfaces the six merge source patterns directly on the opening board", () => {
    render(<App />);

    expect(screen.getByLabelText("Suitcase cell 1").getAttribute("data-source-type")).toBe("permanent");
    expect(screen.getByLabelText("Guidebook cell 2").getAttribute("data-source-type")).toBe("upgradeable");
    expect(screen.getByLabelText("Camera Kit cell 4").getAttribute("data-source-type")).toBe("charge");
    expect(screen.getByLabelText("Festival Voucher cell 5").getAttribute("data-source-type")).toBe("finite");
    expect(screen.getByLabelText("Souvenir Gift Box cell 6").getAttribute("data-source-type")).toBe("container");
    expect(screen.getByLabelText("Locked Map Cache cell 10").getAttribute("data-source-type")).toBe("sealed");
  });

  it("uses taps for inspection instead of moving pieces between cells", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Small Pouch cell 8"));
    fireEvent.click(screen.getByLabelText("Empty cell 7"));

    expect(screen.getByLabelText("Small Pouch cell 8")).toBeTruthy();
    expect(screen.getByLabelText("Empty cell 7")).toBeTruthy();
  });

  it("merges identical pieces through a pointer drag", () => {
    render(<App />);

    const source = screen.getByLabelText("Small Pouch cell 8");
    const target = screen.getByLabelText("Small Pouch cell 9");
    fireEvent.pointerDown(source, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerEnter(target, { pointerId: 1, clientX: 70, clientY: 20 });

    expect(source.getAttribute("data-dragging")).toBe("true");
    expect(target.getAttribute("data-drop-intent")).toBe("merge");
    expect(screen.getByLabelText("Dragging Small Pouch")).toBeTruthy();

    fireEvent.pointerUp(target, { pointerId: 1, clientX: 70, clientY: 20 });

    expect(screen.getByLabelText("Empty cell 8")).toBeTruthy();
    expect(screen.getByLabelText("Day Bag cell 9")).toBeTruthy();
    expect(screen.getByLabelText("Map Cache cell 10")).toBeTruthy();
  });

  it("keeps generator tap production after drag becomes the move interaction", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Suitcase cell 1"));

    expect(screen.getByLabelText("Energy").textContent).toBe("71");
  });

  it("does not produce from a generator after a canceled drag gesture", () => {
    render(<App />);

    const generator = screen.getByLabelText("Suitcase cell 1");
    const hiddenTarget = screen.getByLabelText("Sealed travel space cell 16");
    fireEvent.pointerDown(generator, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerEnter(hiddenTarget, { pointerId: 1, clientX: 170, clientY: 20 });
    fireEvent.pointerEnter(generator, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.pointerUp(generator, { pointerId: 1, clientX: 20, clientY: 20 });
    fireEvent.click(generator);

    expect(screen.getByLabelText("Energy").textContent).toBe("72");
    expect(screen.getByLabelText("Suitcase cell 1")).toBeTruthy();
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

    fireEvent.click(screen.getByLabelText("Tower Square locked"));
    expect(within(screen.getByLabelText("Scenic route progress")).getByText("2/8")).toBeTruthy();
    expect(screen.getByLabelText("Stars").textContent).toBe("1");

    fireEvent.click(screen.getByLabelText("Canal Bridge available"));

    const progress = screen.getByLabelText("Scenic route progress");
    expect(within(progress).getByText("3/8")).toBeTruthy();
    expect(screen.getByLabelText("Canal Bridge unlocked")).toBeTruthy();
    expect(screen.getByLabelText("Stars").textContent).toBe("0");
  });

  it("feeds the first map unlock back into a new playable merge beat", () => {
    render(<App />);

    fireEvent.click(screen.getByLabelText("Deliver Tokyo Morning Errand"));
    fireEvent.click(screen.getByRole("button", { name: "Map" }));
    fireEvent.click(screen.getByLabelText("Canal Bridge available"));
    fireEvent.click(screen.getByRole("button", { name: "Back to merge board" }));

    const focusedOrder = screen.getByLabelText("Focused order: Late Train Backup");
    expect(within(focusedOrder).getByText("Route")).toBeTruthy();
    expect(screen.getByLabelText("Snack Source cell 7").getAttribute("data-route-needed")).toBe("true");
    expect(screen.getByLabelText("Locked Instant Noodles cell 11").getAttribute("data-route-needed")).toBe("true");
  });
});
