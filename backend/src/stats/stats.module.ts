import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../applications/application.entity';
import { ThoughtRecord } from '../thought-records/thought-record.entity';
import { ReframeCard } from '../reframe-cards/reframe-card.entity';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Application, ThoughtRecord, ReframeCard]),
  ],
  controllers: [StatsController],
  providers: [StatsService],
})
export class StatsModule {}
