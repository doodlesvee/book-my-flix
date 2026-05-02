import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { TheatersService } from "./theaters.service";
import { CreateTheaterDto, UpdateTheaterDto } from "./dto/theater.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@Controller("theaters")
export class TheatersController {
  constructor(private theaterService: TheatersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  create(@Body() dto: CreateTheaterDto) {
    return this.theaterService.create(dto);
  }

  @Get()
  findAll(@Query("city") city?: string) {
    return this.theaterService.findAll(city);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.theaterService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTheaterDto) {
    return this.theaterService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.theaterService.remove(id);
  }
}
