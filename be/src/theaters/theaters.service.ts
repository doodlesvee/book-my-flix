import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTheaterDto, UpdateTheaterDto } from "./dto/theater.dto";

@Injectable()
export class TheatersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateTheaterDto) {
    return this.prisma.theater.create({
      data: {
        name: dto.name,
        city: dto.city,
        state: dto.state,
        address: dto.address,
      },
    });
  }

  async findAll(city?: string) {
    return this.prisma.theater.findMany({
      where: {
        ...(city && { city: { contains: city, mode: "insensitive" as const } }),
      },
    });
  }

  async findOne(id: number) {
    const theater = await this.prisma.theater.findUnique({ where: { id } });
    if (!theater) {
      throw new NotFoundException(`Theater with id ${id} not found`);
    }
    return theater;
  }

  async update(id: number, dto: UpdateTheaterDto) {
    await this.findOne(id);
    return this.prisma.theater.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.theater.delete({ where: { id } });
  }
}
