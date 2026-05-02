import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { TheatersController } from "./theaters.controller";

const mockTheater = {
  id: 1,
  name: "PVR Cinemas",
  city: "Mumbai",
  state: "Maharashtra",
  address: "123 Main St",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTheatersService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

describe("TheatersController", () => {
  let controller: TheatersController;

  beforeEach(() => {
    controller = new TheatersController(mockTheatersService as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a theater", async () => {
      mockTheatersService.create.mockResolvedValue(mockTheater);

      const dto = {
        name: "PVR Cinemas",
        city: "Mumbai",
        state: "Maharashtra",
        address: "123 Main St",
      };
      const result = await controller.create(dto);

      expect(result).toEqual(mockTheater);
      expect(mockTheatersService.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate service errors", async () => {
      mockTheatersService.create.mockRejectedValue(new Error("DB error"));

      await expect(
        controller.create({
          name: "X",
          city: "Y",
          state: "Z",
          address: "A",
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return all theaters without filter", async () => {
      mockTheatersService.findAll.mockResolvedValue([mockTheater]);

      const result = await controller.findAll();

      expect(result).toEqual([mockTheater]);
      expect(mockTheatersService.findAll).toHaveBeenCalledWith(undefined);
    });

    it("should pass city filter", async () => {
      mockTheatersService.findAll.mockResolvedValue([mockTheater]);

      await controller.findAll("Mumbai");

      expect(mockTheatersService.findAll).toHaveBeenCalledWith("Mumbai");
    });

    it("should return empty array when no theaters match", async () => {
      mockTheatersService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("Nowhere");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a theater by id", async () => {
      mockTheatersService.findOne.mockResolvedValue(mockTheater);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockTheater);
    });

    it("should propagate NotFoundException", async () => {
      mockTheatersService.findOne.mockRejectedValue(
        new NotFoundException("Theater with id 999 not found"),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a theater", async () => {
      const updated = { ...mockTheater, name: "INOX" };
      mockTheatersService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { name: "INOX" });

      expect(result.name).toBe("INOX");
    });

    it("should propagate NotFoundException on update", async () => {
      mockTheatersService.update.mockRejectedValue(
        new NotFoundException("Theater with id 999 not found"),
      );

      await expect(controller.update(999, { name: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a theater", async () => {
      mockTheatersService.remove.mockResolvedValue(mockTheater);

      const result = await controller.remove(1);

      expect(result).toEqual(mockTheater);
    });

    it("should propagate NotFoundException on remove", async () => {
      mockTheatersService.remove.mockRejectedValue(
        new NotFoundException("Theater with id 999 not found"),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
