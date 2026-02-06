import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApplicationsModule } from './applications/applications.module';
import { PipelineStagesModule } from './pipeline-stages/pipeline-stages.module';
import { ThoughtRecordsModule } from './thought-records/thought-records.module';
import { ReframeCardsModule } from './reframe-cards/reframe-cards.module';
import { StatsModule } from './stats/stats.module';
import { AiModule } from './ai/ai.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        host: config.get('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 3306),
        username: config.get('DB_USERNAME', 'root'),
        password: config.get('DB_PASSWORD', ''),
        database: config.get('DB_DATABASE', 'reframe'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // dev only
        charset: 'utf8mb4',
        logging: false,
      }),
    }),
    ApplicationsModule,
    PipelineStagesModule,
    ThoughtRecordsModule,
    ReframeCardsModule,
    StatsModule,
    AiModule,
  ],
})
export class AppModule {}
