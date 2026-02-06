import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReframeCard } from './reframe-card.entity';
import { ReframeCardsService } from './reframe-cards.service';
import { ReframeCardsController } from './reframe-cards.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ReframeCard])],
  controllers: [ReframeCardsController],
  providers: [ReframeCardsService],
  exports: [ReframeCardsService],
})
export class ReframeCardsModule {}
