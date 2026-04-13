import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/api.js", () => ({
  apiFetch: vi.fn(),
  predictionFetch: vi.fn(),
}));

vi.mock("../components/ForecastsConfiguration.jsx", () => ({
  default: () => <div>Forecast Config Stub</div>,
}));

vi.mock("../components/PredictionSkeleton.jsx", () => ({
  default: () => <div>Prediction Loading</div>,
}));

vi.mock("../components/EmissionPrediction.jsx", () => ({
  default: ({ prediction }) => (
    <div>Prediction Total: {prediction.data.total_emissions}</div>
  ),
}));

vi.mock("../components/MonthlyTrends.jsx", () => ({
  default: () => <div>Monthly Trends Stub</div>,
}));

vi.mock("../components/LLMResponse.jsx", () => ({
  default: ({ response }) => <div>LLM: {response}</div>,
}));

vi.mock("../components/Filters.jsx", () => ({
  default: () => <div>Filters Stub</div>,
}));

vi.mock("../components/DashboardSkeleton.jsx", () => ({
  default: () => <div>Dashboard Loading</div>,
}));

vi.mock("../components/Emission.jsx", () => ({
  default: ({ historicalData }) => (
    <div>Historical Total: {historicalData.total_emission_overall}</div>
  ),
}));

vi.mock("../components/DashboardVisualizations.jsx", () => ({
  default: () => <div>Dashboard Visualizations Stub</div>,
}));

vi.mock("../components/EmissionsBySector.jsx", () => ({
  default: () => <div>Sector Breakdown Stub</div>,
}));

import Prediction from "../Pages/Prediction.jsx";
import Dashboard from "../Pages/Dashboard.jsx";
import { apiFetch, predictionFetch } from "../utils/api.js";

describe("Frontend dashboard and prediction pages", () => {
  it("fetches prediction data on mount and renders the resulting widgets", async () => {
    apiFetch.mockReset();
    predictionFetch.mockReset();
    predictionFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        llm_insights: "Predictions look stable.",
        data: {
          total_emissions: 123.45,
          monthly_trends: Array.from({ length: 12 }, () => 10),
        },
      }),
    });

    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: "success" }),
    });

    render(<Prediction userEmail="qa@example.com" />);

    await waitFor(() => {
      expect(predictionFetch).toHaveBeenCalledWith("/api/predict", expect.any(Object));
      expect(apiFetch).toHaveBeenCalledWith("/api/v1/user/history", expect.any(Object));
      expect(screen.getByText(/Prediction Total: 123\.45/i)).toBeInTheDocument();
      expect(screen.getByText(/LLM: Predictions look stable\./i)).toBeInTheDocument();
    });
  });

  it("fetches historical dashboard data and renders visual sections", async () => {
    apiFetch.mockReset();
    apiFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          total_emission_overall: 456.78,
          llm_insights: "Transport remains dominant.",
        }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ status: "success" }),
      });

    render(<Dashboard userEmail="qa@example.com" />);

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledTimes(2);
      expect(screen.getByText(/Historical Total: 456\.78/i)).toBeInTheDocument();
      expect(screen.getByText(/Dashboard Visualizations Stub/i)).toBeInTheDocument();
      expect(screen.getByText(/Sector Breakdown Stub/i)).toBeInTheDocument();
      expect(screen.getByText(/LLM: Transport remains dominant\./i)).toBeInTheDocument();
    });
  });
});
