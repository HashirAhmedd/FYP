import "@testing-library/jest-dom/vitest";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { cleanup } from "@testing-library/react";

beforeAll(() => {
    vi.stubGlobal("alert", vi.fn());

    if (!window.URL.createObjectURL) {
        window.URL.createObjectURL = vi.fn(() => "blob:mock-url");
    } else {
        vi.spyOn(window.URL, "createObjectURL").mockImplementation(() => "blob:mock-url");
    }

    if (!window.URL.revokeObjectURL) {
        window.URL.revokeObjectURL = vi.fn();
    } else {
        vi.spyOn(window.URL, "revokeObjectURL").mockImplementation(() => undefined);
    }

    vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
});

afterAll(() => {
    vi.restoreAllMocks();
});
