import prisma from "../db/prisma.js";

const downloadData = async (req, res) => {
    try {
        const { region, gas, startYear, endYear } = req.query;
        const normalizedGas =
            typeof gas === "string" && gas.toLowerCase() === "n2o" ? "nox" : gas;

        if (!startYear || !endYear) {
            return res.status(400).json({
                status: "failed",
                message: "startYear and endYear are required",
            });
        }

        const start = Number(startYear);
        const end = Number(endYear);

        if (!Number.isInteger(start) || !Number.isInteger(end)) {
            return res.status(400).json({
                status: "failed",
                message: "startYear and endYear must be valid integers",
            });
        }

        if (start > end) {
            return res.status(400).json({
                status: "failed",
                message: "startYear must be less than or equal to endYear",
            });
        }

        const params = [start, end];
        let query = `
            SELECT
                e.emission,
                e.year,
                c.name AS region_name,
                g.name AS gas_name,
                ss.name AS subsector_name,
                s.name AS sector_name
            FROM emissions e
            JOIN countries c
                ON e.country_id = c.id
            JOIN gases g
                ON e.gas_id = g.id
            JOIN sub_sectors ss
                ON e.subsector_id = ss.id
            JOIN sectors s
                ON ss.sector_id = s.id
            WHERE e.year BETWEEN $1 AND $2
        `;

        if (region) {
            params.push(region);
            query += ` AND LOWER(c.name) = LOWER($${params.length})`;
        }

        if (normalizedGas) {
            params.push(normalizedGas);
            query += ` AND LOWER(g.name) = LOWER($${params.length})`;
        }

        query += ` ORDER BY e.year ASC, c.name ASC, g.name ASC, s.name ASC, ss.name ASC`;

        const rows = await prisma.$queryRawUnsafe(query, ...params);


        const normalizedRows = rows.map((row) => ({
            year: row.year,
            region: row.region_name,
            gas: row.gas_name,
            sector: row.sector_name,
            subsector: row.subsector_name,
            emission_value: Number(row.emission),
        }));

        return res.status(200).json({
            status: "success",
            filters: {
                region: region || null,
                gas: normalizedGas || null,
                startYear: start,
                endYear: end,
            },
            columns: [
                "year",
                "region",
                "gas",
                "sector",
                "subsector",
                "emission_value",
            ],
            rowCount: normalizedRows.length,
            rows: normalizedRows,
        });
    } catch (error) {
        console.error("Download data error:", error);
        return res.status(500).json({
            status: "failed",
            message: "Failed to fetch data for download",
        });
    }
};

export { downloadData };
