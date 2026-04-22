import { Genre } from "../../generated/prisma/client";

export class CreateMovieDto {
  title!: string;
  description!: string;
  posterUrl?: string;
  releaseDate?: string;
  genre!: Genre;
}

export class UpdateMovieDto {
  title?: string;
  description?: string;
  posterUrl?: string;
  releaseDate?: string;
  genre?: Genre;
}
