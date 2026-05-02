import { IsInt, IsArray, ArrayMinSize } from "class-validator";

export class CreateBookingDto {
  @IsInt()
  showId!: number;

  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds!: number[];
}
