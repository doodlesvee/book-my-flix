import { IsString, IsOptional } from "class-validator";

export class CreateTheaterDto {
  @IsString()
  name!: string;

  @IsString()
  city!: string;

  @IsString()
  state!: string;

  @IsString()
  address!: string;
}

export class UpdateTheaterDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
