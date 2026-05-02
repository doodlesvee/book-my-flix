export class CreateTheaterDto {
  name!: string;
  city!: string;
  state!: string;
  address!: string;
}

export class UpdateTheaterDto {
  name?: string;
  city?: string;
  state?: string;
  address?: string;
}
