import { useEffect, useState } from "react";
import EmissionPrediction from "../components/EmissionPrediction";
import ForecastsConfiguration from "../components/ForecastsConfiguration";
import MonthlyTrends from "../components/MonthlyTrends";
import PredictionSkeleton from "../components/PredictionSkeleton";
import LLMResponse from "../components/LLMResponse";
import { apiFetch, predictionFetch } from "../utils/api";

export default function Prediction({ userEmail }) {
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);

  useEffect(() => {
    fetchPrediction({
      country: "PAK",
      sector: "transportation",
      gas: "co2",
      year: 2025,
      month: 1,
    });
  }, []);

  const fetchPrediction = async (forecastConfiguration) => {
    setLoading(true);
    try {
      //fetching prediction
      const response = await predictionFetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(forecastConfiguration),
      });

      //saving user history
      await apiFetch("/api/v1/user/history", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userEmail,
          sector: forecastConfiguration.sector,
          emission: forecastConfiguration.gas,
          yearRange: `${forecastConfiguration.year}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      setPrediction(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching historical data:", error);
    }
  };

  return (
    <div className="space-y-10 p-6 min-h-screen">
      <ForecastsConfiguration fetchPrediction={fetchPrediction} />

      {loading ? (
        <PredictionSkeleton />
      ) : (
        <>
          {prediction != null && <EmissionPrediction prediction={prediction} />}
          {prediction != null && <MonthlyTrends prediction={prediction} />}
          {prediction != null && (
            <LLMResponse response={prediction.llm_insights} />
          )}
        </>
      )}
    </div>
  );
}
