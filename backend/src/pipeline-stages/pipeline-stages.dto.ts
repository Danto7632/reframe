import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreatePipelineStageDto {
  @IsString()
  label: string;

  @IsNumber()
  order: number;

  @IsOptional()
  @IsString()
  encouragement?: string;
}

export class UpdatePipelineStageDto {
  @IsOptional()
  @IsString()
  label?: string;

  @IsOptional()
  @IsNumber()
  order?: number;

  @IsOptional()
  @IsString()
  encouragement?: string;
}

export class ReorderStagesDto {
  stages: { id: string; order: number }[];
}
