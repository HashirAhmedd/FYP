import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("../utils/api.js", () => ({
  apiFetch: vi.fn(),
}));

import AuthModal from "../Pages/AuthModal.jsx";
import { apiFetch } from "../utils/api.js";

describe("Frontend AuthModal", () => {
  it("logs a user in and forwards the user payload", async () => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: "success",
        message: "Login successful",
        user: { email: "qa@example.com", fullName: "QA User" },
      }),
    });

    const onLoginSuccess = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<AuthModal onLoginSuccess={onLoginSuccess} />);

    await user.type(screen.getByPlaceholderText(/you@example\.com/i), "qa@example.com");
    await user.type(container.querySelector('input[type="password"]'), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(apiFetch).toHaveBeenCalledWith("/api/v1/user/login", expect.any(Object));
      expect(onLoginSuccess).toHaveBeenCalledWith({
        email: "qa@example.com",
        fullName: "QA User",
      });
    });
  });

  it("prevents signup when passwords do not match", async () => {
    apiFetch.mockReset();
    const user = userEvent.setup();
    const { container } = render(<AuthModal onLoginSuccess={vi.fn()} />);

    await user.click(screen.getByRole("button", { name: /create one/i }));
    await screen.findByRole("button", { name: /create account/i });
    await user.type(screen.getByPlaceholderText(/hahsir ahmed/i), "QA User");
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), "qa@example.com");

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0], "secret123");
    await user.type(passwordInputs[1], "different123");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    expect(window.alert).toHaveBeenCalledWith("Passwords do not match");
    expect(apiFetch).not.toHaveBeenCalled();
  });

  it("prevents signup when the password is shorter than 8 characters", async () => {
    // Arrange
    apiFetch.mockReset();
    const user = userEvent.setup();
    const { container } = render(<AuthModal onLoginSuccess={vi.fn()} />);

    // Act
    await user.click(screen.getByRole("button", { name: /create one/i }));
    await screen.findByRole("button", { name: /create account/i });
    await user.type(screen.getByPlaceholderText(/hahsir ahmed/i), "QA User");
    await user.type(screen.getByPlaceholderText(/you@example\.com/i), "qa@example.com");

    const passwordInputs = container.querySelectorAll('input[type="password"]');
    await user.type(passwordInputs[0], "short7");
    await user.type(passwordInputs[1], "short7");
    await user.click(screen.getByRole("button", { name: /create account/i }));

    // Assert
    expect(apiFetch).not.toHaveBeenCalled();
    expect(window.alert).toHaveBeenCalledWith(
      expect.stringContaining("at least 8 characters"),
    );
  });

});
