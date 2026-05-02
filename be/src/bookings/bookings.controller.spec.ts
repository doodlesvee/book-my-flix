import { describe, it, expect, vi, beforeEach } from "vitest";
import { NotFoundException, ConflictException } from "@nestjs/common";
import { BookingsController } from "./bookings.controller";

const mockBooking = {
  id: 1,
  userId: 1,
  showId: 1,
  totalPrice: 400,
  status: "CONFIRMED",
};

const mockBookingsService = {
  lockSeats: vi.fn(),
  confirmBooking: vi.fn(),
  releaseLock: vi.fn(),
  cancel: vi.fn(),
  findByUser: vi.fn(),
};

const mockReq = { user: { sub: 1 } };

describe("BookingsController", () => {
  let controller: BookingsController;

  beforeEach(() => {
    controller = new BookingsController(mockBookingsService as any);
    vi.clearAllMocks();
  });

  describe("lockSeats", () => {
    it("should lock seats for the user", async () => {
      const lockResult = {
        message: "Seats locked for 10 minutes",
        seatIds: [1, 2],
      };
      mockBookingsService.lockSeats.mockResolvedValue(lockResult);

      const result = await controller.lockSeats(mockReq, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result).toEqual(lockResult);
      expect(mockBookingsService.lockSeats).toHaveBeenCalledWith(1, {
        showId: 1,
        seatIds: [1, 2],
      });
    });

    it("should propagate ConflictException", async () => {
      mockBookingsService.lockSeats.mockRejectedValue(
        new ConflictException("Seats already booked"),
      );

      await expect(
        controller.lockSeats(mockReq, { showId: 1, seatIds: [1] }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("confirmBooking", () => {
    it("should confirm a booking", async () => {
      mockBookingsService.confirmBooking.mockResolvedValue(mockBooking);

      const result = await controller.confirmBooking(mockReq, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result).toEqual(mockBooking);
      expect(mockBookingsService.confirmBooking).toHaveBeenCalledWith(1, {
        showId: 1,
        seatIds: [1, 2],
      });
    });

    it("should propagate ConflictException if lock expired", async () => {
      mockBookingsService.confirmBooking.mockRejectedValue(
        new ConflictException("Lock expired"),
      );

      await expect(
        controller.confirmBooking(mockReq, { showId: 1, seatIds: [1] }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe("releaseLock", () => {
    it("should release locked seats", async () => {
      const releaseResult = { message: "Seats released" };
      mockBookingsService.releaseLock.mockResolvedValue(releaseResult);

      const result = await controller.releaseLock(mockReq, {
        showId: 1,
        seatIds: [1, 2],
      });

      expect(result).toEqual(releaseResult);
    });
  });

  describe("cancel", () => {
    it("should cancel a booking", async () => {
      const cancelled = { ...mockBooking, status: "CANCELLED" };
      mockBookingsService.cancel.mockResolvedValue(cancelled);

      const result = await controller.cancel(mockReq, 1);

      expect(result.status).toBe("CANCELLED");
      expect(mockBookingsService.cancel).toHaveBeenCalledWith(1, 1);
    });

    it("should propagate NotFoundException", async () => {
      mockBookingsService.cancel.mockRejectedValue(
        new NotFoundException("Booking not found"),
      );

      await expect(controller.cancel(mockReq, 999)).rejects.toThrow(
        NotFoundException,
      );
    });

    it("should propagate ConflictException for wrong user", async () => {
      mockBookingsService.cancel.mockRejectedValue(
        new ConflictException("You can only cancel your own bookings"),
      );

      await expect(controller.cancel(mockReq, 1)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe("findMyBookings", () => {
    it("should return user's bookings", async () => {
      mockBookingsService.findByUser.mockResolvedValue([mockBooking]);

      const result = await controller.findMyBookings(mockReq);

      expect(result).toEqual([mockBooking]);
      expect(mockBookingsService.findByUser).toHaveBeenCalledWith(1);
    });

    it("should return empty array when user has no bookings", async () => {
      mockBookingsService.findByUser.mockResolvedValue([]);

      const result = await controller.findMyBookings(mockReq);

      expect(result).toEqual([]);
    });
  });
});
