import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, BadRequestException } from "@nestjs/common";
import { ScreensService } from "./screens.service";

const mockScreen = {
  id: 1,
  screenNumber: 1,
  rows: 3,
  seatsPerRow: 10,
  theaterId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTx = {
  screen: {
    create: vi.fn(),
  },
  seat: {
    createMany: vi.fn(),
  },
};

const mockPrisma = {
  $transaction: vi.fn((cb: any) => cb(mockTx)),
  screen: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("ScreensService", () => {
  let service: ScreensService;

  beforeEach(() => {
    service = new ScreensService(mockPrisma as any);
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
  });

  describe("create", () => {
    it("should create a screen with seats", async () => {
      mockTx.screen.create.mockResolvedValue(mockScreen);
      mockTx.seat.createMany.mockResolvedValue({ count: 30 });

      const result = await service.create({
        screenNumber: 1,
        rows: 3,
        seatsPerRow: 10,
        theaterId: 1,
        seatLayout: [
          { category: "SILVER" as any, rows: 1 },
          { category: "GOLD" as any, rows: 1 },
          { category: "RECLINER" as any, rows: 1 },
        ],
      });

      expect(result).toEqual(mockScreen);
      expect(mockTx.screen.create).toHaveBeenCalled();
      expect(mockTx.seat.createMany).toHaveBeenCalled();
    });

    it("should throw BadRequestException if seat layout rows don't match total rows", async () => {
      await expect(
        service.create({
          screenNumber: 1,
          rows: 5,
          seatsPerRow: 10,
          theaterId: 1,
          seatLayout: [
            { category: "SILVER" as any, rows: 1 },
            { category: "GOLD" as any, rows: 1 },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it("should throw BadRequestException with descriptive message", async () => {
      await expect(
        service.create({
          screenNumber: 1,
          rows: 5,
          seatsPerRow: 10,
          theaterId: 1,
          seatLayout: [{ category: "SILVER" as any, rows: 2 }],
        }),
      ).rejects.toThrow("Seat layout rows (2) must equal total rows (5)");
    });

    it("should generate correct seat labels (A, B, C...)", async () => {
      mockTx.screen.create.mockResolvedValue(mockScreen);
      mockTx.seat.createMany.mockResolvedValue({ count: 6 });

      await service.create({
        screenNumber: 1,
        rows: 2,
        seatsPerRow: 3,
        theaterId: 1,
        seatLayout: [
          { category: "SILVER" as any, rows: 1 },
          { category: "GOLD" as any, rows: 1 },
        ],
      });

      const seats = mockTx.seat.createMany.mock.calls[0][0].data;
      expect(seats[0].row).toBe("A");
      expect(seats[0].category).toBe("SILVER");
      expect(seats[3].row).toBe("B");
      expect(seats[3].category).toBe("GOLD");
    });
  });

  describe("findAll", () => {
    it("should return all screens when no filter", async () => {
      mockPrisma.screen.findMany.mockResolvedValue([mockScreen]);

      const result = await service.findAll();

      expect(result).toEqual([mockScreen]);
      expect(mockPrisma.screen.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it("should filter by theaterId", async () => {
      mockPrisma.screen.findMany.mockResolvedValue([mockScreen]);

      await service.findAll(1);

      expect(mockPrisma.screen.findMany).toHaveBeenCalledWith({
        where: { theaterId: 1 },
      });
    });

    it("should return empty array when no screens match", async () => {
      mockPrisma.screen.findMany.mockResolvedValue([]);

      const result = await service.findAll(999);

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a screen when found", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);

      const result = await service.findOne(1);

      expect(result).toEqual(mockScreen);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should include screen id in error message", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Screen with id 42 not found",
      );
    });
  });

  describe("update", () => {
    it("should update and return the screen", async () => {
      const updated = { ...mockScreen, screenNumber: 2 };
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.screen.update.mockResolvedValue(updated);

      const result = await service.update(1, { screenNumber: 2 });

      expect(result.screenNumber).toBe(2);
    });

    it("should throw NotFoundException if screen does not exist", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { screenNumber: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should not call prisma update if screen not found", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { screenNumber: 2 })).rejects.toThrow();

      expect(mockPrisma.screen.update).not.toHaveBeenCalled();
    });
  });

  describe("remove", () => {
    it("should delete and return the screen", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.screen.delete.mockResolvedValue(mockScreen);

      const result = await service.remove(1);

      expect(result).toEqual(mockScreen);
      expect(mockPrisma.screen.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException if screen does not exist", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not call prisma delete if screen not found", async () => {
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();

      expect(mockPrisma.screen.delete).not.toHaveBeenCalled();
    });
  });
});
