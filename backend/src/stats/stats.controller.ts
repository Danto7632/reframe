import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { StatsService } from './stats.service';

const TEMP_USER_ID = 'user-1';

@ApiTags('stats')
@Controller('stats')
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: '대시보드 통계' })
  getDashboardStats() {
    return this.service.getDashboardStats(TEMP_USER_ID);
  }

  @Get('applications')
  @ApiOperation({ summary: '지원 현황 통계' })
  getApplicationStats() {
    return this.service.getApplicationStats(TEMP_USER_ID);
  }

  @Get('insights')
  @ApiOperation({ summary: 'AI 인사이트' })
  getAiInsights() {
    return this.service.getAiInsights(TEMP_USER_ID);
  }

  @Get('report')
  @ApiOperation({ summary: '심층 리포트' })
  getReport() {
    return this.service.getReport(TEMP_USER_ID);
  }
}
