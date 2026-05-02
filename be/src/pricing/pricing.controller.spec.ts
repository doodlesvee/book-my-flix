import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { PricingController } from "./pricing.controller";

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

const mockPricingService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe("PricingController", () => {
  let controller: PricingController;

  beforeEach(() => {
    controller = new PricingController(mockPricingService as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create pricing", async () => {
      mockPricingService.create.mockResolvedValue(mockPricing);

      const dto = {
        price: 200,
        category: "SILVER" as any,
        slot: "EVENING" as any,
        dayType: "WEEKDAY" as any,
        theaterId: 1,
      };
      const result = await controller.create(dto);

      expect(result).toEqual(mockPricing);
      expect(mockPricingService.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate service errors", async () => {
      mockPricingService.create.mockRejectedValue(new Error("Conflict"));

      await expect(
        controller.create({
          price: 200,
          category: "SILVER" as any,
          slot: "EVENING" as any,
          dayType: "WEEKDAY" as any,
          theaterId: 1,
        }),
      ).rejects.toThrow("Conflict");
    });
  });

  describe("findAll", () => {
    it("should return all pricing without filter", async () => {
      mockPricingService.findAll.mockResolvedValue([mockPricing]);

      const result = await controller.findAll();

      expect(result).toEqual([mockPricing]);
      expect(mockPricingService.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should parse theaterId string to number", async () => {
      mockPricingService.findAll.mockResolvedValue([mockPricing]);

      await controller.findAll("1");

      expect(mockPricingService.findAll).toHaveBeenCalledWith(1);
    });

    it("should return empty array when no pricing match", async () => {
      mockPricingService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("999");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return pricing by id", async () => {
      mockPricingService.findOne.mockResolvedValue(mockPricing);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockPricing);
    });

    it("should propagate NotFoundException", async () => {
      mockPricingService.findOne.mockRejectedValue(
        new NotFoundException("Pricing with id 999 not found"),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update pricing", async () => {
      const updated = { ...mockPricing, price: 300 };
      mockPricingService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { price: 300 });

      expect(result.price).toBe(300);
    });

    it("should propagate NotFoundException on update", async () => {
      mockPricingService.update.mockRejectedValue(
        new NotFoundException("Pricing with id 999 not found"),
      );

      await expect(controller.update(999, { price: 300 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete pricing", async () => {
      mockPricingService.remove.mockResolvedValue(mockPricing);

      const result = await controller.remove(1);

      expect(result).toEqual(mockPricing);
    });

    it("should propagate NotFoundException on remove", async () => {
      mockPricingService.remove.mockRejectedValue(
        new NotFoundException("Pricing with id 999 not found"),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
