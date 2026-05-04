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
import { ScreensService } from "./screens.service";
import { CreateScreenDto, UpdateScreenDto } from "./dto/screen.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Screens")
@Controller("screens")
export class ScreensController {
  constructor(private screensService: ScreensService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a screen with seat layout (Admin only)" })
  @ApiResponse({ status: 201, description: "Screen created with seats" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  create(@Body() dto: CreateScreenDto) {
    return this.screensService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all screens" })
  @ApiQuery({
    name: "theaterId",
    required: false,
    description: "Filter by theater ID",
  })
  @ApiResponse({ status: 200, description: "List of screens" })
  findAll(@Query("theaterId") theaterId?: string) {
    return this.screensService.findAll(
      theaterId ? parseInt(theaterId) : undefined,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a screen by ID" })
  @ApiResponse({ status: 200, description: "Screen found" })
  @ApiResponse({ status: 404, description: "Screen not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.screensService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a screen (Admin only)" })
  @ApiResponse({ status: 200, description: "Screen updated" })
  @ApiResponse({ status: 404, description: "Screen not found" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdateScreenDto) {
    return this.screensService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a screen (Admin only)" })
  @ApiResponse({ status: 200, description: "Screen deleted" })
  @ApiResponse({ status: 404, description: "Screen not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.screensService.remove(id);
  }
}
