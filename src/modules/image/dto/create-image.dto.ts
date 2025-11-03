import { IsOptional, IsString, IsNumber } from 'class-validator';

export class CreateImageDto {
  @IsString()
  @IsOptional()
  key?: string;

  @IsString()
  @IsOptional()
  mimeType?: string;

  @IsNumber()
  @IsOptional()
  size?: number;
}

