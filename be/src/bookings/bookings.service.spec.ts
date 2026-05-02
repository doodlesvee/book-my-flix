import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { BookingsService } from "./bookings.service";

const mockShow = {
  id: 1,
  movieId: 1,
  screenId: 1,
  showTime: new Date("2026-06-02T14:00:00Z"), // Monday 2pm = EVENING + WEEKDAY
  screen: { theaterId: 1 },
};

const mockSeats = [
  { id: 1, row: "A", seatNumber: 1, category: "SILVER", screenId: 1 },
  { id: 2, row: "A", seatNumber: 2, category: "SILVER", screenId: 1 },
];

const mockPricing = [
  {
    id: 1,
    theaterId: 1,
    category: "SILVER",
    slot: "EVENING",
    dayType: "WEEKDAY",
    price: 200,
  },
];

const mockBooking = {
  id: 1,
  userId: 1,
  showId: 1,
  totalPrice: 400,
  status: "CONFIRMED",
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockTx = {
  booking: {
    create: vi.fn(),
  },
  bookedSeat: {
    createMany: vi.fn(),
  },
};

const mockPrisma = {
  shows: {
    findUnique: vi.fn(),
  },
  bookedSeat: {
    findMany: vi.fn(),
  },
  seat: {
    findMany: vi.fn(),
  },
  pricing: {
    findMany: vi.fn(),
  },
  booking: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    update: vi.fn(),
  },
  $transaction: vi.fn((cb: any) => cb(mockTx)),
};

const mockRedis = {
  lockSeats: vi.fn(),
  unlockSeats: vi.fn(),
  getSeatLock: vi.fn(),
  unlockSeat: vi.fn(),
};

