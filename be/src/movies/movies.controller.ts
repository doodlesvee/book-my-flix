import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { MoviesService } from "./movies.service";
import { CreateMovieDto, UpdateMovieDto } from "./dto/movie.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { Genre } from "../generated/prisma/client";

@ApiTags("Movies")
@Controller("movies")
export class MoviesController {
  constructor(private moviesService: MoviesService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a movie (Admin only)" })
  @ApiResponse({ status: 201, description: "Movie created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  create(@Body() dto: CreateMovieDto) {
    return this.moviesService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all movies" })
  @ApiQuery({ name: "title", required: false, description: "Filter by title" })
  @ApiQuery({
    name: "genre",
    required: false,
    enum: Genre,
    description: "Filter by genre",
  })
  @ApiResponse({ status: 200, description: "List of movies" })
  findAll(@Query("title") title?: string, @Query("genre") genre?: Genre) {
    return this.moviesService.findAll(title, genre);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a movie by ID" })
  @ApiResponse({ status: 200, description: "Movie found" })
  @ApiResponse({ status: 404, description: "Movie not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.moviesService.findOne(id);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a movie (Admin only)" })
  @ApiResponse({ status: 200, description: "Movie updated" })
  @ApiResponse({ status: 404, description: "Movie not found" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateMovieDto) {
    return this.moviesService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a movie (Admin only)" })
  @ApiResponse({ status: 200, description: "Movie deleted" })
  @ApiResponse({ status: 404, description: "Movie not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.moviesService.remove(id);
  }
}
