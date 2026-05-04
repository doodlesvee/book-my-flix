import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Genre } from "../../generated/prisma/client";

export class CreateMovieDto {
  @ApiProperty({ example: "Inception" })
  @IsString()
  title!: string;

  @ApiProperty({ example: "A mind-bending thriller" })
  @IsString()
  description!: string;

  @ApiPropertyOptional({ example: "https://example.com/poster.jpg" })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiPropertyOptional({ example: "2024-07-16" })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiProperty({ enum: Genre, example: "ACTION" })
  @IsEnum(Genre)
  genre!: Genre;

  @ApiProperty({ example: 148, description: "Runtime in minutes" })
  @IsInt()
  @Min(1)
  runTime!: number;
}

export class UpdateMovieDto {
  @ApiPropertyOptional({ example: "Inception" })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: "A mind-bending thriller" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: "https://example.com/poster.jpg" })
  @IsOptional()
  @IsString()
  posterUrl?: string;

  @ApiPropertyOptional({ example: "2024-07-16" })
  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @ApiPropertyOptional({ enum: Genre, example: "ACTION" })
  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;

  @ApiPropertyOptional({ example: 148, description: "Runtime in minutes" })
  @IsOptional()
  @IsInt()
  @Min(1)
  runTime?: number;
}
