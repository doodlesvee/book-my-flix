import {
  IsInt,
  IsArray,
  ValidateNested,
  IsEnum,
  IsOptional,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { SeatCategory } from "../../generated/prisma/enums";

export class SeatLayoutItem {
  @IsEnum(SeatCategory)
  category!: SeatCategory;

  @IsInt()
  @Min(1)
  rows!: number;
}

export class CreateScreenDto {
  @IsInt()
  @Min(1)
  screenNumber!: number;

  @IsInt()
  @Min(1)
  rows!: number;

  @IsInt()
  @Min(1)
  seatsPerRow!: number;

  @IsInt()
  theaterId!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SeatLayoutItem)
  seatLayout!: SeatLayoutItem[];
}

export class UpdateScreenDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  screenNumber?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  rows?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  seatsPerRow?: number;
}
