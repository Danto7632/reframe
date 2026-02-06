import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThoughtRecord } from './thought-record.entity';
import { ThoughtRecordsService } from './thought-records.service';
import { ThoughtRecordsController } from './thought-records.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [TypeOrmModule.forFeature([ThoughtRecord]), AiModule],
  controllers: [ThoughtRecordsController],
  providers: [ThoughtRecordsService],
  exports: [ThoughtRecordsService],
})
export class ThoughtRecordsModule {}