describe("BookingsService", () => {
  let service: BookingsService;

  beforeEach(() => {
    service = new BookingsService(mockPrisma as any, mockRedis as any);
    vi.clearAllMocks();
    mockPrisma.$transaction.mockImplementation((cb: any) => cb(mockTx));
  });

  describe("lockSeats", () => {
    it("should lock seats successfully", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockPrisma.bookedSeat.findMany.mockResolvedValue([]);
      mockRedis.lockSeats.mockResolvedValue(true);

      const result = await service.lockSeats(1, { showId: 1, seatIds: [1, 2] });

      expect(result.message).toBe("Seats locked for 10 minutes");
      expect(result.seatIds).toEqual([1, 2]);
    });

    it("should throw NotFoundException if show not found", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(
        service.lockSeats(1, { showId: 999, seatIds: [1] }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if seats already booked in DB", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockPrisma.bookedSeat.findMany.mockResolvedValue([
        { seatId: 1, showId: 1 },
      ]);

      await expect(
        service.lockSeats(1, { showId: 1, seatIds: [1, 2] }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if Redis lock fails", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockPrisma.bookedSeat.findMany.mockResolvedValue([]);
      mockRedis.lockSeats.mockResolvedValue(false);

      await expect(
        service.lockSeats(1, { showId: 1, seatIds: [1, 2] }),
      ).rejects.toThrow(ConflictException);
    });

    it("should include booked seat ids in error message", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockPrisma.bookedSeat.findMany.mockResolvedValue([
        { seatId: 1, showId: 1 },
        { seatId: 2, showId: 1 },
      ]);

      await expect(
        service.lockSeats(1, { showId: 1, seatIds: [1, 2] }),
      ).rejects.toThrow("Seats 1, 2 are already booked");
    });
  });

  describe("confirmBooking", () => {
    it("should confirm booking and calculate total price", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockRedis.getSeatLock.mockResolvedValue("1");
      mockPrisma.seat.findMany.mockResolvedValue(mockSeats);
      mockPrisma.pricing.findMany.mockResolvedValue(mockPricing);
      mockTx.booking.create.mockResolvedValue(mockBooking);
      mockTx.bookedSeat.createMany.mockResolvedValue({ count: 2 });
      mockRedis.unlockSeats.mockResolvedValue(undefined);

      const result = await service.confirmBooking(1, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result).toEqual(mockBooking);
      expect(mockRedis.unlockSeats).toHaveBeenCalledWith([1, 2], 1);
    });

    it("should derive MORNING slot and WEEKEND dayType correctly", async () => {
      // Sunday June 7 2026 at 04:00 UTC = morning in IST, and it's a Sunday (day=0 = WEEKEND)
      const weekendMorningShow = {
        ...mockShow,
        showTime: new Date("2026-06-07T04:00:00Z"),
      };
      const weekendPricing = [
        {
          id: 2,
          theaterId: 1,
          category: "SILVER",
          slot: "MORNING",
          dayType: "WEEKEND",
          price: 150,
        },
      ];

      mockPrisma.shows.findUnique.mockResolvedValue(weekendMorningShow);
      mockRedis.getSeatLock.mockResolvedValue("1");
      mockPrisma.seat.findMany.mockResolvedValue(mockSeats);
      mockPrisma.pricing.findMany.mockResolvedValue(weekendPricing);
      mockTx.booking.create.mockResolvedValue({
        ...mockBooking,
        totalPrice: 300,
      });
      mockTx.bookedSeat.createMany.mockResolvedValue({ count: 2 });
      mockRedis.unlockSeats.mockResolvedValue(undefined);

      const result = await service.confirmBooking(1, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result.totalPrice).toBe(300);
      expect(mockPrisma.pricing.findMany).toHaveBeenCalledWith({
        where: {
          theaterId: 1,
          slot: "MORNING",
          dayType: "WEEKEND",
        },
      });
    });

    it("should throw NotFoundException if show not found", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(null);

      await expect(
        service.confirmBooking(1, { showId: 999, seatIds: [1] }),
      ).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if seat not locked by user", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockRedis.getSeatLock.mockResolvedValue("999"); // locked by another user

      await expect(
        service.confirmBooking(1, { showId: 1, seatIds: [1] }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if lock expired", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockRedis.getSeatLock.mockResolvedValue(null);

      await expect(
        service.confirmBooking(1, { showId: 1, seatIds: [1] }),
      ).rejects.toThrow(ConflictException);
    });

    it("should throw NotFoundException if pricing not found for category", async () => {
      mockPrisma.shows.findUnique.mockResolvedValue(mockShow);
      mockRedis.getSeatLock.mockResolvedValue("1");
      mockPrisma.seat.findMany.mockResolvedValue([
        { id: 1, row: "A", seatNumber: 1, category: "RECLINER", screenId: 1 },
      ]);
      mockPrisma.pricing.findMany.mockResolvedValue([]); // no pricing

      await expect(
        service.confirmBooking(1, { showId: 1, seatIds: [1] }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe("releaseLock", () => {
    it("should release locks for user's seats", async () => {
      mockRedis.getSeatLock.mockResolvedValue("1");
      mockRedis.unlockSeat.mockResolvedValue(undefined);

      const result = await service.releaseLock(1, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result.message).toBe("Seats released");
      expect(mockRedis.unlockSeat).toHaveBeenCalledTimes(2);
    });

    it("should not release locks held by other users", async () => {
      mockRedis.getSeatLock.mockResolvedValue("999");

      await service.releaseLock(1, { showId: 1, seatIds: [1] });

      expect(mockRedis.unlockSeat).not.toHaveBeenCalled();
    });

    it("should handle already-released locks gracefully", async () => {
      mockRedis.getSeatLock.mockResolvedValue(null);

      const result = await service.releaseLock(1, {
        showId: 1,
        seatIds: [1],
      });

      expect(result.message).toBe("Seats released");
      expect(mockRedis.unlockSeat).not.toHaveBeenCalled();
    });
  });

  describe("cancel", () => {
    it("should cancel a confirmed booking", async () => {
      const booking = {
        ...mockBooking,
        bookedSeats: [{ seatId: 1 }],
      };
      mockPrisma.booking.findUnique.mockResolvedValue(booking);
      mockPrisma.booking.update.mockResolvedValue({
        ...booking,
        status: "CANCELLED",
      });

      const result = await service.cancel(1, 1);

      expect(result.status).toBe("CANCELLED");
    });

    it("should throw NotFoundException if booking not found", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue(null);

      await expect(service.cancel(1, 999)).rejects.toThrow(NotFoundException);
    });

    it("should throw ConflictException if not user's booking", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        userId: 999,
        bookedSeats: [],
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(ConflictException);
    });

    it("should throw ConflictException if already cancelled", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        status: "CANCELLED",
        bookedSeats: [],
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(ConflictException);
    });

    it("should include descriptive error for wrong user", async () => {
      mockPrisma.booking.findUnique.mockResolvedValue({
        ...mockBooking,
        userId: 999,
        bookedSeats: [],
      });

      await expect(service.cancel(1, 1)).rejects.toThrow(
        "You can only cancel your own bookings",
      );
    });
  });

  describe("findByUser", () => {
    it("should return user's bookings", async () => {
      mockPrisma.booking.findMany.mockResolvedValue([mockBooking]);

      const result = await service.findByUser(1);

      expect(result).toEqual([mockBooking]);
      expect(mockPrisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 1 },
          orderBy: { createdAt: "desc" },
        }),
      );
    });

    it("should return empty array when user has no bookings", async () => {
      mockPrisma.booking.findMany.mockResolvedValue([]);

      const result = await service.findByUser(999);

      expect(result).toEqual([]);
    });
  });
});
