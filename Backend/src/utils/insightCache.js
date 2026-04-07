import crypto from "crypto";
import InsightCache from "../models/insightCache.model.js";

const normalizeText = (value) =>
    typeof value === "string" ? value.trim().toLowerCase() : null;

const buildInsightCacheKey = ({
    country,
    sector_name,
    start_year,
    end_year,
    gas_name,
}) => {
    const normalizedParams = {
        country: normalizeText(country),
        sector_name: normalizeText(sector_name),
        start_year: Number(start_year),
        end_year: Number(end_year),
        gas_name: normalizeText(gas_name),
    };

    const cacheKey = crypto
        .createHash("sha256")
        .update(JSON.stringify(normalizedParams))
        .digest("hex");

    return {
        cacheKey,
        normalizedParams,
    };
};

const getCachedInsightByKey = async (cacheKey) => {
    return InsightCache.findOne({ cacheKey }).lean();
};

const saveInsightCache = async ({
    cacheKey,
    normalizedParams,
    insightText,
    providerUsed,
}) => {
    if (!insightText) return null;

    return InsightCache.findOneAndUpdate(
        { cacheKey },
        {
            $setOnInsert: {
                cacheKey,
                normalizedParams,
                insightText,
                providerUsed,
            },
        },
        { upsert: true, returnDocument: "after" }
    );
};

export {
    buildInsightCacheKey,
    getCachedInsightByKey,
    saveInsightCache,
};
