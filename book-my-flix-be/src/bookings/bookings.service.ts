import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedisService } from "../redis/redis.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { getHours, getDay } from "date-fns";
import { TimeSlot, DayType, SeatCategory } from "../generated/prisma/client";

@Injectable()
export class BookingsService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  /**
   * Step 1: Lock seats — user selects seats, we lock them in Redis for 10 min
   */
  async lockSeats(userId: number, dto: CreateBookingDto) {
    // Validate show exists
    const show = await this.prisma.shows.findUnique({
      where: { id: dto.showId },
    });
    if (!show) {
      throw new NotFoundException(`Show with id ${dto.showId} not found`);
    }

    // Check if seats are already booked in DB
    const alreadyBooked = await this.prisma.bookedSeat.findMany({
      where: {
        showId: dto.showId,
        seatId: { in: dto.seatIds },
      },
    });
    if (alreadyBooked.length > 0) {
      throw new ConflictException(
        `Seats ${alreadyBooked.map((s) => s.seatId).join(", ")} are already booked`,
      );
    }

    // Try to lock seats in Redis
    const locked = await this.redis.lockSeats(dto.seatIds, dto.showId, userId);
    if (!locked) {
      throw new ConflictException(
        "Some seats are currently being held by another user. Try again shortly.",
      );
    }

    return { message: "Seats locked for 10 minutes", seatIds: dto.seatIds };
  }

  /**
   * Step 2: Confirm booking — after payment, create booking in DB
   */
  async confirmBooking(userId: number, dto: CreateBookingDto) {
    // Validate show exists and get screen info
    const show = await this.prisma.shows.findUnique({
      where: { id: dto.showId },
      include: { screen: true },
    });
    if (!show) {
      throw new NotFoundException(`Show with id ${dto.showId} not found`);
    }

    // Verify the user holds the locks
    for (const seatId of dto.seatIds) {
      const lockedBy = await this.redis.getSeatLock(seatId, dto.showId);
      if (lockedBy !== userId.toString()) {
        throw new ConflictException(
          `Seat ${seatId} is not locked by you. Lock may have expired.`,
        );
      }
    }

    // Get seat details for price calculation
    const seats = await this.prisma.seat.findMany({
      where: { id: { in: dto.seatIds } },
    });

    // Derive slot and dayType from showTime
    const hour = getHours(show.showTime);
    const day = getDay(show.showTime);
    const slot: TimeSlot = hour < 12 ? "MORNING" : "EVENING";
    const dayType: DayType = day === 0 || day === 6 ? "WEEKEND" : "WEEKDAY";

    // Get theater ID from screen
    const theaterId = show.screen.theaterId;

    // Look up prices for each seat category
    const pricing = await this.prisma.pricing.findMany({
      where: {
        theaterId,
        slot,
        dayType,
      },
    });

    const priceMap = new Map<SeatCategory, number>();
    for (const p of pricing) {
      priceMap.set(p.category, Number(p.price));
    }

    // Calculate per-seat prices
    const seatPrices = seats.map((seat) => {
      const price = priceMap.get(seat.category);
      if (price === undefined) {
        throw new NotFoundException(
          `No pricing found for ${seat.category}/${slot}/${dayType} at this theater`,
        );
      }
      return { seatId: seat.id, price };
    });

    const totalPrice = seatPrices.reduce((sum, sp) => sum + sp.price, 0);

    // Create booking + booked seats in a transaction
    const booking = await this.prisma.$transaction(async (tx) => {
      const booking = await tx.booking.create({
        data: {
          userId,
          showId: dto.showId,
          totalPrice,
          status: "CONFIRMED",
        },
      });

      await tx.bookedSeat.createMany({
        data: seatPrices.map((sp) => ({
          bookingId: booking.id,
          seatId: sp.seatId,
          showId: dto.showId,
          price: sp.price,
        })),
      });

      return booking;
    });

    // Release Redis locks (seats are now permanently booked in DB)
    await this.redis.unlockSeats(dto.seatIds, dto.showId);

    return booking;
  }

  /**
   * Release locked seats (user cancels before payment)
   */
  async releaseLock(userId: number, dto: CreateBookingDto) {
    for (const seatId of dto.seatIds) {
      const lockedBy = await this.redis.getSeatLock(seatId, dto.showId);
      if (lockedBy === userId.toString()) {
        await this.redis.unlockSeat(seatId, dto.showId);
      }
    }
    return { message: "Seats released" };
  }

  /**
   * Cancel a confirmed booking
   */
  async cancel(userId: number, bookingId: number) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: { bookedSeats: true },
    });
    if (!booking) {
      throw new NotFoundException(`Booking with id ${bookingId} not found`);
    }
    if (booking.userId !== userId) {
      throw new ConflictException("You can only cancel your own bookings");
    }
    if (booking.status === "CANCELLED") {
      throw new ConflictException("Booking is already cancelled");
    }

    return this.prisma.booking.update({
      where: { id: bookingId },
      data: { status: "CANCELLED" },
    });
  }

  /**
   * Get user's bookings
   */
  async findByUser(userId: number) {
    return this.prisma.booking.findMany({
      where: { userId },
      include: {
        show: {
          include: { movie: true, screen: { include: { theater: true } } },
        },
        bookedSeats: { include: { seat: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
