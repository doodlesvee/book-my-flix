import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { ShowsController } from "./shows.controller";

const mockShow = {
  id: 1,
  movieId: 1,
  screenId: 1,
  showTime: new Date("2026-06-01T10:00:00Z"),
  slot: "MORNING",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockShowsService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  remove: vi.fn(),
};

describe("ShowsController", () => {
  let controller: ShowsController;

  beforeEach(() => {
    controller = new ShowsController(mockShowsService as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a show", async () => {
      mockShowsService.create.mockResolvedValue(mockShow);

      const dto = { movieId: 1, screenId: 1, showTime: "2026-06-01T10:00:00Z" };
      const result = await controller.create(dto);

      expect(result).toEqual(mockShow);
      expect(mockShowsService.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate service errors", async () => {
      mockShowsService.create.mockRejectedValue(new Error("Conflict"));

      await expect(
        controller.create({
          movieId: 1,
          screenId: 1,
          showTime: "2026-06-01T10:00:00Z",
        }),
      ).rejects.toThrow("Conflict");
    });
  });

  describe("findAll", () => {
    it("should return all shows without filters", async () => {
      mockShowsService.findAll.mockResolvedValue([mockShow]);

      const result = await controller.findAll();

      expect(result).toEqual([mockShow]);
      expect(mockShowsService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it("should parse screenId and movieId strings to numbers", async () => {
      mockShowsService.findAll.mockResolvedValue([mockShow]);

      await controller.findAll("1", "2");

      expect(mockShowsService.findAll).toHaveBeenCalledWith(1, 2);
    });

    it("should return empty array when no shows match", async () => {
      mockShowsService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("999");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a show by id", async () => {
      mockShowsService.findOne.mockResolvedValue(mockShow);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockShow);
    });

    it("should propagate NotFoundException", async () => {
      mockShowsService.findOne.mockRejectedValue(
        new NotFoundException("Show with id 999 not found"),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("remove", () => {
    it("should delete a show", async () => {
      mockShowsService.remove.mockResolvedValue(mockShow);

      const result = await controller.remove(1);

      expect(result).toEqual(mockShow);
    });

    it("should propagate NotFoundException on remove", async () => {
      mockShowsService.remove.mockRejectedValue(
        new NotFoundException("Show with id 999 not found"),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
