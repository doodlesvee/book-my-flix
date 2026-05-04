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
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto } from "./dto/booking.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@ApiTags("Bookings")
@ApiBearerAuth()
@Controller("bookings")
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post("lock")
  @ApiOperation({ summary: "Lock seats for 10 minutes" })
  @ApiResponse({ status: 201, description: "Seats locked successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 409,
    description: "One or more seats already booked or locked",
  })
  lockSeats(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.lockSeats(req.user.sub, dto);
  }

  @Post("confirm")
  @ApiOperation({ summary: "Confirm booking after payment" })
  @ApiResponse({ status: 201, description: "Booking confirmed" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 409, description: "Lock expired or not held by user" })
  confirmBooking(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.confirmBooking(req.user.sub, dto);
  }

  @Post("release")
  @ApiOperation({ summary: "Release locked seats" })
  @ApiResponse({ status: 201, description: "Locks released" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  releaseLock(@Req() req: any, @Body() dto: CreateBookingDto) {
    return this.bookingsService.releaseLock(req.user.sub, dto);
  }

  @Patch(":id/cancel")
  @ApiOperation({ summary: "Cancel a confirmed booking" })
  @ApiResponse({ status: 200, description: "Booking cancelled" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Booking not found" })
  cancel(@Req() req: any, @Param("id", ParseIntPipe) id: number) {
    return this.bookingsService.cancel(req.user.sub, id);
  }

  @Get()
  @ApiOperation({ summary: "Get current user's bookings" })
  @ApiResponse({ status: 200, description: "List of user bookings" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  findMyBookings(@Req() req: any) {
    return this.bookingsService.findByUser(req.user.sub);
  }
}
