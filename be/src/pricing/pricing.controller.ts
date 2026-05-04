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
import { PricingService } from "./pricing.service";
import { CreatePricingDto, UpdatePricingDto } from "./dto/pricing.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";

@ApiTags("Pricing")
@Controller("pricing")
export class PricingController {
  constructor(private pricingService: PricingService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Create a pricing rule (Admin only)" })
  @ApiResponse({ status: 201, description: "Pricing rule created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden - Admin only" })
  @ApiResponse({
    status: 409,
    description: "Pricing rule already exists for this combination",
  })
  create(@Body() dto: CreatePricingDto) {
    return this.pricingService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: "List all pricing rules" })
  @ApiQuery({
    name: "theaterId",
    required: false,
    description: "Filter by theater ID",
  })
  @ApiResponse({ status: 200, description: "List of pricing rules" })
  findAll(@Query("theaterId") theaterId?: string) {
    return this.pricingService.findAll(
      theaterId ? parseInt(theaterId) : undefined,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a pricing rule by ID" })
  @ApiResponse({ status: 200, description: "Pricing rule found" })
  @ApiResponse({ status: 404, description: "Pricing rule not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.pricingService.findOne(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Update a pricing rule (Admin only)" })
  @ApiResponse({ status: 200, description: "Pricing rule updated" })
  @ApiResponse({ status: 404, description: "Pricing rule not found" })
  update(@Param("id", ParseIntPipe) id: number, @Body() dto: UpdatePricingDto) {
    return this.pricingService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Delete a pricing rule (Admin only)" })
  @ApiResponse({ status: 200, description: "Pricing rule deleted" })
  @ApiResponse({ status: 404, description: "Pricing rule not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.pricingService.remove(id);
  }
}
