import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class SeatsService {
  constructor(private prisma: PrismaService) {}

  async findByScreen(screenId: number) {
    return this.prisma.seat.findMany({
      where: { screenId },
      orderBy: [{ row: "asc" }, { seatNumber: "asc" }],
    });
  }
}
