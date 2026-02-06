import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from './application.entity';
import { ApplicationsService } from './applications.service';
import { ApplicationsController } from './applications.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Application])],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService],
})
export class ApplicationsModule {}
