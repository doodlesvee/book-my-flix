import { describe, it, expect, vi, beforeEach } from "vitest";
import { ForbiddenException } from "@nestjs/common";
import { RolesGuard } from "./roles.guard";

const mockReflector = {
  getAllAndOverride: vi.fn(),
};

const createMockContext = (role: string) => {
  const request = { user: { sub: 1, email: "test@example.com", role } };
  return {
    switchToHttp: () => ({
      getRequest: () => request,
    }),
    getHandler: () => ({}),
    getClass: () => ({}),
  };
};

describe("RolesGuard", () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard(mockReflector as any);
    vi.clearAllMocks();
  });

  it("should allow access when no roles are required", () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);
    const ctx = createMockContext("REGULAR");

    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
  });

  it("should allow access when user has required role", () => {
    mockReflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    const ctx = createMockContext("ADMIN");

    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
  });

  it("should allow access when user has one of multiple required roles", () => {
    mockReflector.getAllAndOverride.mockReturnValue(["ADMIN", "REGULAR"]);
    const ctx = createMockContext("REGULAR");

    const result = guard.canActivate(ctx as any);

    expect(result).toBe(true);
  });

  it("should throw ForbiddenException when user lacks required role", () => {
    mockReflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    const ctx = createMockContext("REGULAR");

    expect(() => guard.canActivate(ctx as any)).toThrow(ForbiddenException);
  });

  it("should include descriptive error message", () => {
    mockReflector.getAllAndOverride.mockReturnValue(["ADMIN"]);
    const ctx = createMockContext("REGULAR");

    expect(() => guard.canActivate(ctx as any)).toThrow(
      "You do not have permission to access this resource",
    );
  });
});
