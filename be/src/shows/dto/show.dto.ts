import { IsInt, IsDateString } from "class-validator";

export class CreateShowDto {
  @IsInt()
  movieId!: number;

  @IsInt()
  screenId!: number;

  @IsDateString()
  showTime!: string;
}
