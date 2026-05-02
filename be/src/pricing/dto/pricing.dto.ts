import { IsNumber, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { SeatCategory, TimeSlot, DayType } from "../../generated/prisma/client";

export class CreatePricingDto {
  @IsNumber()
  @Min(0)
  price!: number;

  @IsEnum(SeatCategory)
  category!: SeatCategory;

  @IsEnum(TimeSlot)
  slot!: TimeSlot;

  @IsEnum(DayType)
  dayType!: DayType;

  @IsInt()
  theaterId!: number;
}

export class UpdatePricingDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
