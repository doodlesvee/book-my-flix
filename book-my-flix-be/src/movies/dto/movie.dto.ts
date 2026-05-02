import { Genre } from "../../generated/prisma/client";

export class CreateMovieDto {
  title!: string;
  description!: string;
  posterUrl?: string;
  releaseDate?: string;
  genre!: Genre;
  runTime!: number;
}

export class UpdateMovieDto {
  title?: string;
  description?: string;
  posterUrl?: string;
  releaseDate?: string;
  genre?: Genre;
  runTime?: number;
}
