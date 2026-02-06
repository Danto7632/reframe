import {
  IsString, IsOptional, IsEnum, IsArray, IsBoolean, ValidateNested, IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class EmotionEntryDto {
  @IsString()
  name: string;

  @IsNumber()
  intensity: number;
}

class DistortionResultDto {
  @IsString()
  type: string;

  @IsString()
  label: string;

  @IsString()
  reason: string;
}

export class CreateThoughtRecordDto {
  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsEnum(['rejection', 'interview_after', 'coding_test_after', 'acceptance', 'other'])
  situationType: string;

  @IsString()
  situationDetail: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionEntryDto)
  emotionsBefore: EmotionEntryDto[];

  @IsString()
  automaticThought: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistortionResultDto)
  distortions?: DistortionResultDto[];

  @IsOptional()
  @IsString()
  aiReframe?: string;

  @IsOptional()
  @IsString()
  userReframe?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionEntryDto)
  emotionsAfter?: EmotionEntryDto[];

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class UpdateThoughtRecordDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DistortionResultDto)
  distortions?: DistortionResultDto[];

  @IsOptional()
  @IsString()
  aiReframe?: string;

  @IsOptional()
  @IsString()
  userReframe?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => EmotionEntryDto)
  emotionsAfter?: EmotionEntryDto[];

  @IsOptional()
  @IsBoolean()
  isCompleted?: boolean;
}

export class AnalyzeDistortionsDto {
  @IsString()
  thought: string;

  @IsString()
  situationType: string;

  @IsOptional()
  @IsString()
  situationDetail?: string;
}

export class ReframeSuggestionsDto {
  @IsString()
  thought: string;

  @IsArray()
  distortions: string[];

  @IsString()
  situationType: string;

  @IsOptional()
  @IsString()
  company?: string;

  @IsOptional()
  @IsString()
  position?: string;
}
