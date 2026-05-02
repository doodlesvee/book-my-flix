import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreatePricingDto, UpdatePricingDto } from "./dto/pricing.dto";

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreatePricingDto) {
    try {
      return await this.prisma.pricing.create({
        data: {
          price: dto.price,
          category: dto.category,
          slot: dto.slot,
          dayType: dto.dayType,
          theaterId: dto.theaterId,
        },
      });
    } catch (error: any) {
      if (error.code === "P2002") {
        throw new ConflictException(
          `Pricing for ${dto.category}/${dto.slot}/${dto.dayType} already exists for this theater`,
        );
      }
      throw error;
    }
  }

  async findAll(theaterId?: number) {
    return this.prisma.pricing.findMany({
      where: {
        ...(theaterId && { theaterId }),
      },
    });
  }

  async findOne(id: number) {
    const pricing = await this.prisma.pricing.findUnique({ where: { id } });
    if (!pricing) {
      throw new NotFoundException(`Pricing with id ${id} not found`);
    }
    return pricing;
  }

  async update(id: number, dto: UpdatePricingDto) {
    await this.findOne(id);
    return this.prisma.pricing.update({
      where: { id },
      data: { ...dto },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.pricing.delete({ where: { id } });
  }
}
