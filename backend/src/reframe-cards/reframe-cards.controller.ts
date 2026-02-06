import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { ReframeCardsService } from './reframe-cards.service';
import { CreateReframeCardDto } from './reframe-cards.dto';

const TEMP_USER_ID = 'user-1';

@ApiTags('reframe-cards')
@Controller('reframe-cards')
export class ReframeCardsController {
  constructor(private readonly service: ReframeCardsService) {}

  @Get()
  @ApiOperation({ summary: '리프레임 카드 목록' })
  @ApiQuery({ name: 'bookmarked', required: false })
  findAll(@Query('bookmarked') bookmarked?: string) {
    return this.service.findAll(TEMP_USER_ID, { bookmarked });
  }

  @Get(':id')
  @ApiOperation({ summary: '리프레임 카드 상세' })
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: '리프레임 카드 생성' })
  create(@Body() dto: CreateReframeCardDto) {
    return this.service.create(TEMP_USER_ID, dto);
  }

  @Patch(':id/bookmark')
  @ApiOperation({ summary: '북마크 토글' })
  toggleBookmark(@Param('id') id: string) {
    return this.service.toggleBookmark(id);
  }

  @Patch(':id/use')
  @ApiOperation({ summary: '사용 횟수 증가' })
  incrementUseCount(@Param('id') id: string) {
    return this.service.incrementUseCount(id);
  }

  @Patch(':id/effect-score')
  @ApiOperation({ summary: '효과 점수 업데이트' })
  updateEffectScore(@Param('id') id: string, @Body('score') score: number) {
    return this.service.updateEffectScore(id, score);
  }

  @Delete(':id')
  @ApiOperation({ summary: '리프레임 카드 삭제' })
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
