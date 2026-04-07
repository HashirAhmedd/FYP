import Emission from "../components/Emission";
import Filters from "../components/Filters";
import DashboardVisualizations from "../components/DashboardVisualizations";
import EmissionsBySector from "../components/EmissionsBySector";
import { useEffect, useState } from "react";
import DashboardSkeleton from "../components/DashboardSkeleton";
import LLMResponse from "../components/LLMResponse";
import { apiFetch } from "../utils/api";

export default function Dashboard({ userEmail }) {
  const [historicalData, setHistoricalData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistoricalData({
      country: "PAK",
      sector_name: "transportation",
      gas_name: "co2",
      start_year: 2020,
      end_year: 2024,
    });
  }, []);

  const fetchHistoricalData = async (filtersObject) => {
    setLoading(true);
    try {
      //fetching historical data
      const response = await apiFetch("/api/v1/historical", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(filtersObject),
      });

      //saving user history
      await apiFetch("/api/v1/user/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          sector: filtersObject.sector_name,
          emission: filtersObject.gas_name,
          yearRange: `${filtersObject.start_year}-${filtersObject.end_year}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setHistoricalData(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  return (
    <div className="space-y-10 p-6 min-h-screen">
      <Filters fetchHistoricalData={fetchHistoricalData} />
      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          {historicalData != null && (
            <Emission historicalData={historicalData} />
          )}
          {historicalData != null && (
            <DashboardVisualizations historicalData={historicalData} />
          )}
          {historicalData != null && (
            <EmissionsBySector historicalData={historicalData} />
          )}
          {historicalData != null && historicalData.llm_insights &&(
            <LLMResponse response={historicalData.llm_insights} />
          )}
        </>
      )}
    </div>
  );
}
