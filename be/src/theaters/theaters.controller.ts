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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { TheatersService } from "./theaters.service";
import { CreateTheaterDto, UpdateTheaterDto } from "./dto/theater.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Theaters")
@Controller("theaters")
export class TheatersController {
  constructor(private theaterService: TheatersService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a theater (Admin only)" })
  @ApiResponse({ status: 201, description: "Theater created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  create(@Body() dto: CreateTheaterDto) {
    return this.theaterService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all theaters" })
  @ApiQuery({ name: "city", required: false, description: "Filter by city" })
  @ApiResponse({ status: 200, description: "List of theaters" })
  findAll(@Query("city") city?: string) {
    return this.theaterService.findAll(city);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a theater by ID" })
  @ApiResponse({ status: 200, description: "Theater found" })
  @ApiResponse({ status: 404, description: "Theater not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.theaterService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a theater (Admin only)" })
  @ApiResponse({ status: 200, description: "Theater updated" })
  @ApiResponse({ status: 404, description: "Theater not found" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateTheaterDto) {
    return this.theaterService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a theater (Admin only)" })
  @ApiResponse({ status: 200, description: "Theater deleted" })
  @ApiResponse({ status: 404, description: "Theater not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.theaterService.remove(id);
  }
}
