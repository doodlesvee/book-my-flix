import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private client: PrismaClient;

  constructor() {
    const adapter = new PrismaPg({
      connectionString: process.env.DATABASE_URL,
    });

    this.client = new PrismaClient({ adapter });
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }

  get user() {
    return this.client.user;
  }

  get movie() {
    return this.client.movie;
  }

  get theater() {
    return this.client.theater;
  }

  get screen() {
    return this.client.screen;
  }

  get pricing() {
    return this.client.pricing;
  }

  get seat() {
    return this.client.seat;
  }

  get shows() {
    return this.client.shows;
  }

  get booking() {
    return this.client.booking;
  }

  get bookedSeat() {
    return this.client.bookedSeat;
  }

  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }
}
