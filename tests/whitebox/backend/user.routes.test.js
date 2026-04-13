import request from "supertest";
import { describe, expect, it, jest } from "@jest/globals";
import { createMockUserRecord, loadBackendApp } from "./test-utils.js";

describe("Backend auth and history routes", () => {
  it("rejects signup when required fields are missing", async () => {
    const { app } = await loadBackendApp();

    const response = await request(app).post("/api/v1/user/signup").send({
      email: "missing-name@example.com",
    });

    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: "failed",
      message: expect.stringContaining("Missing required fields"),
    });
  });

  it("creates a user on successful signup", async () => {
    // Arrange
    const createdUser = { _id: "user-1" };
    const publicUser = {
      _id: "user-1",
      fullName: "Ada Lovelace",
      email: "ada@example.com",
    };

    const { app, userModel } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue(createdUser),
        findById: jest.fn(() => ({
          select: jest.fn().mockResolvedValue(publicUser),
        })),
      },
    });

    // Act
    const response = await request(app).post("/api/v1/user/signup").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret123",
    });

    // Assert
    expect(response.status).toBe(201);
    expect(userModel.create).toHaveBeenCalledWith({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret123",
    });
    expect(response.body.user).toEqual(publicUser);
  });

  it("rejects signup when the password is shorter than 8 characters", async () => {
    // Arrange
    const { app, userModel } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({ _id: "user-short" }),
        findById: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({
            _id: "user-short",
            fullName: "Ada Lovelace",
            email: "ada@example.com",
          }),
        })),
      },
    });

    // Act
    const response = await request(app).post("/api/v1/user/signup").send({
      fullName: "Ada Lovelace",
      email: "ada@example.com",
      password: "secret7",
    });

    // Assert
    expect(response.status).toBe(400);
    expect(response.body).toMatchObject({
      status: "failed",
      message: expect.stringContaining("at least 8 characters"),
    });
    expect(userModel.create).not.toHaveBeenCalled();
  });

  it("rejects login when the password is invalid", async () => {
    const mockUser = createMockUserRecord({
      comparePassword: jest.fn(async () => false),
    });

    const { app } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn().mockResolvedValue(mockUser),
      },
    });

    const response = await request(app).post("/api/v1/user/login").send({
      email: "tester@example.com",
      password: "wrong-password",
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid email or password");
  });

  it("logs a user in and sets both auth cookies", async () => {
    const mockUser = createMockUserRecord();
    const publicUser = {
      _id: "user-1",
      fullName: "Test User",
      email: "tester@example.com",
    };

    const { app } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn().mockResolvedValue(mockUser),
        findById: jest.fn(() => ({
          select: jest.fn().mockResolvedValue(publicUser),
        })),
      },
    });

    const response = await request(app).post("/api/v1/user/login").send({
      email: "tester@example.com",
      password: "secret123",
    });

    expect(response.status).toBe(200);
    expect(response.headers["set-cookie"]).toEqual(
      expect.arrayContaining([
        expect.stringContaining("accessToken=access-token"),
        expect.stringContaining("refreshToken=refresh-token"),
      ]),
    );
    expect(response.body.user).toEqual(publicUser);
  });

  it("rejects refresh token requests when the token is missing", async () => {
    const { app } = await loadBackendApp();

    const response = await request(app).post("/api/v1/user/refresh-token");

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Refresh token is missing");
  });

  it("stores a history entry for a valid user", async () => {
    const mockUser = createMockUserRecord({
      history: [],
    });

    const { app } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn().mockResolvedValue(mockUser),
      },
    });

    const response = await request(app).post("/api/v1/user/history").send({
      email: "tester@example.com",
      sector: "transportation",
      emission: "co2",
      yearRange: "2020-2024",
    });

    expect(response.status).toBe(201);
    expect(response.body.history).toHaveLength(1);
    expect(response.body.history[0]).toMatchObject({
      sector: "Transportation",
      emission: "CO2",
      yearRange: "2020-2024",
    });
  });

  it("returns stored user history by email", async () => {
    const history = [
      {
        sector: "Transportation",
        emission: "CO2",
        yearRange: "2020-2024",
      },
    ];

    const { app } = await loadBackendApp({
      userModelOverrides: {
        findOne: jest.fn(() => ({
          select: jest.fn().mockResolvedValue({ history }),
        })),
      },
    });

    const response = await request(app).get(
      "/api/v1/user/history/tester@example.com",
    );

    expect(response.status).toBe(200);
    expect(response.body.history).toEqual(history);
  });

  it("clears cookies during logout", async () => {
    const { app, userModel } = await loadBackendApp({
      userModelOverrides: {
        findOneAndUpdate: jest.fn().mockResolvedValue({}),
      },
    });

    const response = await request(app)
      .post("/api/v1/user/logout")
      .set("Cookie", ["refreshToken=refresh-token"])
      .send({ refreshToken: "refresh-token" });

    expect(response.status).toBe(200);
    expect(userModel.findOneAndUpdate).toHaveBeenCalled();
    expect(response.body.message).toBe("Logout successful");
  });

});
