import { GoogleGenerativeAI } from "@google/generative-ai";
import "dotenv/config"

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateGeminiInsights = async (finalResponse) => {
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `You are an expert climate data analyst assisting on a project called **ClimaX-AI**.

**Project context:**
ClimaX-AI is a climate data visualization and predictive modeling platform focused on South Asia Countries. It analyzes historical and predicted Greenhouse Gas (GHG) emissions across sectors and subsectors, specifically for:
- Carbon Dioxide (CO₂)
- Methane (CH₄)
- Nitrous Oxide (N₂O)

The platform generates visualizations of past trends and uses AI/ML models to forecast future emissions. The primary audience includes policymakers and NGO professionals who rely on clear, actionable insights for climate decision-making in Pakistan/SouthAsia.

**Task:**
You are given a combined data response from the database (historical) and the prediction model:
${JSON.stringify(finalResponse)}

Analyze this data and produce concise insights that:
- Highlight key trends and patterns
- Identify notable anomalies or shifts
- Explain potential implications for climate policy and mitigation strategies in Pakistan

**Constraints:**
- Maximum length: 200 words
- Be direct, analytical, and policy-focused
- Do NOT include introductions, conclusions, headings, or meta commentary
- Output only the insights`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    return response.text();
};

export { generateGeminiInsights };
