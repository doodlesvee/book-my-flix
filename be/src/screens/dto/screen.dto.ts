import {
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { SeatCategory } from "../../generated/prisma/enums";

export class SeatLayoutItem {
  @ApiProperty({ enum: SeatCategory, example: "GOLD" })
  @IsEnum(SeatCategory)
  category!: SeatCategory;

  @ApiProperty({ example: 3, description: "Number of rows for this category" })
  @IsInt()
  @Min(1)
  rows!: number;
}

export class CreateScreenDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  @Min(1)
  screenNumber!: number;

  @ApiProperty({ example: 10, description: "Total number of rows" })
  @IsInt()
  @Min(1)
  rows!: number;

  @ApiProperty({ example: 12, description: "Number of seats per row" })
  @IsInt()
  @Min(1)
  seatsPerRow!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  theaterId!: number;

  @ApiProperty({
    type: [SeatLayoutItem],
    description: "Seat layout by category",
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatLayoutItem)
  seatLayout!: SeatLayoutItem[];
}

export class UpdateScreenDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  screenNumber?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  rows?: number;

  @ApiPropertyOptional({ example: 12 })
  @IsOptional()
  @IsInt()
  @Min(1)
  seatsPerRow?: number;
}
