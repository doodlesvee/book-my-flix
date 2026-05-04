import { IsNumber, IsEnum, IsInt, IsOptional, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SeatCategory, TimeSlot, DayType } from "../../generated/prisma/client";

export class CreatePricingDto {
  @ApiProperty({ example: 250, description: "Price in currency units" })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ enum: SeatCategory, example: "GOLD" })
  @IsEnum(SeatCategory)
  category!: SeatCategory;

  @ApiProperty({ enum: TimeSlot, example: "EVENING" })
  @IsEnum(TimeSlot)
  slot!: TimeSlot;

  @ApiProperty({ enum: DayType, example: "WEEKEND" })
  @IsEnum(DayType)
  dayType!: DayType;

  @ApiProperty({ example: 1 })
  @IsInt()
  theaterId!: number;
}

export class UpdatePricingDto {
  @ApiPropertyOptional({ example: 300 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;
}
