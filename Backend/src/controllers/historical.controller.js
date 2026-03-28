import prisma from "../db/prisma.js";
import { generateGeminiInsights } from "../utils/gemini.js";

const getSectorEmissions = async (req, res) => {
    try {
        const { country, sector_name, start_year, end_year, gas_name } = req.body;

        if (!country || !sector_name || !start_year || !end_year) {
            return res.status(400).json({
                error: "country, sector_name, start_year, end_year are required",
            });
        }

        // 0. Fetch country ID
        const countryResult = await prisma.$queryRaw`
            SELECT id FROM countries WHERE LOWER(name) = LOWER(${country})
        `;

        if (countryResult.length === 0) {
            return res.status(404).json({ error: "Country not found" });
        }

        const countryId = countryResult[0].id;

        // 1. Fetch sector ID
        const sectorResult = await prisma.$queryRaw`
            SELECT id FROM sectors WHERE LOWER(name) = LOWER(${sector_name})
        `;

        if (sectorResult.length === 0) {
            return res.status(404).json({ error: "Sector not found" });
        }

        const sectorId = sectorResult[0].id;

        // 2. Fetch subsectors
        const subsectors = await prisma.$queryRaw`
            SELECT id, name FROM sub_sectors WHERE sector_id = ${sectorId}
        `;

        if (subsectors.length === 0) {
            return res.status(404).json({
                error: "No subsectors found for this sector",
            });
        }

        const subsectorIds = subsectors.map((s) => s.id);
        const subsectorNames = {};
        for (const s of subsectors) {
            subsectorNames[s.id] = s.name;
        }

        // 3. Resolve gas ID (optional)
        let gasId = null;
        if (gas_name) {
            const gasQueryName =
                gas_name.toLowerCase() === "n2o" ? "nox" : gas_name;

            const gasRow = await prisma.$queryRaw`
                SELECT id FROM gases WHERE LOWER(name) = LOWER(${gasQueryName})
            `;

            if (gasRow.length === 0) {
                return res.status(404).json({ error: "Gas not found" });
            }

            gasId = gasRow[0].id;
        }

        // 4. Main emission query
        let rows;
        if (gasId) {
            rows = await prisma.$queryRaw`
                SELECT e.subsector_id, e.year, SUM(e.emission) AS total_emission
                FROM emissions e
                                WHERE e.country_id = ${countryId}
                  AND e.subsector_id = ANY(${subsectorIds}::int[])
                  AND e.year BETWEEN ${start_year} AND ${end_year}
                  AND e.gas_id = ${gasId}
                GROUP BY e.subsector_id, e.year
                ORDER BY e.year
            `;
        } else {
            rows = await prisma.$queryRaw`
                SELECT e.subsector_id, e.year, SUM(e.emission) AS total_emission
                FROM emissions e
                                WHERE e.country_id = ${countryId}
                  AND e.subsector_id = ANY(${subsectorIds}::int[])
                  AND e.year BETWEEN ${start_year} AND ${end_year}
                GROUP BY e.subsector_id, e.year
                ORDER BY e.year
            `;
        }

        // 5. Gas ratio query
        const gasRows = await prisma.$queryRaw`
            SELECT g.name, SUM(e.emission) AS total
            FROM emissions e
            JOIN gases g ON e.gas_id = g.id
                        WHERE e.country_id = ${countryId}
              AND e.subsector_id = ANY(${subsectorIds}::int[])
              AND e.year BETWEEN ${start_year} AND ${end_year}
              AND LOWER(g.name) IN ('co2', 'ch4', 'nox')
            GROUP BY g.name
        `;

        // Build gas totals
        const gasTotalsRaw = {};
        for (const row of gasRows) {
            let key = row.name.toLowerCase();
            if (key === "nox") key = "n2o";
            gasTotalsRaw[key] = Number(row.total);
        }

        const gasTotals = {
            co2: gasTotalsRaw.co2 || 0,
            ch4: gasTotalsRaw.ch4 || 0,
            n2o: gasTotalsRaw.n2o || 0,
        };

        // Gas ratios
        const gasSum = gasTotals.co2 + gasTotals.ch4 + gasTotals.n2o;
        const gasRatios = {};
        for (const [g, v] of Object.entries(gasTotals)) {
            gasRatios[g] =
                gasSum > 0
                    ? Math.round((v / gasSum) * 100 * 10000) / 10000
                    : 0;
        }

        // Yearly totals & total emission
        const yearlyTotals = {};
        let totalEmissionAll = 0;

        for (const r of rows) {
            const y = r.year;
            const e = Number(r.total_emission);
            yearlyTotals[y] = (yearlyTotals[y] || 0) + e;
            totalEmissionAll += e;
        }

        // Subsector breakdown
        const subsectorDetails = {};

        for (const r of rows) {
            const name = subsectorNames[r.subsector_id];
            const year = r.year;
            const emission = Number(r.total_emission);

            if (!subsectorDetails[name]) {
                subsectorDetails[name] = {
                    total_emission: 0,
                    yearly_emission: {},
                };
            }

            subsectorDetails[name].yearly_emission[year] = emission;
            subsectorDetails[name].total_emission += emission;
        }

        // Add percentages
        for (const data of Object.values(subsectorDetails)) {
            const rawPct =
                totalEmissionAll > 0
                    ? (data.total_emission / totalEmissionAll) * 100
                    : 0;

            data.percentage =
                rawPct >= 0.01
                    ? Math.round(rawPct * 100) / 100
                    : Math.round(rawPct * 10000) / 10000;
        }

        // Top emitting subsector
        let topSubsector = null;
        let maxEmission = -1;
        for (const [name, data] of Object.entries(subsectorDetails)) {
            if (data.total_emission > maxEmission) {
                maxEmission = data.total_emission;
                topSubsector = name;
            }
        }

        const finalResponse = {
            country,
            sector_name,
            gas_name: gas_name || null,
            total_emission_overall: totalEmissionAll,
            yearly_totals: yearlyTotals,
            top_emitting_subsector: topSubsector,
            subsector_breakdown: subsectorDetails,
            ratios: gasRatios,
        };

        // Generate LLM insights
        try {
            const llmInsights = await generateGeminiInsights(finalResponse);
            finalResponse.llm_insights = llmInsights;
        } catch (err) {
            console.error("LLM Insights Error:", err.message);
            finalResponse.llm_insights = "Insights generation failed";
        }

        return res.status(200).json(finalResponse);
    } catch (error) {
        console.error("Historical emissions error:", error);
        return res.status(500).json({ error: "Failed to fetch historical data" });
    }
};

export { getSectorEmissions };
