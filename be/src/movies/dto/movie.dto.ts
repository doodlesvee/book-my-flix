import {
  IsString,
  IsOptional,
  IsEnum,
  IsInt,
  IsDateString,
  Min,
} from "class-validator";
import { Genre } from "../../generated/prisma/client";

export class CreateMovieDto {
  @IsString()
  title!: string;

  @IsString()
  description!: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsEnum(Genre)
  genre!: Genre;

  @IsInt()
  @Min(1)
  runTime!: number;
}

export class UpdateMovieDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsDateString()
  releaseDate?: string;

  @IsOptional()
  @IsEnum(Genre)
  genre?: Genre;

  @IsOptional()
  @IsInt()
  @Min(1)
  runTime?: number;
}
