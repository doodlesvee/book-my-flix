import { SeatCategory, TimeSlot, DayType } from "../../generated/prisma/client";

export class CreatePricingDto {
  price!: number;
  category!: SeatCategory;
  slot!: TimeSlot;
  dayType!: DayType;
  theaterId!: number;
}

export class UpdatePricingDto {
  price?: number;
}
