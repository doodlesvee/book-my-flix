import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatsService } from "./seats.service";

const mockSeats = [
  { id: 1, row: "A", seatNumber: 1, category: "SILVER", screenId: 1 },
  { id: 2, row: "A", seatNumber: 2, category: "SILVER", screenId: 1 },
  { id: 3, row: "B", seatNumber: 1, category: "GOLD", screenId: 1 },
];

const mockPrisma = {
  seat: {
    findMany: vi.fn(),
  },
};

describe("SeatsService", () => {
  let service: SeatsService;

  beforeEach(() => {
    service = new SeatsService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe("findByScreen", () => {
    it("should return seats for a given screen", async () => {
      mockPrisma.seat.findMany.mockResolvedValue(mockSeats);

      const result = await service.findByScreen(1);

      expect(result).toEqual(mockSeats);
      expect(mockPrisma.seat.findMany).toHaveBeenCalledWith({
        where: { screenId: 1 },
        orderBy: [{ row: "asc" }, { seatNumber: "asc" }],
      });
    });

    it("should return empty array when no seats for screen", async () => {
      mockPrisma.seat.findMany.mockResolvedValue([]);

      const result = await service.findByScreen(999);

      expect(result).toEqual([]);
    });

    it("should propagate database errors", async () => {
      mockPrisma.seat.findMany.mockRejectedValue(new Error("DB error"));

      await expect(service.findByScreen(1)).rejects.toThrow("DB error");
    });
  });
});
