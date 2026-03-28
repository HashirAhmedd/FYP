const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
const PREDICTION_API_BASE_URL = import.meta.env.VITE_PREDICTION_API_BASE_URL || "";

const joinUrl = (base, path) => {
    if (!base) return path;

    const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
    const normalizedPath = path.startsWith("/") ? path : `/${path}`;
    return `${normalizedBase}${normalizedPath}`;
};

export const buildApiUrl = (path) => joinUrl(API_BASE_URL, path);
export const buildPredictionApiUrl = (path) =>
    joinUrl(PREDICTION_API_BASE_URL, path);

export const apiFetch = (path, options = {}) => {
    const { headers = {}, ...restOptions } = options;

    return fetch(buildApiUrl(path), {
        credentials: "include",
        headers,
        ...restOptions,
    });
};

export const predictionFetch = (path, options = {}) => {
    const { headers = {}, ...restOptions } = options;

    return fetch(buildPredictionApiUrl(path), {
        credentials: "include",
        headers,
        ...restOptions,
    });
};
