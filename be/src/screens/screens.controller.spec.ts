import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ScreensController } from "./screens.controller";

const mockScreen = {
  id: 1,
  screenNumber: 1,
  rows: 3,
  seatsPerRow: 10,
  theaterId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockScreensService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe("ScreensController", () => {
  let controller: ScreensController;

  beforeEach(() => {
    controller = new ScreensController(mockScreensService as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a screen", async () => {
      mockScreensService.create.mockResolvedValue(mockScreen);

      const dto = {
        screenNumber: 1,
        rows: 3,
        seatsPerRow: 10,
        theaterId: 1,
        seatLayout: [{ category: "SILVER" as any, rows: 3 }],
      };
      const result = await controller.create(dto);

      expect(result).toEqual(mockScreen);
      expect(mockScreensService.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate service errors", async () => {
      mockScreensService.create.mockRejectedValue(
        new Error("Seat layout mismatch"),
      );

      await expect(
        controller.create({
          screenNumber: 1,
          rows: 5,
          seatsPerRow: 10,
          theaterId: 1,
          seatLayout: [{ category: "SILVER" as any, rows: 1 }],
        }),
      ).rejects.toThrow("Seat layout mismatch");
    });
  });

  describe("findAll", () => {
    it("should return all screens without filter", async () => {
      mockScreensService.findAll.mockResolvedValue([mockScreen]);

      const result = await controller.findAll();

      expect(result).toEqual([mockScreen]);
      expect(mockScreensService.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should parse theaterId string to number", async () => {
      mockScreensService.findAll.mockResolvedValue([mockScreen]);

      await controller.findAll("1");

      expect(mockScreensService.findAll).toHaveBeenCalledWith(1);
    });

    it("should return empty array when no screens match", async () => {
      mockScreensService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("999");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a screen by id", async () => {
      mockScreensService.findOne.mockResolvedValue(mockScreen);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockScreen);
    });

    it("should propagate NotFoundException", async () => {
      mockScreensService.findOne.mockRejectedValue(
        new NotFoundException("Screen with id 999 not found"),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a screen", async () => {
      const updated = { ...mockScreen, screenNumber: 2 };
      mockScreensService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { screenNumber: 2 });

      expect(result.screenNumber).toBe(2);
    });

    it("should propagate NotFoundException on update", async () => {
      mockScreensService.update.mockRejectedValue(
        new NotFoundException("Screen with id 999 not found"),
      );

      await expect(controller.update(999, { screenNumber: 2 })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a screen", async () => {
      mockScreensService.remove.mockResolvedValue(mockScreen);

      const result = await controller.remove(1);

      expect(result).toEqual(mockScreen);
    });

    it("should propagate NotFoundException on remove", async () => {
      mockScreensService.remove.mockRejectedValue(
        new NotFoundException("Screen with id 999 not found"),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
