import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from './applications.service';
import {
  CreateApplicationDto, UpdateApplicationDto,
  UpdateStageDto, RejectApplicationDto,
} from './applications.dto';

const TEMP_USER_ID = 'user-1';

@ApiTags('Applications')
@Controller('applications')
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  @Get()
  findAll(
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.service.findAll(TEMP_USER_ID, { status, search });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateApplicationDto) {
    return this.service.create(TEMP_USER_ID, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateApplicationDto) {
    return this.service.update(id, dto);
  }

  @Patch(':id/stage')
  updateStage(@Param('id') id: string, @Body() dto: UpdateStageDto) {
    return this.service.updateStage(id, dto.stageId, dto.memo);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: RejectApplicationDto) {
    return this.service.reject(id, dto.memo);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
