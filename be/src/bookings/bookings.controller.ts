import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post("lock")
  lockSeats(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.lockSeats(req.user.sub, dto);
  }

  @Post("confirm")
  confirmBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.confirmBooking(req.user.sub, dto);
  }

  @Post("release")
  releaseLock(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.releaseLock(req.user.sub, dto);
  }

  @Patch(":id/cancel")
  cancel(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    return this.bookingsService.cancel(req.user.sub, id);
  }

  @Get()
  findMyBookings(@Req() req: any) {
    return this.bookingsService.findByUser(req.user.sub);
  }
}
