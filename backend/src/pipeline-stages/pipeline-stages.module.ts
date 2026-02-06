import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PipelineStage } from './pipeline-stage.entity';
import { PipelineStagesService } from './pipeline-stages.service';
import { PipelineStagesController } from './pipeline-stages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([PipelineStage])],
  controllers: [PipelineStagesController],
  providers: [PipelineStagesService],
  exports: [PipelineStagesService],
})
export class PipelineStagesModule {}
