import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { ShowsService } from "./shows.service";

const mockMovie = {
  id: 1,
  title: "Inception",
  runTime: 148,
};

const mockScreen = {
  id: 1,
  screenNumber: 1,
  theaterId: 1,
};

const mockShow = {
  id: 1,
  movieId: 1,
  screenId: 1,
  showTime: new Date("2026-06-01T10:00:00Z"),
  slot: "MORNING",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  movie: {
    findUnique: vi.fn(),
  },
  screen: {
    findUnique: vi.fn(),
  },
  shows: {
    create: vi.fn(),
    findMany: vi.fn(),
    findUnique: vi.fn(),
    delete: vi.fn(),
  },
};

describe("ShowsService", () => {
  let service: ShowsService;

  beforeEach(() => {
    service = new ShowsService(mockPrisma as any);
    vi.clearAllMocks();
  });

  describe("create", () => {
    it("should create a show when no conflicts", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.shows.findMany.mockResolvedValue([]);
      mockPrisma.shows.create.mockResolvedValue(mockShow);

      const result = await service.create({
        movieId: 1,
        screenId: 1,
        showTime: "2026-06-01T10:00:00Z",
      });

      expect(result).toEqual(mockShow);
      expect(mockPrisma.shows.create).toHaveBeenCalled();
    });

    it("should assign MORNING slot for shows before 12pm", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.shows.findMany.mockResolvedValue([]);
      mockPrisma.shows.create.mockResolvedValue(mockShow);

      await service.create({
        movieId: 1,
        screenId: 1,
        showTime: "2026-06-01T04:00:00Z",
      });

      expect(mockPrisma.shows.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slot: "MORNING" }),
        }),
      );
    });

    it("should assign EVENING slot for shows at/after 12pm", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.shows.findMany.mockResolvedValue([]);
      mockPrisma.shows.create.mockResolvedValue({
        ...mockShow,
        slot: "EVENING",
      });

      await service.create({
        movieId: 1,
        screenId: 1,
        showTime: "2026-06-01T14:00:00Z",
      });

      expect(mockPrisma.shows.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ slot: "EVENING" }),
        }),
      );
    });

    it("should throw NotFoundException if movie not found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          movieId: 999,
          screenId: 1,
          showTime: "2026-06-01T10:00:00Z",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw NotFoundException if screen not found", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.screen.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          movieId: 1,
          screenId: 999,
          showTime: "2026-06-01T10:00:00Z",
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if show overlaps with existing", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue(mockMovie);
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.shows.findMany.mockResolvedValue([
        {
          id: 2,
          screenId: 1,
          showTime: new Date("2026-06-01T10:00:00Z"),
          movie: { runTime: 148 },
        },
      ]);

      await expect(
        service.create({
          movieId: 1,
          screenId: 1,
          showTime: "2026-06-01T11:00:00Z",
        }),
      ).rejects.toThrow(ConflictException);
    });

    it("should allow non-overlapping shows on same screen", async () => {
      mockPrisma.movie.findUnique.mockResolvedValue({
        ...mockMovie,
        runTime: 60,
      });
      mockPrisma.screen.findUnique.mockResolvedValue(mockScreen);
      mockPrisma.shows.findMany.mockResolvedValue([
        {
          id: 2,
          screenId: 1,
          showTime: new Date("2026-06-01T08:00:00Z"),
          movie: { runTime: 60 },
        },
      ]);
      mockPrisma.shows.create.mockResolvedValue(mockShow);

      // Show at 10:00, existing ends at 08:00 + 60min + 15min buffer = 09:15
      const result = await service.create({
        movieId: 1,
        screenId: 1,
        showTime: "2026-06-01T10:00:00Z",
      });

      expect(result).toEqual(mockShow);
    });
  });

  describe("findAll", () => {
    it("should return all shows when no filters", async () => {
      mockPrisma.shows.findMany.mockResolvedValue([mockShow]);

      const result = await service.findAll();

      expect(result).toEqual([mockShow]);
    });

    it("should filter by screenId", async () => {
      mockPrisma.shows.findMany.mockResolvedValue([mockShow]);

      await service.findAll(1);

      expect(mockPrisma.shows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ screenId: 1 }),
        }),
      );
    });

    it("should filter by movieId", async () => {
      mockPrisma.shows.findMany.mockResolvedValue([mockShow]);

      await service.findAll(undefined, 1);

      expect(mockPrisma.shows.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ movieId: 1 }),
        }),
      );
    });

    it("should return empty array when no shows match", async () => {
      mockPrisma.shows.findMany.mockResolvedValue([]);

      const result = await service.findAll(999);

      expect(result).toEqual([]);
    });
  });

  describe("findOne", () => {
    it("should return a show when found", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);

      const result = await service.findOne(1);

      expect(result).toEqual(mockShow);
    });

    it("should throw NotFoundException when not found", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });

    it("should include show id in error message", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(service.findOne(42)).rejects.toThrow(
        "Show with id 42 not found",
      );
    });
  });

  describe("remove", () => {
    it("should delete and return the show", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockPrisma.shows.delete.mockResolvedValue(mockShow);

      const result = await service.remove(1);

      expect(result).toEqual(mockShow);
    });

    it("should throw NotFoundException if show does not exist", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it("should not call prisma delete if show not found", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(service.remove(999)).rejects.toThrow();

      expect(mockPrisma.shows.delete).not.toHaveBeenCalled();
    });
  });
});
