import {
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateShowDto } from "./dto/show.dto";
import { TimeSlot } from "../generated/prisma/client";
import { addMinutes, isBefore, isAfter, getHours, parseISO } from "date-fns";

const BUFFER_MINUTES = 15; // cleanup time between shows

@Injectable()
export class ShowsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateShowDto) {
    const showTime = parseISO(dto.showTime);

    // Validate movie exists and get runtime
    const movie = await this.prisma.movie.findUnique({
      where: { id: dto.movieId },
    });
    if (!movie) {
      throw new NotFoundException(`Movie with id ${dto.movieId} not found`);
    }

    // Validate screen exists
    const screen = await this.prisma.screen.findUnique({
      where: { id: dto.screenId },
    });
    if (!screen) {
      throw new NotFoundException(`Screen with id ${dto.screenId} not found`);
    }

    // Calculate new show's end time (runtime + buffer)
    const newShowEnd = addMinutes(showTime, movie.runTime + BUFFER_MINUTES);

    // Check for overlapping shows on the same screen
    const existingShows = await this.prisma.shows.findMany({
      where: { screenId: dto.screenId },
      include: { movie: true },
    });

    const hasConflict = existingShows.some((existing) => {
      const existingStart = existing.showTime;
      const existingEnd = addMinutes(
        existingStart,
        existing.movie.runTime + BUFFER_MINUTES,
      );
      return (
        isBefore(showTime, existingEnd) && isAfter(newShowEnd, existingStart)
      );
    });

    if (hasConflict) {
      throw new ConflictException(
        `Show overlaps with an existing show on this screen`,
      );
    }

    // Derive slot from showtime hour
    const slot: TimeSlot = getHours(showTime) < 12 ? "MORNING" : "EVENING";

    return this.prisma.shows.create({
      data: {
        movieId: dto.movieId,
        screenId: dto.screenId,
        showTime,
        slot,
      },
    });
  }

  async findAll(screenId?: number, movieId?: number) {
    return this.prisma.shows.findMany({
      where: {
        ...(screenId && { screenId }),
        ...(movieId && { movieId }),
      },
      include: { movie: true, screen: true },
    });
  }

  async findOne(id: number) {
    const show = await this.prisma.shows.findUnique({
      where: { id },
      include: { movie: true, screen: true },
    });
    if (!show) {
      throw new NotFoundException(`Show with id ${id} not found`);
    }
    return show;
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.shows.delete({ where: { id } });
  }
}
