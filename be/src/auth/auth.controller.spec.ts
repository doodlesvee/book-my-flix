import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthController } from "./auth.controller";

const mockAuthService = {
  signup: vi.fn(),
  login: vi.fn(),
};

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(() => {
    controller = new AuthController(mockAuthService as any);
    vi.clearAllMocks();
  });

  describe("signup", () => {
    it("should return access token on successful signup", async () => {
      mockAuthService.signup.mockResolvedValue({
        access_token: "mock_token",
      });

      const result = await controller.signup({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

      expect(result).toEqual({ access_token: "mock_token" });
      expect(mockAuthService.signup).toHaveBeenCalledWith({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });
    });

    it("should propagate ConflictException for duplicate email", async () => {
      const { ConflictException } = await import("@nestjs/common");
      mockAuthService.signup.mockRejectedValue(
        new ConflictException("Email already in use"),
      );

      await expect(
        controller.signup({
          email: "test@example.com",
          name: "Test User",
          password: "password123",
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("login", () => {
    it("should return access token on successful login", async () => {
      mockAuthService.login.mockResolvedValue({
        access_token: "mock_token",
      });

      const result = await controller.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({ access_token: "mock_token" });
      expect(mockAuthService.login).toHaveBeenCalledWith({
        email: "test@example.com",
        password: "password123",
      });
    });

    it("should propagate UnauthorizedException for invalid credentials", async () => {
      const { UnauthorizedException } = await import("@nestjs/common");
      mockAuthService.login.mockRejectedValue(
        new UnauthorizedException("Invalid credentials"),
      );

      await expect(
        controller.login({
          email: "test@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
