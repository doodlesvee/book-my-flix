import { describe, it, expect, vi, beforeEach } from "vitest";
import { ConflictException, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "./auth.service";

// Mock bcrypt
vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
    compare: vi.fn(),
  },
  hash: vi.fn().mockResolvedValue("hashed_password"),
  compare: vi.fn(),
}));

import * as bcrypt from "bcrypt";

const mockUser = {
  id: 1,
  email: "test@example.com",
  name: "Test User",
  password: "hashed_password",
  role: "REGULAR",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
};

const mockJwtService = {
  sign: vi.fn().mockReturnValue("mock_token"),
};

describe("AuthService", () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService(mockPrisma as any, mockJwtService as any);
    vi.clearAllMocks();
    (bcrypt.hash as any).mockResolvedValue("hashed_password");
    mockJwtService.sign.mockReturnValue("mock_token");
  });

  describe("signup", () => {
    it("should create user and return access token", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      const result = await service.signup({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

      expect(result).toEqual({ access_token: "mock_token" });
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: "test@example.com",
          name: "Test User",
          password: "hashed_password",
        },
      });
    });

    it("should hash the password before storing", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.signup({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

      expect(bcrypt.hash).toHaveBeenCalledWith("password123", 10);
    });

    it("should throw ConflictException if email already in use", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.signup({
          email: "test@example.com",
          name: "Test User",
          password: "password123",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should include descriptive message for duplicate email", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.signup({
          email: "test@example.com",
          name: "Test User",
          password: "password123",
        }),
      ).rejects.toThrow("Email already in use");
    });

    it("should generate token with user id, email, and role", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.signup({
        email: "test@example.com",
        name: "Test User",
        password: "password123",
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: "test@example.com",
        role: "REGULAR",
      });
    });

    it("should not create user if email check fails", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.signup({
          email: "test@example.com",
          name: "Test User",
          password: "password123",
        }),
      ).rejects.toThrow();

      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });
  });

  describe("login", () => {
    it("should return access token for valid credentials", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      const result = await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(result).toEqual({ access_token: "mock_token" });
    });

    it("should throw UnauthorizedException if user not found", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should throw UnauthorizedException if password invalid", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({
          email: "test@example.com",
          password: "wrongpassword",
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it("should use 'Invalid credentials' message for both cases", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: "nonexistent@example.com",
          password: "password123",
        }),
      ).rejects.toThrow("Invalid credentials");

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(false);

      await expect(
        service.login({
          email: "test@example.com",
          password: "wrong",
        }),
      ).rejects.toThrow("Invalid credentials");
    });

    it("should compare password with stored hash", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(bcrypt.compare).toHaveBeenCalledWith(
        "password123",
        "hashed_password",
      );
    });

    it("should generate token with correct payload on login", async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      (bcrypt.compare as any).mockResolvedValue(true);

      await service.login({
        email: "test@example.com",
        password: "password123",
      });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: 1,
        email: "test@example.com",
        role: "REGULAR",
      });
    });
  });
});
