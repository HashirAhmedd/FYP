import "../../../Frontend/src/test/setup.js";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../../../Frontend/src/utils/api.js", () => ({
  apiFetch: vi.fn(),
}));

import DataDownload from "../../../Frontend/src/Pages/DataDownload.jsx";
import { apiFetch } from "../../../Frontend/src/utils/api.js";

describe("Frontend data download page", () => {
  it("shows a validation error when start year exceeds end year", async () => {
    const user = userEvent.setup();

    render(<DataDownload />);

    const yearSelectors = screen.getAllByRole("combobox");
    await user.selectOptions(yearSelectors[0], "2025");
    await user.selectOptions(yearSelectors[1], "2020");
    await user.click(screen.getByRole("button", { name: /get data/i }));

    expect(
      await screen.findByText(/start year cannot be greater than end year/i),
    ).toBeInTheDocument();
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("fetches data and triggers a CSV download", async () => {
    const user = userEvent.setup();

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        columns: ["year", "region", "gas", "emission_value"],
        rowCount: 1,
        filters: {
          region: "pak",
          gas: "co2",
          startYear: 2020,
          endYear: 2024,
        },
        rows: [
          {
            year: 2024,
            region: "Pakistan",
            gas: "co2",
            emission_value: 12.5,
          },
        ],
      }),
    });

    render(<DataDownload />);

    const yearSelectors = screen.getAllByRole("combobox");
    await user.selectOptions(yearSelectors[0], "2020");
    await user.selectOptions(yearSelectors[1], "2024");
    await user.click(screen.getByRole("button", { name: /get data/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith(
        "/api/v1/data/download?startYear=2020&endYear=2024",
      );
      expect(screen.getByText(/Data Preview \(1 records\)/i)).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /download csv/i }));

    expect(window.URL.createObjectURL).toHaveBeenCalled();
    expect(HTMLAnchorElement.prototype.click).toHaveBeenCalled();
  });

  it("clears stale preview data when a later fetch fails", async () => {
    // Arrange
    const user = userEvent.setup();
    apiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          columns: ["year", "region", "gas", "emission_value"],
          rowCount: 1,
          filters: {
            region: "pak",
            gas: "co2",
            startYear: 2020,
            endYear: 2024,
          },
          rows: [
            {
              year: 2024,
              region: "Pakistan",
              gas: "co2",
              emission_value: 12.5,
            },
          ],
        }),
      })
      .mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          message: "Failed to fetch data",
        }),
      });

    render(<DataDownload />);

    const yearSelectors = screen.getAllByRole("combobox");

    // Act
    await user.selectOptions(yearSelectors[0], "2020");
    await user.selectOptions(yearSelectors[1], "2024");
    await user.click(screen.getByRole("button", { name: /get data/i }));

    await screen.findByText(/Data Preview \(1 records\)/i);

    await user.selectOptions(yearSelectors[0], "2021");
    await user.selectOptions(yearSelectors[1], "2025");
    await user.click(screen.getByRole("button", { name: /get data/i }));

    // Assert
    await screen.findByText(/Error: Failed to fetch data/i);
    expect(screen.queryByText(/Data Preview \(1 records\)/i)).not.toBeInTheDocument();
  });
});
