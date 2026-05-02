import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ShowsService } from "./shows.service";
import { CreateShowDto } from "./dto/show.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("shows")
export class ShowsController {
  constructor(private showsService: ShowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateShowDto) {
    return this.showsService.create(dto);
  }

  @Get()
  findAll(
    @Query("screenId") screenId?: string,
    @Query("movieId") movieId?: string,
  ) {
    return this.showsService.findAll(
      screenId ? parseInt(screenId) : undefined,
      movieId ? parseInt(movieId) : undefined,
    );
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.showsService.findOne(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.showsService.remove(id);
  }
}
