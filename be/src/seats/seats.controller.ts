import { Controller, Get, Query, ParseIntPipe } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from "@nestjs/swagger";
import { SeatsService } from "./seats.service";

@ApiTags("Seats")
@Controller("seats")
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Get()
  @ApiOperation({ summary: "List seats for a screen" })
  @ApiQuery({ name: "screenId", required: true, description: "Screen ID" })
  @ApiResponse({ status: 200, description: "List of seats" })
  findByScreen(@Query("screenId", ParseIntPipe) screenId: number) {
    return this.seatsService.findByScreen(screenId);
  }
}
