import { IsInt, IsDateString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateShowDto {
  @ApiProperty({ example: 1 })
  @IsInt()
  movieId!: number;

  @ApiProperty({ example: 1 })
  @IsInt()
  screenId!: number;

  @ApiProperty({
    example: "2024-07-20T14:00:00.000Z",
    description: "Show time in ISO format",
  })
  @IsDateString()
  showTime!: string;
}
