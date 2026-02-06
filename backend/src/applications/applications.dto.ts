import { IsString, IsOptional, IsDateString, IsEnum, IsBoolean } from 'class-validator';

export class CreateApplicationDto {
  @IsString()
  company: string;

  @IsString()
  position: string;

  @IsDateString()
  appliedAt: string;

  @IsOptional()
  @IsEnum(['file', 'link', 'label'])
  resumeType?: 'file' | 'link' | 'label';

  @IsOptional()
  @IsString()
  resumeValue?: string;

  @IsOptional()
  @IsString()
  currentStageId?: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdateApplicationDto {
  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  appliedAt?: string;

  @IsOptional()
  @IsEnum(['file', 'link', 'label'])
  resumeType?: 'file' | 'link' | 'label';

  @IsOptional()
  @IsString()
  resumeValue?: string;

  @IsOptional()
  @IsString()
  currentStageId?: string;

  @IsOptional()
  @IsBoolean()
  isRejected?: boolean;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class UpdateStageDto {
  @IsString()
  stageId: string;

  @IsOptional()
  @IsString()
  memo?: string;
}

export class RejectApplicationDto {
  @IsOptional()
  @IsString()
  memo?: string;
}
