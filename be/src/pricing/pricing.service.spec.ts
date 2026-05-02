import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { PricingService } from "./pricing.service";

const mockPricing = {
  id: 1,
  price: 200,
  category: "SILVER",
  slot: "EVENING",
  dayType: "WEEKDAY",
  theaterId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  pricing: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("PricingService", () => {
  let service: PricingService;

  beforeEach(() => {
    service = new PricingService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create and return pricing", async () => {
      mockPrisma.pricing.create.mockResolvedValue(mockPricing);

      const result = await service.create({
        price: 200,
        category: "SILVER" as any,
        slot: "EVENING" as any,
        dayType: "WEEKDAY" as any,
        theaterId: 1,
      });

      expect(result).toEqual(mockPricing);
      expect(mockPrisma.pricing.create).toHaveBeenCalledWith({
        data: {
          price: 200,
          category: "SILVER",
          slot: "EVENING",
          dayType: "WEEKDAY",
          theaterId: 1,
        },
      });
    });

    it("should throw ConflictException on duplicate pricing", async () => {
      mockPrisma.pricing.create.mockRejectedValue({ code: "P2002" });

      await expect(
        service.create({
          price: 200,
          category: "SILVER" as any,
          slot: "EVENING" as any,
          dayType: "WEEKDAY" as any,
          theaterId: 1,
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should include category/slot/dayType in conflict error message", async () => {
      mockPrisma.pricing.create.mockRejectedValue({ code: "P2002" });

      await expect(
        service.create({
          price: 200,
          category: "SILVER" as any,
          slot: "EVENING" as any,
          dayType: "WEEKDAY" as any,
          theaterId: 1,
        }),
      ).rejects.toThrow(
        "Pricing for SILVER/EVENING/WEEKDAY already exists for this theater",
      );
    });

    it("should rethrow non-P2002 errors", async () => {
      mockPrisma.pricing.create.mockRejectedValue(new Error("DB error"));

      await expect(
        service.create({
          price: 200,
          category: "SILVER" as any,
          slot: "EVENING" as any,
          dayType: "WEEKDAY" as any,
          theaterId: 1,
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return all pricing when no filter", async () => {
      mockPrisma.pricing.findMany.mockResolvedValue([mockPricing]);

      const result = await service.findAll();

      expect(result).toEqual([mockPricing]);
      expect(mockPrisma.pricing.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it("should filter by theaterId", async () => {
      mockPrisma.pricing.findMany.mockResolvedValue([mockPricing]);

      await service.findAll(1);

      expect(mockPrisma.pricing.findMany).toHaveBeenCalledWith({
        where: { theaterId: 1 },
      });
    });

    it("should return empty array when no pricing match", async () => {
      mockPrisma.pricing.findMany.mockResolvedValue([]);

      const result = await service.findAll(999);

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return pricing when found", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(mockPricing);

      const result = await service.findOne(1);

      expect(result).toEqual(mockPricing);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should include pricing id in error message", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Pricing with id 42 not found",
      );
    });
  });

  describe("update", () => {
    it("should update and return pricing", async () => {
      const updated = { ...mockPricing, price: 300 };
      mockPrisma.pricing.findUnique.mockResolvedValue(mockPricing);
      mockPrisma.pricing.update.mockResolvedValue(updated);

      const result = await service.update(1, { price: 300 });

      expect(result.price).toBe(300);
    });

    it("should throw NotFoundException if pricing does not exist", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { price: 300 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should not call prisma update if pricing not found", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { price: 300 })).rejects.toThrow();

      expect(mockPrisma.pricing.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete and return pricing", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(mockPricing);
      mockPrisma.pricing.delete.mockResolvedValue(mockPricing);

      const result = await service.remove(1);

      expect(result).toEqual(mockPricing);
      expect(mockPrisma.pricing.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException if pricing does not exist", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not call prisma delete if pricing not found", async () => {
      mockPrisma.pricing.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();

      expect(mockPrisma.pricing.delete).not.toHaveBeenCalled();
    });
  });
});
