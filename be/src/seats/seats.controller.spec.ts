import { describe, it, expect, vi, beforeEach } from "vitest";
import { SeatsController } from "./seats.controller";

const mockSeats = [
  { id: 1, row: "A", seatNumber: 1, category: "SILVER", screenId: 1 },
  { id: 2, row: "A", seatNumber: 2, category: "SILVER", screenId: 1 },
];

const mockSeatsService = {
  findByScreen: vi.fn(),
};

describe("SeatsController", () => {
  let controller: SeatsController;

  beforeEach(() => {
    controller = new SeatsController(mockSeatsService as any);
    vi.clearAllMocks();
  });

  describe("findByScreen", () => {
    it("should return seats for a screen", async () => {
      mockSeatsService.findByScreen.mockResolvedValue(mockSeats);

      const result = await controller.findByScreen(1);

      expect(result).toEqual(mockSeats);
      expect(mockSeatsService.findByScreen).toHaveBeenCalledWith(1);
    });

    it("should return empty array when no seats", async () => {
      mockSeatsService.findByScreen.mockResolvedValue([]);

      const result = await controller.findByScreen(999);

      expect(result).toEqual([]);
    });

    it("should propagate service errors", async () => {
      mockSeatsService.findByScreen.mockRejectedValue(new Error("DB error"));

      await expect(controller.findByScreen(1)).rejects.toThrow("DB error");
    });
  });
});
