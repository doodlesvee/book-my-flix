import { Controller, Get, Query, ParseIntPipe } from "@nestjs/common";
import { SeatsService } from "./seats.service";

@Controller("seats")
export class SeatsController {
  constructor(private seatsService: SeatsService) {}

  @Get()
  findByScreen(@Query("screenId", ParseIntPipe) screenId: number) {
    return this.seatsService.findByScreen(screenId);
  }
}
