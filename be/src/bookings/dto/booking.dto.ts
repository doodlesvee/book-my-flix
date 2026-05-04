import { IsInt, IsArray, ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  showId!: number;

  @ApiProperty({ example: [1, 2, 3], description: "Array of seat IDs to book" })
  @IsArray()
  @ArrayMinSize(1)
  @IsInt({ each: true })
  seatIds!: number[];
}
