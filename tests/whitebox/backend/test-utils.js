import { jest } from "@jest/globals";

export const createMockUserRecord = (overrides = {}) => ({
  _id: "user-1",
  fullName: "Test User",
  email: "tester@example.com",
  refreshToken: null,
  history: [],
  comparePassword: jest.fn(async () => true),
  generateAccessToken: jest.fn(() => "access-token"),
  generateRefreshToken: jest.fn(() => "refresh-token"),
  save: jest.fn(async function save() {
    return this;
  }),
  ...overrides,
});

export async function loadBackendApp({
  userModelOverrides = {},
  prismaOverrides = {},
  geminiResult = "Stable emissions trend.",
} = {}) {
  jest.resetModules();

  process.env.CORS_ORIGIN = "http://localhost:3000";
  process.env.ACCESS_TOKEN_SECRET = "access-secret";
  process.env.REFRESH_TOKEN_SECRET = "refresh-secret";
  process.env.ACCESS_TOKEN_EXPIRY = "15m";
  process.env.REFRESH_TOKEN_EXPIRY = "7d";
  process.env.NODE_ENV = "test";

  const userModel = {
    findOne: jest.fn(),
    create: jest.fn(),
    findById: jest.fn(),
    findOneAndUpdate: jest.fn(),
    ...userModelOverrides,
  };

  const prisma = {
    $queryRawUnsafe: jest.fn(),
    $queryRaw: jest.fn(),
    ...prismaOverrides,
  };

  const generateGeminiInsights = jest.fn(async () => geminiResult);

  jest.unstable_mockModule("../../../Backend/src/models/user.model.js", () => ({
    default: userModel,
  }));

  jest.unstable_mockModule("../../../Backend/src/db/prisma.js", () => ({
    default: prisma,
  }));

  jest.unstable_mockModule("../../../Backend/src/utils/gemini.js", () => ({
    generateGeminiInsights,
  }));

  const { default: app } = await import("../../../Backend/src/app.js");

  return { app, userModel, prisma, generateGeminiInsights };
}
