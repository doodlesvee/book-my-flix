import { Injectable, OnModuleDestroy } from "@nestjs/common";
import Redis from "ioredis";

const LOCK_TTL_SECONDS = 600; // 10 minutes

@Injectable()
export class RedisService implements OnModuleDestroy {
  private client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST || "localhost",
      port: parseInt(process.env.REDIS_PORT || "6379"),
    });
  }

  async onModuleDestroy() {
    await this.client.quit();
  }

  /**
   * Lock a seat for a show. Returns true if lock acquired, false if already locked.
   */
  async lockSeat(
    seatId: number,
    showId: number,
    userId: number,
  ): Promise<boolean> {
    const key = `seat-lock:${showId}:${seatId}`;
    const result = await this.client.set(
      key,
      userId.toString(),
      "EX",
      LOCK_TTL_SECONDS,
      "NX",
    );
    return result === "OK";
  }

  /**
   * Unlock a seat (release the lock).
   */
  async unlockSeat(seatId: number, showId: number): Promise<void> {
    const key = `seat-lock:${showId}:${seatId}`;
    await this.client.del(key);
  }

  /**
   * Check if a seat is locked and by whom.
   */
  async getSeatLock(seatId: number, showId: number): Promise<string | null> {
    const key = `seat-lock:${showId}:${seatId}`;
    return this.client.get(key);
  }

  /**
   * Lock multiple seats atomically. Returns true only if ALL locks acquired.
   * If any fails, releases all.
   */
  async lockSeats(
    seatIds: number[],
    showId: number,
    userId: number,
  ): Promise<boolean> {
    const lockedSeats: number[] = [];

    for (const seatId of seatIds) {
      const locked = await this.lockSeat(seatId, showId, userId);
      if (!locked) {
        // Rollback: release all previously locked seats
        for (const lockedId of lockedSeats) {
          await this.unlockSeat(lockedId, showId);
        }
        return false;
      }
      lockedSeats.push(seatId);
    }

    return true;
  }

  /**
   * Unlock multiple seats.
   */
  async unlockSeats(seatIds: number[], showId: number): Promise<void> {
    for (const seatId of seatIds) {
      await this.unlockSeat(seatId, showId);
    }
  }
}
