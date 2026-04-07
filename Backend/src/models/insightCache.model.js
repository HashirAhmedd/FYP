import mongoose from "mongoose";

const insightCacheSchema = new mongoose.Schema(
    {
        cacheKey: {
            type: String,
            required: true,
            unique: true,
            index: true,
        },
        normalizedParams: {
            type: Object,
            required: true,
        },
        insightText: {
            type: String,
            required: true,
            trim: true,
        },
        providerUsed: {
            type: String,
            enum: ["groq", "gemini"],
            required: true,
        },
    },
    { timestamps: true }
);

const InsightCache = mongoose.model("InsightCache", insightCacheSchema);

export default InsightCache;
