import { IsString, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateTheaterDto {
  @ApiProperty({ example: "PVR Cinemas" })
  @IsString()
  name!: string;

  @ApiProperty({ example: "Mumbai" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "Maharashtra" })
  @IsString()
  state!: string;

  @ApiProperty({ example: "123 Main Street" })
  @IsString()
  address!: string;
}

export class UpdateTheaterDto {
  @ApiPropertyOptional({ example: "PVR Cinemas" })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: "Mumbai" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ example: "Maharashtra" })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiPropertyOptional({ example: "123 Main Street" })
  @IsOptional()
  @IsString()
  address?: string;
}
