import { SeatCategory } from "../../generated/prisma/enums";

export class CreateScreenDto {
  screenNumber!: number;
  rows!: number;
  seatsPerRow!: number;
  theaterId!: number;
  seatLayout!: { category: SeatCategory; rows: number }[];
}

export class UpdateScreenDto {
  screenNumber?: number;
  rows?: number;
  seatsPerRow?: number;
}
