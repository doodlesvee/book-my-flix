import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException } from "@nestjs/common";
import { MoviesService } from "./movies.service";

// A fake movie object to reuse across tests
const mockMovie = {
  id: 1,
  title: "Inception",
  description: "A mind-bending thriller",
  posterUrl: null,
  releaseDate: null,
  genre: "THRILLER",
  createdAt: new Date(),
  updatedAt: new Date(),
};

// Mock PrismaService — fake versions of every Prisma method the service uses
const mockPrisma = {
  movie: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
};

describe("MoviesService", () => {
  let service: MoviesService;

  beforeEach(() => {
    // Create a fresh service before each test
    // We cast mockPrisma as "any" because it's not a real PrismaService
    service = new MoviesService(mockPrisma as any);

    // Reset all mock call history between tests
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create and return a movie", async () => {
      // Arrange — tell the mock what to return
      mockPrisma.movie.create.mockResolvedValue(mockMovie);

      // Act — call the method
      const result = await service.create({
        title: "Inception",
        description: "A mind-bending thriller",
        genre: "THRILLER" as any,
        runTime: 105,
      });

      // Assert — check the result
      expect(result).toEqual(mockMovie);
      expect(mockPrisma.movie.create).toHaveBeenCalledWith({
        data: {
          title: "Inception",
          description: "A mind-bending thriller",
          posterUrl: undefined,
          releaseDate: null,
          genre: "THRILLER",
          runTime: 105,
        },
      });
    });

    it("should convert releaseDate string to Date object", async () => {
      mockPrisma.movie.create.mockResolvedValue(mockMovie);

      await service.create({
        title: "Inception",
        description: "A mind-bending thriller",
        genre: "THRILLER" as any,
        releaseDate: "2010-07-16",
        runTime: 60,
      });

      expect(mockPrisma.movie.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          releaseDate: new Date("2010-07-16"),
        }),
      });
    });

    it("should propagate error if prisma create fails", async () => {
      mockPrisma.movie.create.mockRejectedValue(new Error("DB error"));

      await expect(
        service.create({
          title: "Inception",
          description: "A mind-bending thriller",
          genre: "THRILLER" as any,
          runTime: 120,
        }),
      ).rejects.toThrow("DB error");
    });
  });

  describe("findAll", () => {
    it("should return all movies when no filters", async () => {
      mockPrisma.movie.findMany.mockResolvedValue([mockMovie]);

      const result = await service.findAll();

      expect(result).toEqual([mockMovie]);
      expect(mockPrisma.movie.findMany).toHaveBeenCalledWith({ where: {} });
    });

    it("should filter by title", async () => {
      mockPrisma.movie.findMany.mockResolvedValue([mockMovie]);

      await service.findAll("inception");

      expect(mockPrisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: "inception", mode: "insensitive" },
        },
      });
    });

    it("should filter by genre", async () => {
      mockPrisma.movie.findMany.mockResolvedValue([mockMovie]);

      await service.findAll(undefined, "THRILLER" as any);

      expect(mockPrisma.movie.findMany).toHaveBeenCalledWith({
        where: { genre: "THRILLER" },
      });
    });

    it("should filter by both title and genre", async () => {
      mockPrisma.movie.findMany.mockResolvedValue([mockMovie]);

      await service.findAll("inception", "THRILLER" as any);

      expect(mockPrisma.movie.findMany).toHaveBeenCalledWith({
        where: {
          title: { contains: "inception", mode: "insensitive" },
          genre: "THRILLER",
        },
      });
    });

    it("should return empty array when no movies match", async () => {
      mockPrisma.movie.findMany.mockResolvedValue([]);

      const result = await service.findAll("nonexistent");

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a movie when found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);

      const result = await service.findOne(1);

      expect(result).toEqual(mockMovie);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should include movie id in error message", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Movie with id 42 not found",
      );
    });
  });

  describe("update", () => {
    it("should update and return the movie", async () => {
      const updatedMovie = { ...mockMovie, title: "Inception (Updated)" };
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.movie.update.mockResolvedValue(updatedMovie);

      const result = await service.update(1, { title: "Inception (Updated)" });

      expect(result.title).toBe("Inception (Updated)");
    });

    it("should throw NotFoundException if movie does not exist", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: "X" })).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should not call prisma update if movie not found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.update(999, { title: "X" })).rejects.toThrow();

      expect(mockPrisma.movie.update).not.toHaveBeenCalled();
    });

    it("should convert releaseDate string to Date on update", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.movie.update.mockResolvedValue(mockMovie);

      await service.update(1, { releaseDate: "2010-07-16" });

      expect(mockPrisma.movie.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          releaseDate: new Date("2010-07-16"),
        }),
      });
    });
  });

  describe("remove", () => {
    it("should delete and return the movie", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.movie.delete.mockResolvedValue(mockMovie);

      const result = await service.remove(1);

      expect(result).toEqual(mockMovie);
      expect(mockPrisma.movie.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it("should throw NotFoundException if movie does not exist", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not call prisma delete if movie not found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();

      expect(mockPrisma.movie.delete).not.toHaveBeenCalled();
    });
  });
});
