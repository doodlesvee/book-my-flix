import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMovieDto, UpdateMovieDto } from "./dto/movie.dto";
import { Genre } from "../generated/prisma/client";

@Injectable()
export class MoviesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateMovieDto) {
    return this.prisma.movie.create({
      data: {
        title: dto.title,
        description: dto.description,
        posterUrl: dto.posterUrl,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : null,
        genre: dto.genre,
      },
    });
  }

  async findAll(title?: string, genre?: Genre) {
    return this.prisma.movie.findMany({
      where: {
        ...(title && {
          title: { contains: title, mode: "insensitive" as const },
        }),
        ...(genre && { genre }),
      },
    });
  }

  async findOne(id: number) {
    const movie = await this.prisma.movie.findUnique({ where: { id } });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${id} not found`);
    }
    return movie;
  }

  async update(id: number, dto: UpdateMovieDto) {
    await this.findOne(id);
    return this.prisma.movie.update({
      where: { id },
      data: {
        ...dto,
        releaseDate: dto.releaseDate ? new Date(dto.releaseDate) : undefined,
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.movie.delete({ where: { id } });
  }
}
