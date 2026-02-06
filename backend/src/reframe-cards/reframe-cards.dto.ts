import { IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class CreateReframeCardDto {
  @IsString()
  thoughtRecordId: string;

  @IsString()
  content: string;

  @IsString()
  distortionType: string;

  @IsOptional()
  @IsNumber()
  effectScore?: number;
}
