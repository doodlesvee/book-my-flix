import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateScreenDto, UpdateScreenDto } from "./dto/screen.dto";

@Injectable()
export class ScreensService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateScreenDto) {
    const totalLayoutRows = dto.seatLayout.reduce((sum, l) => sum + l.rows, 0);
    if (totalLayoutRows !== dto.rows) {
      throw new BadRequestException(
        `Seat layout rows (${totalLayoutRows}) must equal total rows (${dto.rows})`,
      );
    }

    return this.prisma.$transaction(async (tx) => {
      const screen = await tx.screen.create({
        data: {
          screenNumber: dto.screenNumber,
          rows: dto.rows,
          seatsPerRow: dto.seatsPerRow,
          theaterId: dto.theaterId,
        },
      });

      const seats: {
        row: string;
        seatNumber: number;
        category: any;
        screenId: number;
      }[] = [];
      let rowIndex = 0;

      for (const layout of dto.seatLayout) {
        for (let r = 0; r < layout.rows; r++) {
          const rowLabel = String.fromCharCode(65 + rowIndex);
          for (let s = 1; s <= dto.seatsPerRow; s++) {
            seats.push({
              row: rowLabel,
              seatNumber: s,
              category: layout.category,
              screenId: screen.id,
            });
          }
          rowIndex++;
        }
      }

      await tx.seat.createMany({ data: seats });

      return screen;
    });
  }

  async findAll(theaterId?: number) {
    return this.prisma.screen.findMany({
      where: {
        ...(theaterId && { theaterId }),
      },
    });
  }

  async findOne(id: number) {
    const screen = await this.prisma.screen.findUnique({ where: { id } });
    if (!screen) {
      throw new NotFoundException(`Screen with id ${id} not found`);
    }
    return screen;
  }

  async update(id: number, dto: UpdateScreenDto) {
    await this.findOne(id);
    return this.prisma.screen.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.screen.delete({ where: { id } });
  }
}
