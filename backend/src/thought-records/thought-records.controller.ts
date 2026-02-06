import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ThoughtRecordsService } from './thought-records.service';
import {
  CreateThoughtRecordDto,
  UpdateThoughtRecordDto,
  AnalyzeDistortionsDto,
  ReframeSuggestionsDto,
} from './thought-records.dto';

const TEMP_USER_ID = 'user-1';

@ApiTags('thought-records')
@Controller('thought-records')
export class ThoughtRecordsController {
  constructor(private readonly service: ThoughtRecordsService) {}

  @Get()
  @ApiOperation({ summary: '사고 기록 목록' })
  @ApiQuery({ name: 'applicationId', required: false })
  @ApiQuery({ name: 'completed', required: false })
  findAll(
    @Query('applicationId') applicationId?: string,
    @Query('completed') completed?: string,
  ) {
    return this.service.findAll(TEMP_USER_ID, { applicationId, completed });
  }

  @Get('emotion-trends')
  @ApiOperation({ summary: '감정 변화 추이' })
  getEmotionTrends() {
    return this.service.getEmotionTrends(TEMP_USER_ID);
  }

  @Get('distortion-distribution')
  @ApiOperation({ summary: '인지 왜곡 분포' })
  getDistortionDistribution() {
    return this.service.getDistortionDistribution(TEMP_USER_ID);
  }

  @Get(':id')
  @ApiOperation({ summary: '사고 기록 상세' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '사고 기록 생성' })
  create(@Body() dto: CreateThoughtRecordDto) {
    return this.service.create(TEMP_USER_ID, dto);
  }

  @Put(':id')
  @ApiOperation({ summary: '사고 기록 수정' })
  update(@Param('id') id: string, @Body() dto: UpdateThoughtRecordDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '사고 기록 삭제' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Post('analyze-distortions')
  @ApiOperation({ summary: 'AI 인지 왜곡 분석' })
  analyzeDistortions(@Body() dto: AnalyzeDistortionsDto) {
    return this.service.analyzeDistortions(
      dto.thought,
      dto.situationType,
      dto.situationDetail,
    );
  }

  @Post('reframe-suggestions')
  @ApiOperation({ summary: 'AI 재구조화 제안' })
  getReframeSuggestions(@Body() dto: ReframeSuggestionsDto) {
    return this.service.getReframeSuggestions(
      dto.thought,
      dto.distortions,
      dto.situationType,
      dto.company,
      dto.position,
    );
  }
}
