import { Controller, Get, Post, Patch, Delete, Body, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PipelineStagesService } from './pipeline-stages.service';
import { CreatePipelineStageDto, UpdatePipelineStageDto, ReorderStagesDto } from './pipeline-stages.dto';

const TEMP_USER_ID = 'user-1'; // MVP: no auth

@ApiTags('Pipeline Stages')
@Controller('pipeline-stages')
export class PipelineStagesController {
  constructor(private readonly service: PipelineStagesService) {}

  @Get()
  findAll() {
    return this.service.findAll(TEMP_USER_ID);
  }

  @Post()
  create(@Body() dto: CreatePipelineStageDto) {
    return this.service.create(TEMP_USER_ID, dto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdatePipelineStageDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.service.remove(id);
  }

  @Patch('reorder')
  reorder(@Body() dto: ReorderStagesDto) {
    return this.service.reorder(dto.stages);
  }
}
