import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { TheatersService } from "./theaters.service";

const mockTheater = {
  id: 1,
  name: "PVR Cinemas",
  city: "Mumbai",
  state: "Maharashtra",
  address: "123 Main St",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  theater: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("TheatersService", () => {
  let service: TheatersService;

  beforeEach(() => {
    service = new TheatersService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create and return a theater", async () => {
      mockPrisma.theater.create.mockResolvedValue(mockTheater);

      const result = await service.create({
        name: "PVR Cinemas",
        city: "Mumbai",
        state: "Maharashtra",
        address: "123 Main St",
      });

      expect(result).toEqual(mockTheater);
      expect(mockPrisma.theater.create).toHaveBeenCalledWith({
        data: {
          name: "PVR Cinemas",
          city: "Mumbai",
          state: "Maharashtra",
          address: "123 Main St",
        },
      });
    });

    it("should propagate error if prisma create fails", async () => {
      mockPrisma.theater.create.mockRejectedValue(new Error("DB error"));

      await expect(
        service.create({
          name: "PVR",
          city: "Mumbai",
          state: "Maharashtra",
          address: "123 Main St",
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return all theaters when no filter", async () => {
      mockPrisma.theater.findMany.mockResolvedValue([mockTheater]);

      const result = await service.findAll();

      expect(result).toEqual([mockTheater]);
      expect(mockPrisma.theater.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it("should filter by city", async () => {
      mockPrisma.theater.findMany.mockResolvedValue([mockTheater]);

      await service.findAll("Mumbai");

      expect(mockPrisma.theater.findMany).toHaveBeenCalledWith({
        where: {
          city: { contains: "Mumbai", mode: "insensitive" },
        },
      });
    });

    it("should return empty array when no theaters match", async () => {
      mockPrisma.theater.findMany.mockResolvedValue([]);

      const result = await service.findAll("NonexistentCity");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a theater when found", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(mockTheater);

      const result = await service.findOne(1);

      expect(result).toEqual(mockTheater);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should include theater id in error message", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Theater with id 42 not found",
      );
    });
  });

  describe("update", () => {
    it("should update and return the theater", async () => {
      const updated = { ...mockTheater, name: "INOX" };
      mockPrisma.theater.findUnique.mockResolvedValue(mockTheater);
      mockPrisma.theater.update.mockResolvedValue(updated);

      const result = await service.update(1, { name: "INOX" });

      expect(result.name).toBe("INOX");
    });

    it("should throw NotFoundException if theater does not exist", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should not call prisma update if theater not found", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { name: "X" })).rejects.toThrow();

      expect(mockPrisma.theater.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete and return the theater", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(mockTheater);
      mockPrisma.theater.delete.mockResolvedValue(mockTheater);

      const result = await service.remove(1);

      expect(result).toEqual(mockTheater);
      expect(mockPrisma.theater.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException if theater does not exist", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not call prisma delete if theater not found", async () => {
      mockPrisma.theater.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();

      expect(mockPrisma.theater.delete).not.toHaveBeenCalled();
    });
  });
});
