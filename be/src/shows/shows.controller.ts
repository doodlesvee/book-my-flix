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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
} from "@nestjs/swagger";
import { ShowsService } from "./shows.service";
import { CreateShowDto } from "./dto/show.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Shows")
@Controller("shows")
export class ShowsController {
  constructor(private showsService: ShowsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a show (Admin only)" })
  @ApiResponse({ status: 201, description: "Show created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  @ApiResponse({
    status: 409,
    description: "Show time overlaps with existing show",
  })
  create(@Body() dto: CreateShowDto) {
    return this.showsService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all shows" })
  @ApiQuery({
    name: "screenId",
    required: false,
    description: "Filter by screen ID",
  })
  @ApiQuery({
    name: "movieId",
    required: false,
    description: "Filter by movie ID",
  })
  @ApiResponse({ status: 200, description: "List of shows" })
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
  @ApiOperation({ summary: "Get a show by ID" })
  @ApiResponse({
    status: 200,
    description: "Show found with movie and screen details",
  })
  @ApiResponse({ status: 404, description: "Show not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.showsService.findOne(id);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a show (Admin only)" })
  @ApiResponse({ status: 200, description: "Show deleted" })
  @ApiResponse({ status: 404, description: "Show not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.showsService.remove(id);
  }
}
