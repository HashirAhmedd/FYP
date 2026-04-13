import request from "supertest";
import { describe, expect, it, jest } from "@jest/globals";
import { loadBackendApp } from "./test-utils.js";

describe("Backend historical and download routes", () => {
  it("rejects historical requests with missing required filters", async () => {
    const { app } = await loadBackendApp();

    const response = await request(app).post("/api/v1/historical").send({
      country: "PAK",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain("required");
  });

  it("returns historical sector emissions with ratios and LLM insights", async () => {
    const prismaQuery = jest
      .fn()
      .mockResolvedValueOnce([{ id: 1 }])
      .mockResolvedValueOnce([{ id: 7 }])
      .mockResolvedValueOnce([
        { id: 70, name: "Road Transport" },
        { id: 71, name: "Rail Transport" },
      ])
      .mockResolvedValueOnce([{ id: 3 }])
      .mockResolvedValueOnce([
        { subsector_id: 70, year: 2020, total_emission: 100 },
        { subsector_id: 71, year: 2020, total_emission: 50 },
      ])
      .mockResolvedValueOnce([
        { name: "co2", total: 90 },
        { name: "ch4", total: 30 },
        { name: "nox", total: 30 },
      ]);

    const { app, generateGeminiInsights } = await loadBackendApp({
      prismaOverrides: {
        $queryRaw: prismaQuery,
      },
      geminiResult: "Road transport dominates emissions.",
    });

    const response = await request(app).post("/api/v1/historical").send({
      country: "PAK",
      sector_name: "transportation",
      gas_name: "co2",
      start_year: 2020,
      end_year: 2024,
    });

    expect(response.status).toBe(200);
    expect(response.body.total_emission_overall).toBe(150);
    expect(response.body.top_emitting_subsector).toBe("Road Transport");
    expect(response.body.ratios).toEqual({
      co2: 60,
      ch4: 20,
      n2o: 20,
    });
    expect(response.body.llm_insights).toBe(
      "Road transport dominates emissions.",
    );
    expect(generateGeminiInsights).toHaveBeenCalled();
  });

  it("returns 404 when the requested country does not exist", async () => {
    const { app } = await loadBackendApp({
      prismaOverrides: {
        $queryRaw: jest.fn().mockResolvedValueOnce([]),
      },
    });

    const response = await request(app).post("/api/v1/historical").send({
      country: "XYZ",
      sector_name: "transportation",
      start_year: 2020,
      end_year: 2024,
    });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe("Country not found");
  });

  it("rejects download requests when the year range is inverted", async () => {
    const { app } = await loadBackendApp();

    const response = await request(app).get(
      "/api/v1/data/download?startYear=2025&endYear=2020",
    );

    expect(response.status).toBe(400);
    expect(response.body.message).toBe(
      "startYear must be less than or equal to endYear",
    );
  });

  it("returns normalized download rows for valid filters", async () => {
    const queryMock = jest.fn().mockResolvedValue([
      {
        emission: "12.5",
        year: 2024,
        region_name: "Pakistan",
        gas_name: "co2",
        subsector_name: "Road Transport",
        sector_name: "Transportation",
      },
    ]);

    const { app, prisma } = await loadBackendApp({
      prismaOverrides: {
        $queryRawUnsafe: queryMock,
      },
    });

    const response = await request(app).get(
      "/api/v1/data/download?region=pakistan&gas=n2o&startYear=2020&endYear=2024",
    );

    expect(response.status).toBe(200);
    expect(prisma.$queryRawUnsafe).toHaveBeenCalled();
    expect(response.body.filters).toEqual({
      region: "pakistan",
      gas: "nox",
      startYear: 2020,
      endYear: 2024,
    });
    expect(response.body.rows[0]).toEqual({
      year: 2024,
      region: "Pakistan",
      gas: "co2",
      sector: "Transportation",
      subsector: "Road Transport",
      emission_value: 12.5,
    });
  });
});
