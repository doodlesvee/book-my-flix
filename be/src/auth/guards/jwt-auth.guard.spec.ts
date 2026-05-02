import { describe, it, expect, vi, beforeEach } from "vitest";
import { UnauthorizedException } from "@nestjs/common";
import { JwtAuthGuard } from "./jwt-auth.guard";

const mockJwtService = {
  verify: vi.fn(),
};

const createMockContext = (authHeader?: string) => {
  const request: any = {
    headers: {
      authorization: authHeader,
    },
  };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    request,
  };
};

describe("JwtAuthGuard", () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard(mockJwtService as any);
    vi.clearAllMocks();
  });

  it("should allow access with valid token", () => {
    const payload = { sub: 1, email: "test@example.com", role: "REGULAR" };
    mockJwtService.verify.mockReturnValue(payload);
    const ctx = createMockContext("Bearer valid_token");

    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
    expect(ctx.request.user).toEqual(payload);
  });

  it("should throw UnauthorizedException when no auth header", () => {
    const ctx = createMockContext(undefined);

    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException when header doesn't start with Bearer", () => {
    const ctx = createMockContext("Basic some_token");

    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it("should throw UnauthorizedException for invalid token", () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error("invalid");
    });
    const ctx = createMockContext("Bearer invalid_token");

    expect(() => guard.canActivate(ctx as any)).toThrow(UnauthorizedException);
  });

  it("should throw with 'Missing or invalid token' for missing header", () => {
    const ctx = createMockContext(undefined);

    expect(() => guard.canActivate(ctx as any)).toThrow(
      "Missing or invalid token",
    );
  });

  it("should throw with 'Invalid or expired token' for bad token", () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error("expired");
    });
    const ctx = createMockContext("Bearer expired_token");

    expect(() => guard.canActivate(ctx as any)).toThrow(
      "Invalid or expired token",
    );
  });

  it("should extract token after 'Bearer '", () => {
    mockJwtService.verify.mockReturnValue({ sub: 1 });
    const ctx = createMockContext("Bearer my_jwt_token");

    guard.canActivate(ctx as any);

    expect(mockJwtService.verify).toHaveBeenCalledWith("my_jwt_token");
  });
});
