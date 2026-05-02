import { describe, it, expect, vi, beforeEach } from "vitest";
import { MoviesController } from "./movies.controller";

const mockMoviesService = {
  create: vi.fn(),
  findAll: vi.fn(),
  findOne: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
};

const mockMovie = {
  id: 1,
  title: "Inception",
  description: "A mind-bending thriller",
  posterUrl: null,
  releaseDate: null,
  genre: "THRILLER",
  runTime: 148,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe("MoviesController", () => {
  let controller: MoviesController;

  beforeEach(() => {
    controller = new MoviesController(mockMoviesService as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a movie", async () => {
      mockMoviesService.create.mockResolvedValue(mockMovie);

      const dto = {
        title: "Inception",
        description: "A mind-bending thriller",
        genre: "THRILLER" as any,
        runTime: 148,
      };
      const result = await controller.create(dto);

      expect(result).toEqual(mockMovie);
      expect(mockMoviesService.create).toHaveBeenCalledWith(dto);
    });

    it("should propagate service errors", async () => {
      mockMoviesService.create.mockRejectedValue(new Error("DB error"));

      await expect(
        controller.create({
          title: "X",
          description: "Y",
          genre: "ACTION" as any,
          runTime: 90,
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return all movies without filters", async () => {
      mockMoviesService.findAll.mockResolvedValue([mockMovie]);

      const result = await controller.findAll();

      expect(result).toEqual([mockMovie]);
      expect(mockMoviesService.findAll).toHaveBeenCalledWith(
        undefined,
        undefined,
      );
    });

    it("should pass title and genre filters", async () => {
      mockMoviesService.findAll.mockResolvedValue([mockMovie]);

      await controller.findAll("inception", "THRILLER" as any);

      expect(mockMoviesService.findAll).toHaveBeenCalledWith(
        "inception",
        "THRILLER",
      );
    });

    it("should return empty array when no movies match", async () => {
      mockMoviesService.findAll.mockResolvedValue([]);

      const result = await controller.findAll("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a movie by id", async () => {
      mockMoviesService.findOne.mockResolvedValue(mockMovie);

      const result = await controller.findOne(1);

      expect(result).toEqual(mockMovie);
      expect(mockMoviesService.findOne).toHaveBeenCalledWith(1);
    });

    it("should propagate NotFoundException", async () => {
      const { NotFoundException } = await import("@nestjs/common");
      mockMoviesService.findOne.mockRejectedValue(
        new NotFoundException("Movie with id 999 not found"),
      );

      await expect(controller.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe("update", () => {
    it("should update a movie", async () => {
      const updated = { ...mockMovie, title: "Updated" };
      mockMoviesService.update.mockResolvedValue(updated);

      const result = await controller.update(1, { title: "Updated" });

      expect(result.title).toBe("Updated");
      expect(mockMoviesService.update).toHaveBeenCalledWith(1, {
        title: "Updated",
      });
    });

    it("should propagate NotFoundException on update", async () => {
      const { NotFoundException } = await import("@nestjs/common");
      mockMoviesService.update.mockRejectedValue(
        new NotFoundException("Movie with id 999 not found"),
      );

      await expect(controller.update(999, { title: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe("remove", () => {
    it("should delete a movie", async () => {
      mockMoviesService.remove.mockResolvedValue(mockMovie);

      const result = await controller.remove(1);

      expect(result).toEqual(mockMovie);
      expect(mockMoviesService.remove).toHaveBeenCalledWith(1);
    });

    it("should propagate NotFoundException on remove", async () => {
      const { NotFoundException } = await import("@nestjs/common");
      mockMoviesService.remove.mockRejectedValue(
        new NotFoundException("Movie with id 999 not found"),
      );

      await expect(controller.remove(999)).rejects.toThrow(NotFoundException);
    });
  });
});
